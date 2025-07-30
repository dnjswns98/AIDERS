package team1234.aiders.redis.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import team1234.aiders.application.openvidu.dto.VideoSessionInfo;
import team1234.aiders.redis.handler.RedisHandler;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RedisServiceImpl implements RedisService {

    private final RedisHandler redisHandler;

    @Override
    public void registerSession(VideoSessionInfo sessionInfo, long ttl) {
        redisHandler.saveSession(sessionInfo.getSessionId(), sessionInfo, ttl);
        redisHandler.addToWaitingList(sessionInfo.getHospitalId().toString(), sessionInfo);
    }

    @Override
    public VideoSessionInfo getSession(String sessionId) {
        return redisHandler.getSession(sessionId);
    }

    @Override
    public boolean exists(String sessionId) {
        return redisHandler.exists(sessionId);
    }

    @Override
    public boolean startCall(String sessionId) {
        VideoSessionInfo session = redisHandler.getSession(sessionId);
        if (session == null) return false;

        session.setInCall(true);
        redisHandler.overwriteSession(sessionId, session);
        return true;
    }

    @Override
    public boolean endCall(String sessionId) {
        VideoSessionInfo session = redisHandler.getSession(sessionId);
        if (session == null) return false;

        session.setInCall(false);
        redisHandler.overwriteSession(sessionId, session);
        return true;
    }

    @Override
    public boolean completeTransport(String sessionId, String hospitalId) {
        redisHandler.deleteSession(sessionId);
        return removeFromWaitingList(hospitalId, sessionId);
    }

    @Override
    public boolean removeFromWaitingList(String hospitalId, String sessionId) {
        List<VideoSessionInfo> current = redisHandler.getWaitingList(hospitalId);
        List<VideoSessionInfo> filtered = current.stream()
                .filter(info -> !sessionId.equals(info.getSessionId()))
                .toList();

        if (filtered.size() == current.size()) return false;

        redisHandler.overwriteWaitingList(hospitalId, filtered);
        return true;
    }

    @Override
    public List<VideoSessionInfo> getWaitingList(String hospitalId) {
        return redisHandler.getWaitingList(hospitalId);
    }
}
