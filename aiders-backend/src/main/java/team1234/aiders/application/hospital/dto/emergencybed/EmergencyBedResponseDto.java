package team1234.aiders.application.hospital.dto.emergencybed;

import lombok.Getter;
import team1234.aiders.application.hospital.entity.EmergencyBed;

@Getter
public class EmergencyBedResponseDto {
    private final Integer generalAvailableBed;
    private final Integer generalTotalBed;
    private final Boolean generalIsAvailable;
    private final Boolean generalIsExist;

    private final Integer pediatricAvailableBed;
    private final Integer pediatricTotalBed;
    private final Boolean pediatricIsAvailable;
    private final Boolean pediatricIsExist;

    private final Integer traumaAvailableBed;
    private final Integer traumaTotalBed;
    private final Boolean traumaIsAvailable;
    private final Boolean traumaIsExist;

    private final Integer neonatalAvailableBed;
    private final Integer neonatalTotalBed;
    private final Boolean neonatalIsAvailable;
    private final Boolean neonatalIsExist;

    private EmergencyBedResponseDto(EmergencyBed bed) {
        this.generalAvailableBed = bed.getGeneralAvailableBed();
        this.generalTotalBed = bed.getGeneralTotalBed();
        this.generalIsAvailable = bed.getGeneralIsAvailable();
        this.generalIsExist = bed.getGeneralIsExist();

        this.pediatricAvailableBed = bed.getPediatricAvailableBed();
        this.pediatricTotalBed = bed.getPediatricTotalBed();
        this.pediatricIsAvailable = bed.getPediatricIsAvailable();
        this.pediatricIsExist = bed.getPediatricIsExist();

        this.traumaAvailableBed = bed.getTraumaAvailableBed();
        this.traumaTotalBed = bed.getTraumaTotalBed();
        this.traumaIsAvailable = bed.getTraumaIsAvailable();
        this.traumaIsExist = bed.getTraumaIsExist();

        this.neonatalAvailableBed = bed.getNeonatalAvailableBed();
        this.neonatalTotalBed = bed.getNeonatalTotalBed();
        this.neonatalIsAvailable = bed.getNeonatalIsAvailable();
        this.neonatalIsExist = bed.getNeonatalIsExist();
    }

    public static EmergencyBedResponseDto fromEntity(EmergencyBed bed) {
        return new EmergencyBedResponseDto(bed);
    }
}
