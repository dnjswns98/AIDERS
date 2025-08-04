package team1234.aiders.application.user.dto.ambulance;

import lombok.Getter;
import team1234.aiders.application.ambulance.entity.Ambulance;

@Getter
public class AmbulanceRegistResponseDto {

    private final String password;
    private final String passwordResetKey;

    public AmbulanceRegistResponseDto(String password, String passwordResetKey) {
        this.password = password;
        this.passwordResetKey = passwordResetKey;
    }
}
