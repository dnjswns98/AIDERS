package team1234.aiders.application.auth.dto.login;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

@Getter
public class LoginRequestDto {
    private final String userKey;
    private final String password;

    @JsonCreator
    public LoginRequestDto(@JsonProperty("userKey") String userKey,
                           @JsonProperty("password") String password) {
        this.userKey = userKey;
        this.password = password;
    }
}
