package team1234.aiders.application.ambulance.dto;

import lombok.Getter;
import team1234.aiders.application.ambulance.entity.AmbCurrentStatus;
import team1234.aiders.application.ambulance.entity.Ambulance;

import java.time.LocalDateTime;

@Getter
public class AmbulanceResponseDto {

    private final String userKey;
    private final AmbCurrentStatus status;
    private final String hospitalName;
    private final LocalDateTime transferStartTime;

    private AmbulanceResponseDto(Ambulance ambulance) {
        this.userKey = ambulance.getUserKey();
        this.status = ambulance.getCurrentStatus();
        this.hospitalName = ambulance.getHospitalName();
        this.transferStartTime = ambulance.getTransferStartTime();
    }

    public static AmbulanceResponseDto fromEntity(Ambulance ambulance) {
        return new AmbulanceResponseDto(ambulance);
    }
}
