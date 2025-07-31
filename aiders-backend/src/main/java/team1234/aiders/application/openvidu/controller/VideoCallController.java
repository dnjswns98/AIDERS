package team1234.aiders.application.openvidu.controller;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import team1234.aiders.application.openvidu.dto.TokenRequest;
import team1234.aiders.application.openvidu.dto.TokenResponse;
import team1234.aiders.application.openvidu.service.OpenViduService;

@RestController
@RequestMapping("/api/video-call") // 추후 수정
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class VideoCallController {
    private final OpenViduService openViduService;

    @Operation(summary = "세션 생성 + 토큰 발급 + Redis 등록", description = "구급차가 화상 통화 세션을 생성하고 병원 대기열에 등록합니다.")
    @PostMapping("/token-register")
    public ResponseEntity<TokenResponse> createTokenAndRegister(@RequestBody TokenRequest request) {
        TokenResponse response = openViduService.createTokenAndRegister(request);
        return ResponseEntity.ok(response);
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
