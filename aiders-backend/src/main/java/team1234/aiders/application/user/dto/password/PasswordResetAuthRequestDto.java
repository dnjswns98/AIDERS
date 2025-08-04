package team1234.aiders.application.user.dto.password;

import lombok.Getter;

@Getter
public class PasswordResetAuthRequestDto {
    private String userKey;
    private String passwordResetKey;
}
