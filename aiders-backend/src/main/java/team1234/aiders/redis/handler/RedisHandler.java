// RedisHandler.java
package team1234.aiders.redis.handler;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import team1234.aiders.application.openvidu.dto.VideoSessionInfo;

import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class RedisHandler {

    private final RedisTemplate<String, Object> redisTemplate;

    // ========== 단일 세션 ==========

    public void saveSession(String sessionId, VideoSessionInfo sessionInfo, long timeoutSeconds) {
        redisTemplate.opsForValue().set(sessionId, sessionInfo, timeoutSeconds, TimeUnit.SECONDS);
    }

    public VideoSessionInfo getSession(String sessionId) {
        Object value = redisTemplate.opsForValue().get(sessionId);
        return (value instanceof VideoSessionInfo info) ? info : null;
    }

    public void deleteSession(String sessionId) {
        redisTemplate.delete(sessionId);
    }

    public boolean exists(String sessionId) {
        return redisTemplate.hasKey(sessionId);
    }

    public void overwriteSession(String sessionId, VideoSessionInfo sessionInfo) {
        redisTemplate.opsForValue().set(sessionId, sessionInfo); // TTL 연장 X
    }

    // ========== 병원 대기열 ==========

    public void addToWaitingList(String hospitalId, VideoSessionInfo sessionInfo) {
        redisTemplate.opsForList().rightPush(hospitalId, sessionInfo);
    }

    public List<VideoSessionInfo> getWaitingList(String hospitalId) {
        Long size = redisTemplate.opsForList().size(hospitalId);
        if (size == null || size == 0) return List.of();

        return redisTemplate.opsForList().range(hospitalId, 0, size).stream()
                .filter(o -> o instanceof VideoSessionInfo)
                .map(o -> (VideoSessionInfo) o)
                .collect(Collectors.toList());
    }

    public void overwriteWaitingList(String hospitalId, List<VideoSessionInfo> sessions) {
        redisTemplate.delete(hospitalId);
        for (VideoSessionInfo session : sessions) {
            redisTemplate.opsForList().rightPush(hospitalId, session);
        }
    }
}