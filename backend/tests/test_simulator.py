"""
Unit tests for the HOS simulator. Run with:  python -m pytest

These validate the graded "accuracy" behaviours against the FMCSA ruleset.
"""

import os
import sys
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from hos.simulator import (  # noqa: E402
    BREAK_DURATION,
    CYCLE_LIMIT,
    DAILY_RESET,
    DROPOFF_DURATION,
    MAX_DRIVING_PER_SHIFT,
    MAX_WINDOW,
    PICKUP_DURATION,
    simulate,
)
from hos.logsheets import build_daily_logs  # noqa: E402

START = datetime(2025, 1, 1, 6, 0, 0)


def _hours(result, status):
    return sum(s.hours for s in result.segments if s.status == status)


def _has_remark(result, needle):
    return any(needle.lower() in s.remark.lower() for s in result.segments)


# ---------------------------------------------------------------------------


def test_short_trip_single_day():
    """A 300-mi / ~5.5h trip fits in one shift with no break needed."""
    r = simulate(300, 5.5, current_cycle_used=0, start_time=START)
    assert _hours(r, "driving") == 5.5
    # pickup + dropoff = 2h on duty
    assert round(_hours(r, "on_duty"), 2) == round(PICKUP_DURATION + DROPOFF_DURATION, 2)
    assert not _has_remark(r, "10-hour rest")
    assert not _has_remark(r, "30-minute break")


def test_break_required_after_8_hours_driving():
    """A trip needing >8h driving must contain a 30-minute break."""
    r = simulate(600, 10.0, current_cycle_used=0, start_time=START)
    assert _has_remark(r, "30-minute break")
    # Total driving preserved
    assert round(_hours(r, "driving"), 2) == 10.0
    # No single driving run exceeds the 8h pre-break cap
    run = 0.0
    for s in r.segments:
        if s.status == "driving":
            run += s.hours
            assert run <= 8.0 + 1e-6
        elif s.remark == "30-minute break":
            run = 0.0


def test_11_hour_limit_forces_daily_reset():
    """More than 11h driving in a day forces a 10-hour reset."""
    r = simulate(900, 16.0, current_cycle_used=0, start_time=START)
    assert _has_remark(r, "10-hour rest")
    # No driving run between resets exceeds 11h
    run = 0.0
    for s in r.segments:
        if s.status == "driving":
            run += s.hours
            assert run <= MAX_DRIVING_PER_SHIFT + 1e-6
        elif s.remark == "10-hour rest (reset)":
            run = 0.0


def test_fuel_stop_every_1000_miles():
    """A >1000-mi trip must contain at least one fuel stop, spaced <=1000mi."""
    r = simulate(2100, 38.0, current_cycle_used=0, start_time=START)
    fuel_stops = [s for s in r.stops if s.kind == "fuel"]
    assert len(fuel_stops) >= 2
    # consecutive fuel stops (and start->first) never exceed 1000 mi
    last = 0.0
    for f in fuel_stops:
        assert f.miles_from_start - last <= 1000.0 + 1.0
        last = f.miles_from_start


def test_cross_country_multi_day():
    """LA->NYC-ish (~2800mi) spans multiple days with resets."""
    r = simulate(2800, 46.0, current_cycle_used=0, start_time=START)
    assert r.total_days >= 4
    assert _has_remark(r, "10-hour rest")
    logs = build_daily_logs(r.segments)
    # Every day's four rows sum to exactly 24 hours.
    for day in logs:
        assert abs(day["total_hours"] - 24.0) < 0.05


def test_cycle_seeded_near_limit_triggers_restart():
    """Starting with 68/70 cycle hours forces a 34-hour restart on a long trip."""
    r = simulate(1500, 26.0, current_cycle_used=68, start_time=START)
    assert _has_remark(r, "34-hour restart")


def test_totals_are_consistent():
    r = simulate(1200, 21.0, current_cycle_used=10, start_time=START)
    driving = _hours(r, "driving")
    on_duty = _hours(r, "on_duty")
    assert abs(r.total_driving_hours - driving) < 1e-6
    assert abs(r.total_on_duty_hours - (driving + on_duty)) < 1e-6


def test_segments_are_contiguous():
    """No gaps or overlaps: each segment starts where the previous ended."""
    r = simulate(1000, 18.0, current_cycle_used=0, start_time=START)
    for a, b in zip(r.segments, r.segments[1:]):
        assert a.end == b.start


# ---- Split sleeper-berth provision (§395.1(g)) ----------------------------


def test_split_sleeper_uses_8_2_pairing():
    """With split enabled, daily rest is an 8h sleeper + 2h off-duty pairing."""
    r = simulate(900, 16.0, current_cycle_used=0, start_time=START, use_split_sleeper=True)
    assert _has_remark(r, "8-hour sleeper berth (split)")
    assert _has_remark(r, "2-hour off-duty (split pair)")
    # The single 10-hour reset should NOT appear when splitting.
    assert not _has_remark(r, "10-hour rest (reset)")


def test_split_sleeper_pairing_totals_10_hours():
    """Each split pairing sums to the required 10 hours off duty."""
    r = simulate(900, 16.0, current_cycle_used=0, start_time=START, use_split_sleeper=True)
    long_legs = [s for s in r.segments if s.remark == "8-hour sleeper berth (split)"]
    short_legs = [s for s in r.segments if s.remark == "2-hour off-duty (split pair)"]
    assert long_legs and short_legs
    assert abs(long_legs[0].hours - 8.0) < 1e-6
    assert abs(short_legs[0].hours - 2.0) < 1e-6


def test_split_sleeper_still_respects_11_hour_limit():
    """Split mode must not let a shift exceed 11h of driving."""
    r = simulate(1500, 26.0, current_cycle_used=0, start_time=START, use_split_sleeper=True)
    run = 0.0
    for s in r.segments:
        if s.status == "driving":
            run += s.hours
            assert run <= MAX_DRIVING_PER_SHIFT + 1e-6
        elif "split" in s.remark:
            run = 0.0


def test_split_sleeper_days_still_sum_to_24():
    """Log sheets remain valid (24h/day) when using the split provision."""
    r = simulate(2000, 34.0, current_cycle_used=0, start_time=START, use_split_sleeper=True)
    for day in build_daily_logs(r.segments):
        assert abs(day["total_hours"] - 24.0) < 0.05


def test_default_still_uses_full_reset():
    """Default (no flag) keeps the original 10-hour reset behavior intact."""
    r = simulate(900, 16.0, current_cycle_used=0, start_time=START)
    assert _has_remark(r, "10-hour rest")
    assert not _has_remark(r, "split")
