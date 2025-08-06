package team1234.aiders.application.location.dto;

public record LocationUpdateRequest(
        Long ambulanceId,
        double latitude,
        double longitude
) {}
