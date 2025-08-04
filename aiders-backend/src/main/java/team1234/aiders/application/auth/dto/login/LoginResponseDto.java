package team1234.aiders.application.auth.dto.login;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponseDto {
    private String role;
    private String accessToken;
    private String refreshToken;
}
