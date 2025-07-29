package team1234.aiders.application.auth.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import team1234.aiders.application.auth.dto.AccessTokenResponseDto;
import team1234.aiders.application.auth.dto.LoginRequestDto;
import team1234.aiders.application.auth.dto.LoginResponseDto;
import team1234.aiders.application.auth.dto.RefreshRequestDto;
import team1234.aiders.application.auth.service.AuthService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@RequestBody LoginRequestDto request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/reissue")
    public ResponseEntity<AccessTokenResponseDto> reissue(@RequestBody RefreshRequestDto request) {
        return ResponseEntity.ok(authService.reissue(request));
    }
}
