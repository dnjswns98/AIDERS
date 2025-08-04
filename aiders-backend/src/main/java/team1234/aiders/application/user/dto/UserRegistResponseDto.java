package team1234.aiders.application.user.dto;

import lombok.Getter;

@Getter
public class UserRegistResponseDto {

    private final String password;
    private final String passwordResetKey;

    public UserRegistResponseDto(String password, String passwordResetKey) {
        this.password = password;
        this.passwordResetKey = passwordResetKey;
    }
}
