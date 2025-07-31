package team1234.aiders.redis.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
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
    private static final long SESSION_TTL_SECONDS = 300;

    @PostMapping("/session")
    @Operation(summary = "세션 등록", description = "구급차가 병원 자동 매칭 후 세션 정보를 Redis에 등록합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "세션 등록 성공"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    public ResponseEntity<Void> registerSession(@RequestBody VideoSessionInfo sessionInfo) {
        redisService.registerSession(sessionInfo, SESSION_TTL_SECONDS);
        return ResponseEntity.ok().build();
    }

    /**
     * 통화 상태 변경 (true = 통화중, false = 대기중)
     */
    @PutMapping("/session/{sessionId}/call-status")
    @Operation(summary = "통화 상태 변경", description = "세션의 통화 상태를 변경합니다 (inCall true/false).")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "상태 변경 성공"),
            @ApiResponse(responseCode = "404", description = "세션 없음")
    })
    public ResponseEntity<Void> updateCallStatus(
            @PathVariable String sessionId,
            @RequestParam boolean inCall) {
        boolean result = redisService.updateCallStatus(sessionId, inCall);

        return result ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    /**
     * 환자 이송 완료 → 세션 삭제 + 대기열 제거
     */
    @DeleteMapping("/session/{sessionId}/complete")
    @Operation(summary = "환자 이송 완료 처리", description = "환자 이송이 완료되었을 때 세션과 대기열에서 제거합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "제거 완료"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    public ResponseEntity<Void> completeTransport(
            @PathVariable String sessionId,
            @RequestParam String hospitalId) {
        if (!redisService.exists(sessionId)) {
            return ResponseEntity.notFound().build(); // 세션이 존재하지 않음
        }

        boolean removed = redisService.completeTransport(sessionId, hospitalId);
        if (!removed) {
            return ResponseEntity.status(404).build(); // 대기열에서 제거 실패
        }

        return ResponseEntity.ok().build();
    }

    /**
     * 병원이 특정 세션을 대기열에서 수동 제거
     */
    @DeleteMapping("/waiting/{hospitalId}/{sessionId}")
    @Operation(summary = "대기열에서 수동 제거", description = "병원이 특정 세션을 대기열에서 수동으로 제거합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "대기열에서 제거됨"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    public ResponseEntity<Void> removeFromWaiting(
            @PathVariable String hospitalId,
            @PathVariable String sessionId) {
        if(redisService.removeFromWaitingList(hospitalId, sessionId)){
            return ResponseEntity.ok().build();
        }

        return ResponseEntity.notFound().build();
    }

    /**
     * 병원별 대기열 조회
     */
    @GetMapping("/waiting/{hospitalId}")
    @Operation(summary = "병원 대기열 조회", description = "특정 병원 ID에 해당하는 대기 중인 세션 리스트를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "대기열 조회 성공"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    public ResponseEntity<List<VideoSessionInfo>> getWaitingList(@PathVariable String hospitalId) {
        List<VideoSessionInfo> list = redisService.getWaitingList(hospitalId);
        return ResponseEntity.ok(list);
    }

    /**
     * 단일 세션 조회
     */
    @GetMapping("/session/{sessionId}")
    @Operation(summary = "단일 세션 조회", description = "세션 ID로 Redis에 저장된 세션 정보를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "세션 조회 성공"),
            @ApiResponse(responseCode = "404", description = "세션 없음")
    })
    public ResponseEntity<VideoSessionInfo> getSession(@PathVariable String sessionId) {
        VideoSessionInfo session = redisService.getSession(sessionId);
        return session != null ? ResponseEntity.ok(session) : ResponseEntity.notFound().build();
    }
}

