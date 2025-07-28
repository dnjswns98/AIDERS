package team1234.aiders.application.openvidu.dto;

import lombok.Data;

/**
 * 클라이언트로부터 받은 토큰 요청 정보를 담는 DTO
 */
@Data
public class TokenRequest {
    private String sessionId;     // OpenVidu 세션 ID
    private String participantName; // 참가자 이름 (추후 사용 가능)
}
