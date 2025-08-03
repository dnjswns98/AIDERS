package team1234.aiders.application.alarm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 병원에게 WebSocket으로 전달되는 알림 메시지 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlarmMessage {

    private AlarmType type;           // 알림 종류

    private String ambulanceKey;      // 구급차 키 (화상통화 sessionId와 동일)
    private String patientName;       // 환자 이름 (MATCHING에만 사용)
    private Integer ktas;             // KTAS 등급 (MATCHING에만 사용)

    private LocalDateTime createdAt;  // 알림 생성 시각

    private String message;           // 프론트에 보여줄 알림 메시지
}
