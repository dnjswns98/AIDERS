package team1234.aiders.application.openvidu.dto;

import lombok.Data;

/**
 * 클라이언트로부터 받은 토큰 요청 정보를 담는 DTO
 */
@Data
public class TokenRequest {
    private String sessionId;
    private Long ambulanceId;
    private Long hospitalId;
    private Integer ktas;
    private String patientName;
}