package team1234.aiders.application.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AccessTokenResponseDto {
    private final String accessToken;
}
