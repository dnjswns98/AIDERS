package team1234.aiders.application.dispatch.dto;

import lombok.Getter;
import team1234.aiders.application.dispatch.entity.DispatchHistory;

import java.time.LocalDateTime;

@Getter
public class DispatchHistoryResponseDto {

    private final String address;
    private final String condition;
    private final Double latitude;
    private final Double longitude;
    private final LocalDateTime createdAt;

    public DispatchHistoryResponseDto(String address, String condition, Double latitude, Double longitude, LocalDateTime createdAt) {
        this.address = address;
        this.condition = condition;
        this.latitude = latitude;
        this.longitude = longitude;
        this.createdAt = createdAt;
    }

    public static DispatchHistoryResponseDto fromEntity(DispatchHistory entity) {
        return new DispatchHistoryResponseDto(
                entity.getPAddress(),
                entity.getPCondition(),
                entity.getPLatitude(),
                entity.getPLongitude(),
                entity.getCreatedAt()
        );
    }
}
