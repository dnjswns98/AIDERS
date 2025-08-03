package team1234.aiders.application.alarm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class AlarmResponse {
    private AlarmType type;
    private String ambulanceKey;
    private String patientName;
    private Integer ktas;
    private LocalDateTime createdAt;
    private String message;
}
