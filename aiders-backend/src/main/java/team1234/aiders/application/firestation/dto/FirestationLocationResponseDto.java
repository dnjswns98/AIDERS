package team1234.aiders.application.firestation.dto;

import lombok.Getter;
import team1234.aiders.application.firestation.entity.Firestation;

@Getter
public class FirestationLocationResponseDto {

    private final Double latitude;
    private final Double longitude;

    private FirestationLocationResponseDto(Firestation firestation) {
        this.latitude = firestation.getLatitude();
        this.longitude = firestation.getLongitude();
    }

    public static FirestationLocationResponseDto fromEntity(Firestation firestation) {
        return new FirestationLocationResponseDto(firestation);
    }
}
