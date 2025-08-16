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

@Service
@RequiredArgsConstructor
@Slf4j
public class OpenViduService {

    private final OpenVidu openVidu;
    private final RedisService redisService;

    private static final long SESSION_TTL_SECONDS = 1500;

    /**
     * 세션이 존재하지 않으면 새로 생성하고, 세션 토큰을 발급한다.
     */
    public TokenResponse createTokenAndRegister(TokenRequest request) {
        try {
            // 세션 목록 최신화 (서버 기준)
            openVidu.fetch();

            // 세션이 존재하면 재사용, 없으면 생성
            Session session = openVidu.getActiveSessions().stream()
                    .filter(s -> s.getSessionId().equals(request.getSessionId()))
                    .findFirst()
                    .orElseGet(() -> {
                        try {
                            log.info("세션이 존재하지 않아 새로 생성합니다: {}", request.getSessionId());
                            return openVidu.createSession(new SessionProperties.Builder()
                                    .customSessionId(request.getSessionId())
                                    .build());
                        } catch (OpenViduJavaClientException | OpenViduHttpException e) {
                            log.error("OpenVidu 세션 생성 실패", e);
                            throw new RuntimeException("세션 생성 실패", e);
                        }
                    });

            // 토큰 생성
            ConnectionProperties properties = new ConnectionProperties.Builder().build();
            String token = session.createConnection(properties).getToken();

            // Redis 등록
            VideoSessionInfo sessionInfo = VideoSessionInfo.builder()
                    .sessionId(request.getSessionId())
                    .ambulanceNumber(request.getAmbulanceNumber())
                    .hospitalId(request.getHospitalId())
                    .ktas(request.getKtas())
                    .patientName(request.getPatientName())
                    .isInCall(false)
                    .createdAt(System.currentTimeMillis())
                    .build();

            redisService.registerSession(sessionInfo, SESSION_TTL_SECONDS);

            return new TokenResponse(token, session.getSessionId());

        } catch (OpenViduHttpException e) {
            log.error("OpenVidu HTTP 예외 발생 ({}): {}", e.getStatus(), e.getMessage(), e);
            throw new RuntimeException("OpenVidu 서버 오류", e);
        } catch (OpenViduJavaClientException e) {
            log.error("OpenVidu 클라이언트 예외 발생", e);
            throw new RuntimeException("OpenVidu 클라이언트 오류", e);
        } catch (Exception e) {
            log.error("토큰 생성 및 세션 등록 실패", e);
            throw new RuntimeException("토큰 생성 및 세션 등록 실패", e);
        }
    }

    /**
     * 병원용: 기존 세션에서 토큰만 발급
     */
    public TokenResponse createTokenOnly(String sessionId) {
        try {
            openVidu.fetch();

            Session session = openVidu.getActiveSessions().stream()
                    .filter(s -> s.getSessionId().equals(sessionId))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 세션입니다: " + sessionId));

            ConnectionProperties properties = new ConnectionProperties.Builder().build();
            String token = session.createConnection(properties).getToken();

            return new TokenResponse(token, session.getSessionId());
        } catch (Exception e) {
            log.error("병원용 토큰 발급 실패", e);
            throw new RuntimeException("병원용 토큰 발급 실패", e);
        }
    }

    /**
     * 세션이 존재하면 종료
     */
    public void closeSessionIfExists(String sessionId) {
        try {
            openVidu.fetch();

            Session session = openVidu.getActiveSessions().stream()
                    .filter(s -> s.getSessionId().equals(sessionId))
                    .findFirst()
                    .orElse(null);

            if (session != null) {
                session.close();
                log.info("OpenVidu 세션 '{}' 정상 종료됨", sessionId);
            }
        } catch (Exception e) {
            log.error("OpenVidu 세션 종료 실패: {}", e.getMessage(), e);
        }
    }
}
