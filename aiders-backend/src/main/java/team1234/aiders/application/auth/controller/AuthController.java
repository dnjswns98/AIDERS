package team1234.aiders.application.auth.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import team1234.aiders.application.auth.dto.token.AccessTokenResponseDto;
import team1234.aiders.application.auth.dto.login.LoginRequestDto;
import team1234.aiders.application.auth.dto.login.LoginResponseDto;
import team1234.aiders.application.auth.dto.token.RefreshRequestDto;
import team1234.aiders.application.auth.service.AuthService;
import team1234.aiders.config.security.CustomUserDetails;

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

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@AuthenticationPrincipal CustomUserDetails userDetails) {
        authService.logout(userDetails.getUserKey());
        return ResponseEntity.ok().build();
    }
}
