package team1234.aiders.redis.handler;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import team1234.aiders.application.openvidu.dto.VideoSessionInfo;

import java.util.List;
import java.util.concurrent.TimeUnit;

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

    public List<Object> getWaitingListRaw(String hospitalId) {
        Long size = redisTemplate.opsForList().size(hospitalId);
        if (size == null || size == 0) return List.of();
        return redisTemplate.opsForList().range(hospitalId, 0, size);
    }

    public void removeFromWaitingListByValue(String hospitalId, VideoSessionInfo sessionInfo) {
        redisTemplate.opsForList().remove(hospitalId, 1, sessionInfo);
    }

    public void clearWaitingList(String hospitalId) {
        redisTemplate.delete(hospitalId);
    }
}
