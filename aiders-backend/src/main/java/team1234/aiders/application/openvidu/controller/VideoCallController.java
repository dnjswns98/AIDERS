package team1234.aiders.application.openvidu.controller;

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

    /**
     * 클라이언트가 세션 ID를 전달하면 OpenVidu 토큰을 생성하여 반환
     */
    @PostMapping("/token")
    public ResponseEntity<TokenResponse> createToken(@RequestBody TokenRequest request) {
        log.info("Received token request for session: {}", request.getSessionId());
        TokenResponse tokenResponse = openViduService.createToken(request);
        return ResponseEntity.ok(tokenResponse);
    }
}
