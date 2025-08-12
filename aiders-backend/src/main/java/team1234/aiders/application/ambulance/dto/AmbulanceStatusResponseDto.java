package team1234.aiders.application.ambulance.dto;

import lombok.Getter;
import team1234.aiders.application.ambulance.entity.AmbCurrentStatus;
import team1234.aiders.application.ambulance.entity.Ambulance;

@Getter
public class AmbulanceStatusResponseDto {

    private final AmbCurrentStatus ambCurrentStatus;

    private AmbulanceStatusResponseDto(AmbCurrentStatus ambCurrentStatus) {
        this.ambCurrentStatus = ambCurrentStatus;
    }

    public static AmbulanceStatusResponseDto fromEntity(Ambulance ambulance) {
        return new AmbulanceStatusResponseDto(ambulance.getCurrentStatus());
    }
}
