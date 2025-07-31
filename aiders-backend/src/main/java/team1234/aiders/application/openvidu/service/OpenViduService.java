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

    public TokenResponse createTokenOnly(String sessionId) {
        try {
            // 이미 생성된 세션이어야 함
            Session session = openVidu.getActiveSessions().stream()
                    .filter(s -> s.getSessionId().equals(sessionId))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 세션입니다: " + sessionId));

            // 토큰 발급
            ConnectionProperties properties = new ConnectionProperties.Builder().build();
            String token = session.createConnection(properties).getToken();

            return new TokenResponse(token, session.getSessionId());
        } catch (Exception e) {
            throw new RuntimeException("병원용 토큰 발급 실패", e);
        }
    }

    public void closeSessionIfExists(String sessionId) {
        Session session = openVidu.getActiveSessions().stream()
                .filter(s -> s.getSessionId().equals(sessionId))
                .findFirst()
                .orElse(null);

        if (session != null) {
            try {
                session.close();
                log.info("OpenVidu 세션 '{}' 종료됨", sessionId);
            } catch (Exception e) {
                log.error("OpenVidu 세션 종료 실패: {}", e.getMessage());
            }
        }
    }
}
