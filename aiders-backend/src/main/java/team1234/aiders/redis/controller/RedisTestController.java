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
    
    @DeleteMapping("/waiting/{hospitalId}/{sessionId}")
    @Operation(summary = "대기열에서 수동 제거", description = "병원이 특정 세션을 대기열에서 수동으로 제거합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "대기열에서 제거됨"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    public ResponseEntity<Void> removeFromWaiting(
            @PathVariable String hospitalId,
            @PathVariable String sessionId) {
        if (redisService.removeFromWaitingList(hospitalId, sessionId)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
    
    @GetMapping("/waiting/{hospitalId}")
    @Operation(summary = "병원별 대기열 조회", description = "특정 병원 ID에 해당하는 대기 중인 세션 리스트를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "대기열 조회 성공"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    public ResponseEntity<List<VideoSessionInfo>> getWaitingList(@PathVariable String hospitalId) {
        List<VideoSessionInfo> list = redisService.getWaitingList(hospitalId);
        return ResponseEntity.ok(list);
    }
    
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


