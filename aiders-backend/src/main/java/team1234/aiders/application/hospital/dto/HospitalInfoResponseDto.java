package team1234.aiders.application.hospital.dto;

import lombok.Getter;
import team1234.aiders.application.hospital.entity.Hospital;

@Getter
public class HospitalInfoResponseDto {
    private final String name;
    private final String address;

    private HospitalInfoResponseDto(Hospital hospital) {
        this.name = hospital.getName();
        this.address = hospital.getAddress();
    }

    public static HospitalInfoResponseDto fromEntity(Hospital hospital) {
        return new HospitalInfoResponseDto(hospital);
    }
}
