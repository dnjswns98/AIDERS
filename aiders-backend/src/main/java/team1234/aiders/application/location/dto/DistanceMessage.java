package team1234.aiders.application.location.dto;

public record DistanceMessage(
        Long ambulanceId,
        Long hospitalId,
        double distance
) {}
