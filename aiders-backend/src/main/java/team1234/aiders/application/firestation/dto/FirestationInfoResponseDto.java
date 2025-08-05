package team1234.aiders.application.firestation.dto;

import lombok.Getter;
import team1234.aiders.application.firestation.entity.Firestation;

@Getter
public class FirestationInfoResponseDto {

    private final String name;
    private final String address;

    private FirestationInfoResponseDto(Firestation firestation) {
        this.name = firestation.getName();
        this.address = firestation.getAddress();
    }

    public static FirestationInfoResponseDto fromEntity(Firestation firestation) {
        return new FirestationInfoResponseDto(firestation);
    }
}
