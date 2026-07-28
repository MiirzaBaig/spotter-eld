from datetime import datetime

import requests
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from hos import geo
from hos.logsheets import build_daily_logs
from hos.simulator import simulate

from .serializers import PlanTripSerializer


class HealthView(APIView):
    def get(self, request):
        return Response({"status": "ok"})


class PlanTripView(APIView):
    """
    POST /api/plan-trip

    Body: current_location, pickup_location, dropoff_location,
          current_cycle_used, [start_time]

    Returns geocoded points, route geometry, HOS timeline segments, per-day
    ELD log sheets, and a trip summary.
    """

    def post(self, request):
        serializer = PlanTripSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # 1) Geocode + route the trip using free OSM/OSRM services.
        try:
            g = geo.plan_geo(
                current=data["current_location"],
                pickup=data["pickup_location"],
                dropoff=data["dropoff_location"],
            )
        except geo.GeoError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except requests.RequestException:
            return Response(
                {"detail": "Map/routing service is temporarily unavailable. Please retry."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        loaded = g["loaded"]  # pickup -> dropoff drives the HOS math
        start_time = data.get("start_time") or datetime.now().replace(
            hour=8, minute=0, second=0, microsecond=0
        )

        # 2) Simulate hours of service.
        result = simulate(
            total_distance_miles=loaded["distance_miles"],
            total_driving_hours=loaded["duration_hours"],
            current_cycle_used=data["current_cycle_used"],
            start_time=start_time,
            use_split_sleeper=data.get("use_split_sleeper", False),
            labels={
                "start": data["current_location"],
                "pickup": data["pickup_location"],
                "dropoff": data["dropoff_location"],
            },
        )

        # 3) Split into per-day ELD log sheets.
        daily_logs = build_daily_logs(result.segments)

        payload = {
            "inputs": {
                "current_location": data["current_location"],
                "pickup_location": data["pickup_location"],
                "dropoff_location": data["dropoff_location"],
                "current_cycle_used": data["current_cycle_used"],
                "start_time": start_time.isoformat(),
            },
            "points": g["points"],
            "route": g["route"],          # full journey geometry for the map
            "hos": result.to_dict(),      # segments + stops + summary
            "daily_logs": daily_logs,     # one per calendar day
        }
        return Response(payload)
