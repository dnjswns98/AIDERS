package team1234.aiders.redis.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import team1234.aiders.application.openvidu.dto.VideoSessionInfo;
import team1234.aiders.redis.service.RedisService;

import java.util.List;

@RestController
@RequestMapping("/api/redis")
@RequiredArgsConstructor
public class RedisTestController {

    private final RedisService redisService;

    private static final long SESSION_TTL_SECONDS = 600;

    /**
     * 세션 등록 (Redis 저장 + 병원 대기열에 추가)
     */
    @PostMapping("/session")
    public ResponseEntity<Void> registerSession(@RequestBody VideoSessionInfo sessionInfo) {
        redisService.registerSession(sessionInfo, SESSION_TTL_SECONDS);
        return ResponseEntity.ok().build();
    }

    /**
     * 통화 상태 변경 (true = 통화중, false = 대기중)
     */
    @PutMapping("/session/{sessionId}/call-status")
    public ResponseEntity<Void> updateCallStatus(@PathVariable String sessionId,
                                                 @RequestParam boolean inCall) {
        boolean result = inCall
                ? redisService.startCall(sessionId)
                : redisService.endCall(sessionId);

        return result ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    /**
     * 환자 이송 완료 → 세션 삭제 + 대기열 제거
     */
    @DeleteMapping("/session/{sessionId}/complete")
    public ResponseEntity<Void> completeTransport(@PathVariable String sessionId,
                                                  @RequestParam String hospitalId) {
        redisService.completeTransport(sessionId, hospitalId);
        return ResponseEntity.ok().build();
    }

    /**
     * 병원이 특정 세션을 대기열에서 수동 제거
     */
    @DeleteMapping("/waiting/{hospitalId}/{sessionId}")
    public ResponseEntity<Void> removeFromWaiting(@PathVariable String hospitalId,
                                                  @PathVariable String sessionId) {
        redisService.removeFromWaitingList(hospitalId, sessionId);
        return ResponseEntity.ok().build();
    }

    /**
     * 병원별 대기열 조회
     */
    @GetMapping("/waiting/{hospitalId}")
    public ResponseEntity<List<VideoSessionInfo>> getWaitingList(@PathVariable String hospitalId) {
        List<VideoSessionInfo> list = redisService.getWaitingList(hospitalId);
        return ResponseEntity.ok(list);
    }

    /**
     * 단일 세션 조회
     */
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<VideoSessionInfo> getSession(@PathVariable String sessionId) {
        VideoSessionInfo session = redisService.getSession(sessionId);
        return session != null ? ResponseEntity.ok(session) : ResponseEntity.notFound().build();
    }
}
