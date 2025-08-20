package team1234.aiders.application.user.dto;

import lombok.Getter;
import team1234.aiders.application.user.entity.User;

import java.time.LocalDateTime;

@Getter
public class UserResponseDto {

    private final Long id;
    private final String userKey;
    private final String password;
    private final String role;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    private UserResponseDto(User user) {
        this.id = user.getId();
        this.userKey = user.getUserKey();
        this.password = user.getPassword();
        this.role = user.getRole();
        this.createdAt = user.getCreatedAt();
        this.updatedAt = user.getUpdatedAt();
    }

    public static UserResponseDto fromEntity(User user) {
        return new UserResponseDto(user);
    }
}
