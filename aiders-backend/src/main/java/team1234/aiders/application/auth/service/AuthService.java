package team1234.aiders.application.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team1234.aiders.application.auth.dto.token.AccessTokenResponseDto;
import team1234.aiders.application.auth.dto.login.LoginRequestDto;
import team1234.aiders.application.auth.dto.login.LoginResponseDto;
import team1234.aiders.application.auth.dto.token.RefreshRequestDto;
import team1234.aiders.application.auth.repository.AuthRepository;
import team1234.aiders.application.auth.repository.AuthRepository.ReissueProjection;
import team1234.aiders.common.jwt.JwtProvider;
import team1234.aiders.common.jwt.JwtUserDto;
import team1234.aiders.config.security.CustomUserDetails;
import team1234.aiders.config.security.CustomUserDetailsService;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final CustomUserDetailsService userDetailsService;
    private final JwtProvider jwtProvider;
    private final AuthRepository authRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public LoginResponseDto login(LoginRequestDto request) {
        CustomUserDetails user = loadUserDetails(request.getUserKey());
        verifyPassword(request.getPassword(), user.getPassword());

        JwtUserDto jwtUser = createJwtUser(user.getId(), user.getUserKey(),  user.getRole());
        String accessToken = jwtProvider.generateToken(jwtUser);
        String refreshToken = jwtProvider.generateRefreshToken(jwtUser);

        updateRefreshToken(user, refreshToken);

        return new LoginResponseDto(accessToken, refreshToken);
    }

    @Transactional(readOnly = true)
    public AccessTokenResponseDto reissue(RefreshRequestDto request) {
        String refreshToken = request.getRefreshToken();
        validateRefreshToken(refreshToken);

        String userKey = jwtProvider.getUserKeyFromToken(refreshToken);
        ReissueProjection user = findReissueUser(userKey);
        verifyStoredRefreshToken(refreshToken, user.getRefreshToken());

        String newAccessToken = jwtProvider.generateToken(
                createJwtUser(user.getId(), user.getUserKey(), user.getRole())
        );

        return new AccessTokenResponseDto(newAccessToken);
    }

    @Transactional
    public void logout(String userKey) {
        int updated = authRepository.clearRefreshTokenByUserKey(userKey);
        assertUpdatedCount(updated);
    }

    private CustomUserDetails loadUserDetails(String userKey) {
        return (CustomUserDetails) userDetailsService.loadUserByUsername(userKey);
    }

    private void verifyPassword(String rawPassword, String encodedPassword) {
        if (!passwordEncoder.matches(rawPassword, encodedPassword)) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }
    }

    private void validateRefreshToken(String refreshToken) {
        if (!jwtProvider.validateToken(refreshToken)) {
            throw new IllegalArgumentException("유효하지 않은 Refresh Token");
        }
    }

    private void verifyStoredRefreshToken(String requestToken, String storedToken) {
        if (!requestToken.equals(storedToken)) {
            throw new IllegalArgumentException("DB에 저장된 Refresh Token과 일치하지 않음");
        }
    }

    private static void assertUpdatedCount(int updated) {
        if (updated == 0) {
            throw new IllegalArgumentException("사용자를 찾을 수 없습니다.");
        }
    }

    private void updateRefreshToken(CustomUserDetails user, String refreshToken) {
        authRepository.updateRefreshToken(user.getId(), refreshToken);
    }

    private ReissueProjection findReissueUser(String userKey) {
        return authRepository.findReissueByUserKey(userKey)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다"));
    }

    private JwtUserDto createJwtUser(Long id, String userKey, String role) {
        return new JwtUserDto(id, userKey, role);
    }
}
