package team1234.aiders.application.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import team1234.aiders.application.auth.dto.token.AccessTokenResponseDto;
import team1234.aiders.application.auth.dto.login.LoginRequestDto;
import team1234.aiders.application.auth.dto.login.LoginResponseDto;
import team1234.aiders.application.auth.dto.token.RefreshRequestDto;
import team1234.aiders.application.user.entity.User;
import team1234.aiders.application.user.repository.UserRepository;
import team1234.aiders.common.jwt.JwtProvider;
import team1234.aiders.common.jwt.JwtUserDto;
import team1234.aiders.config.security.CustomUserDetails;
import team1234.aiders.config.security.CustomUserDetailsService;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final CustomUserDetailsService userDetailsService;
    private final JwtProvider jwtProvider;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public LoginResponseDto login(LoginRequestDto request) {
        CustomUserDetails userDetails = loadUserDetails(request.getUserKey());
        checkPassword(request.getPassword(), userDetails.getPassword());

        JwtUserDto jwtUser = createJwtUser(userDetails.getId(), userDetails.getUserKey());
        String accessToken = jwtProvider.generateToken(jwtUser);
        String refreshToken = jwtProvider.generateRefreshToken(jwtUser);

        updateRefreshToken(userDetails.getUserKey(), refreshToken);

        return new LoginResponseDto(userDetails.getRole(), accessToken, refreshToken);
    }

    public AccessTokenResponseDto reissue(RefreshRequestDto request) {
        String refreshToken = request.getRefreshToken();
        validateRefreshToken(refreshToken);

        String userKey = jwtProvider.getUserKeyFromToken(refreshToken);
        User user = findUserByUserKey(userKey);
        checkStoredRefreshToken(refreshToken, user.getRefreshToken());

        String newAccessToken = jwtProvider.generateToken(
                createJwtUser(user.getId(), user.getUserKey())
        );

        return new AccessTokenResponseDto(newAccessToken);
    }

    public void logout(String userKey) {
        User user = findUserByUserKey(userKey);
        user.updateRefreshToken(null);
        userRepository.save(user);
    }

    private CustomUserDetails loadUserDetails(String userKey) {
        return (CustomUserDetails) userDetailsService.loadUserByUsername(userKey);
    }

    private void checkPassword(String rawPassword, String encodedPassword) {
        if (!passwordEncoder.matches(rawPassword, encodedPassword)) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }
    }

    private void updateRefreshToken(String userKey, String refreshToken) {
        User user = findUserByUserKey(userKey);
        user.updateRefreshToken(refreshToken);
        userRepository.save(user);
    }

    private void validateRefreshToken(String refreshToken) {
        if (!jwtProvider.validateToken(refreshToken)) {
            throw new IllegalArgumentException("유효하지 않은 Refresh Token");
        }
    }

    private void checkStoredRefreshToken(String requestToken, String storedToken) {
        if (!requestToken.equals(storedToken)) {
            throw new IllegalArgumentException("DB에 저장된 Refresh Token과 일치하지 않음");
        }
    }

    private User findUserByUserKey(String userKey) {
        return userRepository.findByUserKey(userKey)
                .orElseThrow(() -> new UsernameNotFoundException("사용자 없음"));
    }

    private JwtUserDto createJwtUser(Long id, String userKey) {
        return new JwtUserDto(id, userKey);
    }
}
