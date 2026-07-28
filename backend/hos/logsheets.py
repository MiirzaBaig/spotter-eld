"""
Split a flat list of HOS Segments into 24-hour ELD daily log sheets.

Each day runs midnight -> midnight (home-terminal time, per FMCSA). Segments
that straddle midnight are split so every day's rows sum to exactly 24 hours.
The output is JSON-friendly and drives the canvas/SVG grid on the frontend.
"""

from __future__ import annotations

from datetime import datetime, timedelta

from .simulator import Segment

STATUS_ORDER = ["off_duty", "sleeper", "driving", "on_duty"]


def _day_start(dt: datetime) -> datetime:
    return dt.replace(hour=0, minute=0, second=0, microsecond=0)


def build_daily_logs(segments: list[Segment]) -> list[dict]:
    """
    Return one dict per calendar day:

        {
          "date": "2025-01-01",
          "rows": {status: [ {start_h, end_h, remark, location}, ... ]},
          "totals": {status: hours, ...},
          "remarks": [ {at_h, location, remark}, ... ],
          "total_miles": None  # filled by caller if desired
        }

    `start_h` / `end_h` are floating hours 0..24 from that day's midnight,
    which the grid renderer maps directly to x-positions.
    """
    if not segments:
        return []

    # If a segment crosses midnight, break it at each midnight boundary.
    split: list[Segment] = []
    for seg in segments:
        cur_start = seg.start
        while _day_start(cur_start) + timedelta(days=1) < seg.end:
            boundary = _day_start(cur_start) + timedelta(days=1)
            split.append(
                Segment(seg.status, cur_start, boundary, seg.location, seg.remark)
            )
            cur_start = boundary
        split.append(Segment(seg.status, cur_start, seg.end, seg.location, seg.remark))

    # Group by calendar date.
    days: dict[str, list[Segment]] = {}
    for seg in split:
        key = seg.start.date().isoformat()
        days.setdefault(key, []).append(seg)

    out = []
    day_keys = sorted(days.keys())
    for date_key in day_keys:
        day_segs = days[date_key]
        midnight = _day_start(day_segs[0].start)

        # Pad the gap before the first segment (day 1 starts mid-day) and the
        # gap after the last segment (trip ends mid-day) with off-duty, so the
        # sheet always covers a full midnight->midnight 24h period.
        padded: list[Segment] = []
        cursor = midnight
        for seg in day_segs:
            if seg.start > cursor:
                padded.append(Segment("off_duty", cursor, seg.start, "", "Off duty"))
            padded.append(seg)
            cursor = seg.end
        end_of_day = midnight + timedelta(days=1)
        if cursor < end_of_day:
            padded.append(Segment("off_duty", cursor, end_of_day, "", "Off duty"))
        day_segs = padded

        rows = {s: [] for s in STATUS_ORDER}
        totals = {s: 0.0 for s in STATUS_ORDER}
        remarks = []

        for seg in day_segs:
            start_h = (seg.start - midnight).total_seconds() / 3600.0
            end_h = (seg.end - midnight).total_seconds() / 3600.0
            rows[seg.status].append(
                {
                    "start_h": round(start_h, 4),
                    "end_h": round(end_h, 4),
                    "location": seg.location,
                    "remark": seg.remark,
                }
            )
            totals[seg.status] += end_h - start_h
            if seg.remark and seg.remark != "Off duty":
                remarks.append(
                    {
                        "at_h": round(start_h, 4),
                        "location": seg.location,
                        "remark": seg.remark,
                    }
                )

        out.append(
            {
                "date": date_key,
                "rows": rows,
                "totals": {k: round(v, 2) for k, v in totals.items()},
                "remarks": remarks,
                "total_hours": round(sum(totals.values()), 2),
            }
        )

    return out
