package team1234.aiders.application.user.dto.password;

import lombok.Getter;

@Getter
public class PasswordChangeRequestDto {
    private String resetToken;
    private String newPassword;
}
