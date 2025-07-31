// OpenViduService.java
package team1234.aiders.application.openvidu.service;

import io.openvidu.java.client.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import team1234.aiders.application.openvidu.dto.TokenRequest;
import team1234.aiders.application.openvidu.dto.TokenResponse;
import team1234.aiders.application.openvidu.dto.VideoSessionInfo;
import team1234.aiders.redis.service.RedisService;

import java.util.Optional;

/**
 * OpenVidu API와의 연동을 처리하는 서비스 클래스
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OpenViduService {

    private final OpenVidu openVidu;
    private final RedisService redisService;

    private static final long SESSION_TTL_SECONDS = 300;

    /**
     * 세션이 존재하지 않으면 새로 생성하고, 세션 토큰을 발급한다.
     */
    public TokenResponse createTokenAndRegister(TokenRequest request) {
        try {
            Session session = openVidu.getActiveSessions().stream()
                    .filter(s -> s.getSessionId().equals(request.getSessionId()))
                    .findFirst()
                    .orElseGet(() -> {
                        try {
                            return openVidu.createSession(new SessionProperties.Builder()
                                    .customSessionId(request.getSessionId())
                                    .build());
                        } catch (OpenViduJavaClientException | OpenViduHttpException e) {
                            throw new RuntimeException("세션 생성 실패", e);
                        }
                    });

            ConnectionProperties properties = new ConnectionProperties.Builder().build();
            String token = session.createConnection(properties).getToken();

            VideoSessionInfo sessionInfo = VideoSessionInfo.builder()
                    .sessionId(request.getSessionId())
                    .ambulanceId(request.getAmbulanceId())
                    .hospitalId(request.getHospitalId())
                    .ktas(request.getKtas())
                    .patientName(request.getPatientName())
                    .isInCall(false)
                    .createdAt(System.currentTimeMillis())
                    .build();

            redisService.registerSession(sessionInfo, SESSION_TTL_SECONDS);

            return new TokenResponse(token, session.getSessionId());
        } catch (Exception e) {
            throw new RuntimeException("토큰 생성 및 세션 등록 실패", e);
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
