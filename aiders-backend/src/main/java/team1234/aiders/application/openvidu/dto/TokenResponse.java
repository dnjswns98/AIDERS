package team1234.aiders.application.openvidu.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * 토큰 발급 결과를 담는 DTO
 */
@Data
@AllArgsConstructor
public class TokenResponse {
    private String token;
}
