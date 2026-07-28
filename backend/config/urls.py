from django.urls import path

from api.views import HealthView, PlanTripView

urlpatterns = [
    path("api/health", HealthView.as_view()),
    path("api/plan-trip", PlanTripView.as_view()),
]
