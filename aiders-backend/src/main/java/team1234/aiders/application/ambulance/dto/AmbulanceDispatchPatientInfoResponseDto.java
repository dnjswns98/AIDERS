package team1234.aiders.application.ambulance.dto;

import lombok.Getter;
import team1234.aiders.application.ambulance.entity.Ambulance;

@Getter
public class AmbulanceDispatchPatientInfoResponseDto {
    private final Double longitude;
    private final Double latitude;
    private final String address;
    private final String condition;

    private AmbulanceDispatchPatientInfoResponseDto(Ambulance ambulance) {
        this.longitude = ambulance.getPLongitude();
        this.latitude = ambulance.getPLatitude();
        this.address = ambulance.getPAddress();
        this.condition = ambulance.getPCondition();
    }

    public static AmbulanceDispatchPatientInfoResponseDto fromEntity(Ambulance ambulance) {
        return new AmbulanceDispatchPatientInfoResponseDto(ambulance);
    }
}
