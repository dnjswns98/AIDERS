package team1234.aiders.application.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import team1234.aiders.application.auth.dto.AccessTokenResponseDto;
import team1234.aiders.application.auth.dto.LoginRequestDto;
import team1234.aiders.application.auth.dto.LoginResponseDto;
import team1234.aiders.application.auth.dto.RefreshRequestDto;
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
        CustomUserDetails userDetails = (CustomUserDetails) userDetailsService.loadUserByUsername(request.getUserKey());

        if (!passwordEncoder.matches(request.getPassword(), userDetails.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        JwtUserDto jwtUser = new JwtUserDto(userDetails.getId(), userDetails.getUserKey());

        String accessToken = jwtProvider.generateToken(jwtUser);
        String refreshToken = jwtProvider.generateRefreshToken(jwtUser);

        User user = userRepository.findByUserKey(userDetails.getUserKey())
                .orElseThrow(() -> new UsernameNotFoundException("사용자 없음"));
        user.updateRefreshToken(refreshToken);
        userRepository.save(user);

        return new LoginResponseDto(accessToken, refreshToken);
    }

    public AccessTokenResponseDto reissue(RefreshRequestDto request) {
        String refreshToken = request.getRefreshToken();

        if (!jwtProvider.validateToken(refreshToken)) {
            throw new IllegalArgumentException("유효하지 않은 Refresh Token");
        }

        String userKey = jwtProvider.getUserKeyFromToken(refreshToken);
        User user = userRepository.findByUserKey(userKey)
                .orElseThrow(() -> new UsernameNotFoundException("사용자 없음"));

        if (!refreshToken.equals(user.getRefreshToken())) {
            throw new IllegalArgumentException("DB에 저장된 Refresh Token과 일치하지 않음");
        }

        String newAccessToken = jwtProvider.generateToken(
                new JwtUserDto(user.getId(), user.getUserKey())
        );

        return new AccessTokenResponseDto(newAccessToken);
    }
}
