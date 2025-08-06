package team1234.aiders.application.hospital.dto.emergencybed;

import java.util.Optional;
import lombok.Getter;

@Getter
public class EmergencyBedRequestDto {
    private Integer generalAvailableBed;
    private Integer generalTotalBed;
    private Boolean generalIsAvailable;
    private Boolean generalIsExist;

    private Integer pediatricAvailableBed;
    private Integer pediatricTotalBed;
    private Boolean pediatricIsAvailable;
    private Boolean pediatricIsExist;

    private Integer traumaAvailableBed;
    private Integer traumaTotalBed;
    private Boolean traumaIsAvailable;
    private Boolean traumaIsExist;

    private Integer neonatalAvailableBed;
    private Integer neonatalTotalBed;
    private Boolean neonatalIsAvailable;
    private Boolean neonatalIsExist;
}
