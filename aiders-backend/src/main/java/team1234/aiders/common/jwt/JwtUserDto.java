package team1234.aiders.common.jwt;

import lombok.Getter;

@Getter
public class JwtUserDto {
    private Long userId;
    private String userKey;

    public JwtUserDto(Long userId, String userKey) {
        this.userId = userId;
        this.userKey = userKey;
    }
}
