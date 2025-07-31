package team1234.aiders.application.openvidu.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
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

    @Operation(summary = "구급차용 세션 생성 + 토큰 발급 + Redis 등록", description = "구급차가 화상 통화 세션을 생성하고 병원 대기열에 등록합니다.")
    @PostMapping("/ambulance/token")
    public ResponseEntity<TokenResponse> createTokenAndRegister(@RequestBody TokenRequest request) {
        TokenResponse response = openViduService.createTokenAndRegister(request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "🏥 병원용: 기존 세션의 토큰만 발급")
    @GetMapping("/hospital/token")
    public ResponseEntity<TokenResponse> getTokenForHospital(@RequestParam String sessionId) {
        TokenResponse response = openViduService.createTokenOnly(sessionId);
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


    @DeleteMapping("/session/{sessionId}/complete")
    @Operation(summary = "환자 이송 완료 처리", description = "세션 및 대기열, OpenVidu 세션을 함께 삭제합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "이송 완료 처리 성공"),
            @ApiResponse(responseCode = "404", description = "세션 없음 또는 삭제 실패")
    })
    public ResponseEntity<Void> completeTransport(
            @PathVariable String sessionId,
            @RequestParam String hospitalId) {

        if (!redisService.exists(sessionId)) {
            return ResponseEntity.notFound().build();
        }

        // Redis 삭제 처리
        boolean removed = redisService.completeTransport(sessionId, hospitalId);

        // OpenVidu 세션 삭제
        openViduService.closeSessionIfExists(sessionId);

        return removed ? ResponseEntity.ok().build() : ResponseEntity.status(500).build();
    }


}
