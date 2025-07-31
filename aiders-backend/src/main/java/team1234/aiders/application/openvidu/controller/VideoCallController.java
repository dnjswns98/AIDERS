package team1234.aiders.application.openvidu.controller;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import team1234.aiders.application.openvidu.dto.EndCallRequest;
import team1234.aiders.application.openvidu.dto.StartCallRequest;
import team1234.aiders.application.openvidu.dto.TokenRequest;
import team1234.aiders.application.openvidu.dto.TokenResponse;
import team1234.aiders.application.openvidu.service.OpenViduService;
import team1234.aiders.redis.service.RedisService;

@RestController
@RequestMapping("/api/video-call") // 추후 수정
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class VideoCallController {
    private final OpenViduService openViduService;
    private final RedisService redisService;

    @Operation(summary = "세션 생성 + 토큰 발급 + Redis 등록", description = "구급차가 화상 통화 세션을 생성하고 병원 대기열에 등록합니다.")
    @PostMapping("/token-register")
    public ResponseEntity<TokenResponse> createTokenAndRegister(@RequestBody TokenRequest request) {
        TokenResponse response = openViduService.createTokenAndRegister(request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "병원 통화 시작", description = "병원이 특정 구급차 세션을 선택하여 통화를 시작합니다. 기존 통화 중인 세션은 모두 대기 상태로 변경됩니다.")
    @PutMapping("/start-call")
    public ResponseEntity<Void> startCall(@RequestBody StartCallRequest request) {
        boolean success = redisService.startCall(request.getHospitalId(), request.getSessionId());
        return success ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    @Operation(summary = "병원 통화 종료", description = "병원이 선택한 세션(구급차)과의 통화를 종료합니다.")
    @PutMapping("/end-call")
    public ResponseEntity<Void> endCall(@RequestBody EndCallRequest request) {
        boolean success = redisService.updateCallStatus(request.getSessionId(), false);
        return success ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }


    /**
     * 방장이 세션을 종료할 수 있는 API
     * 세션 ID를 전달받아 해당 세션을 종료한다.
     *
     * @param sessionId 종료할 세션의 ID
     */
    @DeleteMapping("/session/{sessionId}")
    public ResponseEntity<Void> closeSession(@PathVariable String sessionId) {
        log.info("세션 종료 요청: {}", sessionId);
        openViduService.closeSession(sessionId);
        return ResponseEntity.ok().build();
    }

}
