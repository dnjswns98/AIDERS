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
        this.generalAvailableBed = bed.getGeneral().getAvailable();
        this.generalTotalBed = bed.getGeneral().getTotal();
        this.generalIsAvailable = bed.getGeneral().getIsAvailable();
        this.generalIsExist = bed.getGeneral().getIsExist();

        this.pediatricAvailableBed = bed.getPediatric().getAvailable();
        this.pediatricTotalBed = bed.getPediatric().getTotal();
        this.pediatricIsAvailable = bed.getPediatric().getIsAvailable();
        this.pediatricIsExist = bed.getPediatric().getIsExist();

        this.traumaAvailableBed = bed.getTrauma().getAvailable();
        this.traumaTotalBed = bed.getTrauma().getTotal();
        this.traumaIsAvailable = bed.getTrauma().getIsAvailable();
        this.traumaIsExist = bed.getTrauma().getIsExist();

        this.neonatalAvailableBed = bed.getNeonatal().getAvailable();
        this.neonatalTotalBed = bed.getNeonatal().getTotal();
        this.neonatalIsAvailable = bed.getNeonatal().getIsAvailable();
        this.neonatalIsExist = bed.getNeonatal().getIsExist();
    }

    public static EmergencyBedResponseDto fromEntity(EmergencyBed bed) {
        return new EmergencyBedResponseDto(bed);
    }
}
