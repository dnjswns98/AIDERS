package team1234.aiders.application.location.dto;

public record LocationUpdateRequest(
        Long ambulanceId,
        String ambulanceNumber,
        double latitude,
        double longitude
) {}
