// OpenViduService.java
package team1234.aiders.application.openvidu.service;

import io.openvidu.java.client.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import team1234.aiders.application.openvidu.dto.TokenRequest;
import team1234.aiders.application.openvidu.dto.TokenResponse;

import java.util.Optional;

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
            return new TokenResponse(token, request.getSessionId());

        } catch (OpenViduJavaClientException | OpenViduHttpException e) {
            log.error("OpenVidu 토큰 생성 실패", e);
            throw new RuntimeException("토큰 생성 중 오류 발생");
        }
    }

    /**
     * 세션 ID를 기반으로 OpenVidu 세션을 종료한다.
     * 세션에 연결된 모든 클라이언트는 연결이 끊어진다.
     *
     * @param sessionId 종료할 세션의 ID
     */
    public void closeSession(String sessionId) {
        try {
            // 현재 활성화된 세션 목록 중 sessionId에 해당하는 세션을 찾음
            Optional<Session> sessionOpt = openVidu.getActiveSessions().stream()
                    .filter(s -> s.getSessionId().equals(sessionId))
                    .findFirst();

            if (sessionOpt.isPresent()) {
                sessionOpt.get().close();  // 모든 참가자 연결 종료
            } else {
                throw new RuntimeException("세션이 존재하지 않습니다.");
            }
        } catch (OpenViduJavaClientException | OpenViduHttpException e) {
            log.error("세션 종료 실패", e);
            throw new RuntimeException("세션 종료 중 오류 발생");
        }
    }

}
