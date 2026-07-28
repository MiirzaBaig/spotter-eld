from rest_framework import serializers


class PlanTripSerializer(serializers.Serializer):
    current_location = serializers.CharField(max_length=200)
    pickup_location = serializers.CharField(max_length=200)
    dropoff_location = serializers.CharField(max_length=200)
    current_cycle_used = serializers.FloatField(min_value=0, max_value=70)
    # Optional: when the driver comes on duty (ISO 8601). Defaults to 8am today.
    start_time = serializers.DateTimeField(required=False, allow_null=True)
    # Optional: use the 8/2 split sleeper-berth provision (§395.1(g)) for daily
    # rest instead of a single 10-hour reset. Defaults to off.
    use_split_sleeper = serializers.BooleanField(required=False, default=False)

    def validate(self, attrs):
        for key in ("current_location", "pickup_location", "dropoff_location"):
            if not attrs[key].strip():
                raise serializers.ValidationError({key: "This field cannot be blank."})
        return attrs
