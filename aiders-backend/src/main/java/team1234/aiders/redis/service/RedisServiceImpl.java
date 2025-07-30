package team1234.aiders.redis.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import team1234.aiders.application.openvidu.dto.VideoSessionInfo;
import team1234.aiders.redis.handler.RedisHandler;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RedisServiceImpl implements RedisService{

    private final RedisHandler redisHandler;

    /**
     * 세션 등록 + 병원 대기열 등록
     */
    @Override
    public void registerSession(VideoSessionInfo sessionInfo, long timeoutSeconds) {
        sessionInfo.setCreatedAt(System.currentTimeMillis());
        redisHandler.saveSession(sessionInfo.getSessionId(), sessionInfo, timeoutSeconds);
        redisHandler.addToWaitingList(sessionInfo.getHospitalId().toString(), sessionInfo);
    }

    /**
     * 통화 시작 → inCall = true
     */
    @Override
    public boolean startCall(String sessionId) {
        VideoSessionInfo session = redisHandler.getSession(sessionId);
        if (session == null) return false;

        session.setInCall(true);
        redisHandler.overwriteSession(sessionId, session);
        return true;
    }

    /**
     * 통화 종료 → inCall = false
     */
    @Override
    public boolean endCall(String sessionId) {
        VideoSessionInfo session = redisHandler.getSession(sessionId);
        if (session == null) return false;

        session.setInCall(false);
        redisHandler.overwriteSession(sessionId, session);
        return true;
    }

    /**
     * 환자 이송 완료 시 → Redis에서 제거 (세션 + 대기열)
     */
    @Override
    public void completeTransport(String sessionId, String hospitalId) {
        VideoSessionInfo session = redisHandler.getSession(sessionId);
        if (session != null) {
            redisHandler.removeFromWaitingListByValue(hospitalId, session);
        }
        redisHandler.deleteSession(sessionId);
    }

    /**
     * 병원이 대기열에서 수동 제거
     */
    @Override
    public void removeFromWaitingList(String hospitalId, String sessionId) {
        VideoSessionInfo session = redisHandler.getSession(sessionId);
        if (session != null) {
            redisHandler.removeFromWaitingListByValue(hospitalId, session);
        }
    }

    /**
     * 병원별 대기 리스트 반환
     */
    @Override
    public List<VideoSessionInfo> getWaitingList(String hospitalId) {
        return redisHandler.getWaitingListRaw(hospitalId).stream()
                .filter(o -> o instanceof VideoSessionInfo)
                .map(o -> (VideoSessionInfo) o)
                .toList();
    }

    /**
     * 단일 세션 조회
     */
    @Override
    public VideoSessionInfo getSession(String sessionId) {
        return redisHandler.getSession(sessionId);
    }
}
