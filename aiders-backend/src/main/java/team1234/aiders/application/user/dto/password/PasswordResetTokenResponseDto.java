package team1234.aiders.application.user.dto.password;

import lombok.Getter;

@Getter
public class PasswordResetTokenResponseDto {
    private String resetToken;

    public PasswordResetTokenResponseDto(String resetToken) {
        this.resetToken = resetToken;
    }
}
