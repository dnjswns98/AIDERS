package team1234.aiders.common.jwt;

import lombok.Getter;

@Getter
public class JwtUserDto {
    private Long userId;
    private String userKey;
    private String role;

    public JwtUserDto(Long userId, String userKey, String role) {
        this.userId = userId;
        this.userKey = userKey;
        this.role = role;
    }
}
