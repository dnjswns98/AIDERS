package team1234.aiders.application.openvidu.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoSessionInfo {
    private String sessionId;        // 예: 구급차 id
    private String ambulanceNumber;  // 구급차 번호
    private Long hospitalId;         // 병원 ID
    private Integer ktas;            // 환자 KTAS 등급
    private String patientName;      // 환자 이름
    private boolean isInCall;        // 병원이 통화 중인지 여부
    private long createdAt;          // 생성 시간 (timestamp, millis)
}
