package team1234.aiders.application.auth.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

@Getter
public class RefreshRequestDto {
    private final String refreshToken;

    @JsonCreator
    public RefreshRequestDto(@JsonProperty("refreshToken") String refreshToken) {
        this.refreshToken = refreshToken;
    }
}
