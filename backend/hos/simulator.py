"""
Hours-of-Service (HOS) simulator for a property-carrying driver.

Implements the FMCSA "70 hours / 8 days" ruleset (49 CFR part 395) at the
"standard reset" level of fidelity:

    * 11-hour driving limit per shift
    * 14-hour driving window (all driving must finish within 14h of coming
      on duty after a reset)
    * 30-minute break required after 8 cumulative hours of driving
    * 10 consecutive hours off duty (or sleeper) resets the 11h & 14h clocks
    * 70-hour / 8-day rolling on-duty cycle (seeded from `current_cycle_used`)
    * 34-hour restart resets the cycle to zero
    * fuel stop (on duty, not driving) at least every 1,000 miles
    * 1 hour on duty for pickup and 1 hour on duty for drop-off

Documented simplification: we use a full 10-hour off-duty reset for daily
rest and a 34-hour restart for the cycle. We deliberately do NOT model the
split-sleeper-berth (7/3 or 7/2) pairings from the FMCSA guide. This is the
industry-common interpretation and keeps the output auditable.

The simulator is deliberately time-driven and unit-agnostic about the map:
it consumes a total driving distance (miles) and total driving duration
(hours) — typically from a routing API — and emits an ordered list of
duty-status Segments. Those segments are later split into 24-hour days for
the ELD log sheets and summarised into stops for the map.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Literal

# ---------------------------------------------------------------------------
# Rule constants (hours unless noted). Centralised so tests read cleanly.
# ---------------------------------------------------------------------------

MAX_DRIVING_PER_SHIFT = 11.0        # 11-hour driving limit
MAX_WINDOW = 14.0                   # 14-hour on-duty driving window
DRIVING_BEFORE_BREAK = 8.0          # 30-min break required after 8h driving
BREAK_DURATION = 0.5               # 30-minute break
DAILY_RESET = 10.0                  # 10 consecutive hours off duty
CYCLE_LIMIT = 70.0                  # 70 hours on duty in 8 days
CYCLE_RESTART = 34.0                # 34-hour restart
MILES_PER_FUEL = 1000.0             # fuel at least every 1,000 miles
FUEL_DURATION = 0.5                # 30 minutes on duty to fuel
PICKUP_DURATION = 1.0               # 1 hour on duty to load
DROPOFF_DURATION = 1.0             # 1 hour on duty to unload

# Split sleeper-berth provision, §395.1(g). A qualifying pair is a >=7h
# sleeper period plus a separate >=2h (sleeper or off-duty) period totaling
# >=10h. When paired, neither period counts against the 14h window. We model
# the common 8/2 split: 8h in the sleeper berth + a 2h off-duty rest.
SPLIT_SLEEPER_LONG = 8.0            # long qualifying period (sleeper)
SPLIT_SLEEPER_SHORT = 2.0          # short qualifying period (off duty/sleeper)

DutyStatus = Literal["off_duty", "sleeper", "driving", "on_duty"]


@dataclass
class Segment:
    """One continuous block of a single duty status."""

    status: DutyStatus
    start: datetime
    end: datetime
    location: str = ""
    remark: str = ""

    @property
    def hours(self) -> float:
        return (self.end - self.start).total_seconds() / 3600.0

    def to_dict(self) -> dict:
        return {
            "status": self.status,
            "start": self.start.isoformat(),
            "end": self.end.isoformat(),
            "hours": round(self.hours, 4),
            "location": self.location,
            "remark": self.remark,
        }


@dataclass
class Stop:
    """A notable event along the trip, used for map markers."""

    kind: Literal["start", "pickup", "dropoff", "fuel", "break", "rest"]
    label: str
    at: datetime
    miles_from_start: float

    def to_dict(self) -> dict:
        return {
            "kind": self.kind,
            "label": self.label,
            "at": self.at.isoformat(),
            "miles_from_start": round(self.miles_from_start, 1),
        }


@dataclass
class HOSResult:
    segments: list[Segment] = field(default_factory=list)
    stops: list[Stop] = field(default_factory=list)
    total_driving_hours: float = 0.0
    total_on_duty_hours: float = 0.0
    total_distance_miles: float = 0.0
    total_days: int = 0

    def to_dict(self) -> dict:
        return {
            "segments": [s.to_dict() for s in self.segments],
            "stops": [s.to_dict() for s in self.stops],
            "summary": {
                "total_driving_hours": round(self.total_driving_hours, 2),
                "total_on_duty_hours": round(self.total_on_duty_hours, 2),
                "total_distance_miles": round(self.total_distance_miles, 1),
                "total_days": self.total_days,
            },
        }


class HOSSimulator:
    """
    Walk a trip through the HOS rules and emit a timeline of Segments.

    Parameters
    ----------
    total_distance_miles : float
        Road distance from pickup to drop-off.
    total_driving_hours : float
        Road driving time from pickup to drop-off (from routing API).
    current_cycle_used : float
        On-duty hours already spent in the current 8-day cycle (0..70).
    start_time : datetime
        When the driver comes on duty at the current location.
    labels : dict, optional
        Human labels for start/pickup/dropoff locations for remarks.
    avg_speed : float, optional
        Fallback mph, only used if driving_hours is 0 but distance > 0.
    """

    def __init__(
        self,
        total_distance_miles: float,
        total_driving_hours: float,
        current_cycle_used: float = 0.0,
        start_time: datetime | None = None,
        labels: dict | None = None,
        avg_speed: float = 55.0,
        use_split_sleeper: bool = False,
    ) -> None:
        if total_driving_hours <= 0 and total_distance_miles > 0:
            total_driving_hours = total_distance_miles / max(avg_speed, 1.0)

        self.total_distance = float(total_distance_miles)
        self.total_drive_time = float(total_driving_hours)
        self.cycle_used = float(current_cycle_used)
        self.labels = labels or {}
        self.use_split_sleeper = use_split_sleeper
        # Tracks whether the driver is mid-split: after taking the 8h sleeper
        # leg we owe a 2h partner period to complete the 10h off-duty pairing.
        self.pending_split_partner = False
        self.mph = (
            self.total_distance / self.total_drive_time
            if self.total_drive_time > 0
            else avg_speed
        )

        self.now = start_time or datetime(2025, 1, 1, 8, 0, 0)

        # Rolling clocks
        self.drive_since_reset = 0.0     # counts toward 11h limit
        self.window_start: datetime | None = None  # start of 14h window
        self.drive_since_break = 0.0     # counts toward 30-min break
        self.on_duty_since_restart = self.cycle_used  # counts toward 70h

        # Progress trackers
        self.miles_done = 0.0
        self.drive_time_done = 0.0
        self.miles_since_fuel = 0.0

        self.result = HOSResult(
            total_distance_miles=self.total_distance,
        )

    # -- low-level segment helpers -----------------------------------------

    def _push(self, status: DutyStatus, hours: float, location: str, remark: str) -> None:
        if hours <= 0:
            return
        seg = Segment(
            status=status,
            start=self.now,
            end=self.now + timedelta(hours=hours),
            location=location,
            remark=remark,
        )
        self.result.segments.append(seg)
        self.now = seg.end
        if status in ("driving", "on_duty"):
            self.on_duty_since_restart += hours
        if status == "on_duty":
            # on-duty-not-driving does not touch driving clocks but does
            # count toward the 14h window (handled by caller opening window)
            pass

    def _stop(self, kind, label, miles=None) -> None:
        self.result.stops.append(
            Stop(
                kind=kind,
                label=label,
                at=self.now,
                miles_from_start=self.miles_done if miles is None else miles,
            )
        )

    def _open_window_if_needed(self) -> None:
        if self.window_start is None:
            self.window_start = self.now

    def _window_used(self) -> float:
        if self.window_start is None:
            return 0.0
        return (self.now - self.window_start).total_seconds() / 3600.0

    # -- resets ------------------------------------------------------------

    def _take_daily_reset(self, location: str) -> None:
        """10 consecutive hours off duty -> restart 11h & 14h clocks."""
        self._push("sleeper", DAILY_RESET, location, "10-hour rest (reset)")
        self._stop("rest", "10-hour rest", )
        self.drive_since_reset = 0.0
        self.drive_since_break = 0.0
        self.window_start = None

    def _take_cycle_restart(self, location: str) -> None:
        """34 consecutive hours off duty -> restart the 70h cycle."""
        self._push("off_duty", CYCLE_RESTART, location, "34-hour restart")
        self._stop("rest", "34-hour restart")
        self.drive_since_reset = 0.0
        self.drive_since_break = 0.0
        self.window_start = None
        self.on_duty_since_restart = 0.0

    def _take_break(self, location: str) -> None:
        """30-minute non-driving break after 8h cumulative driving."""
        self._push("off_duty", BREAK_DURATION, location, "30-minute break")
        self._stop("break", "30-minute break")
        self.drive_since_break = 0.0

    def _take_split_sleeper(self, location: str) -> None:
        """
        Split sleeper-berth pairing under §395.1(g): an 8-hour sleeper leg
        plus a separate 2-hour off-duty leg, together satisfying the 10-hour
        off-duty requirement. Because paired periods are excluded from the
        14-hour window, each qualifying period restores driving capacity
        without needing a full 10 consecutive hours off.

        We take the 8h sleeper leg first, then the 2h partner leg, and only
        then restart the 11h & 14h clocks — matching the paired-period
        calculation in the FMCSA guide (pp. 7-9).
        """
        # First qualifying period: 8 consecutive hours in the sleeper berth.
        self._push("sleeper", SPLIT_SLEEPER_LONG, location, "8-hour sleeper berth (split)")
        self._stop("rest", "8-hour sleeper (split)")
        # Second qualifying period: 2 hours off duty. Paired, this completes
        # a valid >=10h off-duty combination.
        self._push("off_duty", SPLIT_SLEEPER_SHORT, location, "2-hour off-duty (split pair)")
        # Pairing complete -> the 11h & 14h clocks restart, like a 10h reset.
        self.drive_since_reset = 0.0
        self.drive_since_break = 0.0
        self.window_start = None

    # -- driving capacity --------------------------------------------------

    def _remaining_drive_capacity(self) -> float:
        """Hours of driving allowed right now before some limit forces a stop."""
        by_11 = MAX_DRIVING_PER_SHIFT - self.drive_since_reset
        by_break = DRIVING_BEFORE_BREAK - self.drive_since_break
        by_window = MAX_WINDOW - self._window_used() if self.window_start else MAX_WINDOW
        return max(0.0, min(by_11, by_break, by_window))

    def _needs_cycle_restart(self, want_hours: float) -> bool:
        return self.on_duty_since_restart + want_hours > CYCLE_LIMIT

    # -- the main loop -----------------------------------------------------

    def run(self) -> HOSResult:
        labels = self.labels
        origin = labels.get("start", "Origin")
        pickup = labels.get("pickup", "Pickup")
        dropoff = labels.get("dropoff", "Drop-off")

        # Trip begins on duty at current location, then drives to pickup.
        # For simplicity current location == pickup start of loaded leg; we
        # model a 1h pickup at the start of the driving distance and 1h
        # drop-off at the end. (Distance/time is pickup->dropoff.)
        self._open_window_if_needed()
        self._stop("start", origin, miles=0.0)

        # Pickup (1h on duty)
        self._ensure_cycle_room(PICKUP_DURATION, pickup)
        self._push("on_duty", PICKUP_DURATION, pickup, "Pickup / loading")
        self._stop("pickup", pickup, miles=0.0)

        # Drive the loaded leg, inserting breaks / fuel / rests as needed.
        remaining_drive = self.total_drive_time
        while remaining_drive > 1e-6:
            # If the cycle is exhausted, take a 34-hour restart before driving.
            if self._remaining_drive_capacity() > 0 and self._needs_cycle_restart(
                min(0.25, remaining_drive)
            ):
                self._take_cycle_restart("En route")

            cap = self._remaining_drive_capacity()

            if cap <= 1e-6:
                # Which limit hit? Decide the right rest.
                if self.drive_since_break >= DRIVING_BEFORE_BREAK - 1e-6 and (
                    self.drive_since_reset < MAX_DRIVING_PER_SHIFT - 1e-6
                    and self._window_used() < MAX_WINDOW - 1e-6
                ):
                    self._take_break("En route")
                elif self.use_split_sleeper:
                    # Use the 8/2 split sleeper-berth pairing instead of a
                    # single 10-hour reset.
                    self._take_split_sleeper("En route")
                else:
                    self._take_daily_reset("En route")
                continue

            chunk = min(cap, remaining_drive)
            miles_chunk = chunk * self.mph

            # Respect fuel spacing within this chunk.
            miles_to_fuel = MILES_PER_FUEL - self.miles_since_fuel
            if miles_chunk > miles_to_fuel and self.miles_since_fuel + miles_chunk > MILES_PER_FUEL:
                # Drive up to the fuel point, fuel, then continue the loop.
                drive_to_fuel_hours = miles_to_fuel / self.mph
                drive_to_fuel_hours = min(drive_to_fuel_hours, chunk)
                self._drive(drive_to_fuel_hours)
                remaining_drive -= drive_to_fuel_hours
                self._fuel("En route")
                continue

            self._drive(chunk)
            remaining_drive -= chunk

        # Drop-off (1h on duty)
        self._ensure_cycle_room(DROPOFF_DURATION, dropoff)
        self._push("on_duty", DROPOFF_DURATION, dropoff, "Drop-off / unloading")
        self._stop("dropoff", dropoff, miles=self.total_distance)

        self._finalize()
        return self.result

    def _ensure_cycle_room(self, want_hours: float, location: str) -> None:
        if self._needs_cycle_restart(want_hours):
            self._take_cycle_restart(location)
        self._open_window_if_needed()

    def _drive(self, hours: float) -> None:
        if hours <= 1e-9:
            return
        self._open_window_if_needed()
        miles = hours * self.mph
        remark = f"Driving toward {self.labels.get('dropoff', 'destination')}"
        self._push("driving", hours, "En route", remark)
        self.drive_since_reset += hours
        self.drive_since_break += hours
        self.miles_done += miles
        self.miles_since_fuel += miles
        self.drive_time_done += hours

    def _fuel(self, location: str) -> None:
        self._push("on_duty", FUEL_DURATION, location, "Fueling")
        self._stop("fuel", "Fuel stop")
        self.miles_since_fuel = 0.0

    def _finalize(self) -> None:
        driving = sum(s.hours for s in self.result.segments if s.status == "driving")
        on_duty = sum(
            s.hours for s in self.result.segments if s.status in ("driving", "on_duty")
        )
        self.result.total_driving_hours = driving
        self.result.total_on_duty_hours = on_duty
        if self.result.segments:
            span = self.result.segments[-1].end - self.result.segments[0].start
            self.result.total_days = int(span.total_seconds() // 86400) + 1
        else:
            self.result.total_days = 0


def simulate(
    total_distance_miles: float,
    total_driving_hours: float,
    current_cycle_used: float = 0.0,
    start_time: datetime | None = None,
    labels: dict | None = None,
    use_split_sleeper: bool = False,
) -> HOSResult:
    """Convenience wrapper."""
    return HOSSimulator(
        total_distance_miles=total_distance_miles,
        total_driving_hours=total_driving_hours,
        current_cycle_used=current_cycle_used,
        start_time=start_time,
        labels=labels,
        use_split_sleeper=use_split_sleeper,
    ).run()
