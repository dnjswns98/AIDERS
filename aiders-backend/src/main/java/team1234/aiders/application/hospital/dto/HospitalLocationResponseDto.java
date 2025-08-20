package team1234.aiders.application.hospital.dto;

import lombok.Getter;
import team1234.aiders.application.hospital.entity.Hospital;

@Getter
public class HospitalLocationResponseDto {
    private final Double latitude;
    private final Double longitude;

    private HospitalLocationResponseDto(Hospital hospital) {
        this.latitude = hospital.getLatitude();
        this.longitude = hospital.getLongitude();
    }

    public static HospitalLocationResponseDto fromEntity(Hospital hospital) {
        return new HospitalLocationResponseDto(hospital);
    }
}
