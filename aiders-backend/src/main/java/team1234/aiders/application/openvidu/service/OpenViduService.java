// OpenViduService.java
package team1234.aiders.application.openvidu.service;

import io.openvidu.java.client.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import team1234.aiders.application.openvidu.dto.TokenRequest;
import team1234.aiders.application.openvidu.dto.TokenResponse;

/**
 * OpenVidu API와의 연동을 처리하는 서비스 클래스
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OpenViduService {

    private final OpenVidu openVidu;

    /**
     * 세션이 존재하지 않으면 새로 생성하고, 세션 토큰을 발급한다.
     */
    public TokenResponse createToken(TokenRequest request) {
        try {
            Session session;
            if (openVidu.getActiveSessions().stream().anyMatch(s -> s.getSessionId().equals(request.getSessionId()))) {
                session = openVidu.getActiveSessions().stream()
                        .filter(s -> s.getSessionId().equals(request.getSessionId()))
                        .findFirst()
                        .orElseThrow();
            } else {
                session = openVidu.createSession(new SessionProperties.Builder()
                        .customSessionId(request.getSessionId())
                        .build());
            }

            ConnectionProperties connectionProperties = new ConnectionProperties.Builder()
                    .type(ConnectionType.WEBRTC)
                    .role(OpenViduRole.PUBLISHER) // 필요 시 SUBSCRIBER, MODERATOR 설정 가능
                    .build();

            String token = session.createConnection(connectionProperties).getToken();
            return new TokenResponse(token);

        } catch (OpenViduJavaClientException | OpenViduHttpException e) {
            log.error("OpenVidu 토큰 생성 실패", e);
            throw new RuntimeException("토큰 생성 중 오류 발생");
        }
    }
}
