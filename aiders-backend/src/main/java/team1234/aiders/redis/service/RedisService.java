package team1234.aiders.redis.service;

import team1234.aiders.application.openvidu.dto.VideoSessionInfo;

import java.util.List;

public interface RedisService {

    void registerSession(VideoSessionInfo sessionInfo, long timeoutSeconds);

    boolean updateCallStatus(String sessionId, boolean inCall);

    boolean completeTransport(String sessionId, String hospitalId);

    boolean removeFromWaitingList(String hospitalId, String sessionId);

    List<VideoSessionInfo> getWaitingList(String hospitalId);

    VideoSessionInfo getSession(String sessionId);

    boolean exists(String sessionId);
}
