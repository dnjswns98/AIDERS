package team1234.aiders.application.hospital.dto.emergencybed;

import java.util.Optional;
import lombok.Getter;

@Getter
public class EmergencyBedUpdateRequestDto {
    private Optional<Integer> generalAvailableBed;
    private Optional<Integer> generalTotalBed;
    private Optional<Boolean> generalIsAvailable;
    private Optional<Boolean> generalIsExist;

    private Optional<Integer> pediatricAvailableBed;
    private Optional<Integer> pediatricTotalBed;
    private Optional<Boolean> pediatricIsAvailable;
    private Optional<Boolean> pediatricIsExist;

    private Optional<Integer> traumaAvailableBed;
    private Optional<Integer> traumaTotalBed;
    private Optional<Boolean> traumaIsAvailable;
    private Optional<Boolean> traumaIsExist;

    private Optional<Integer> neonatalAvailableBed;
    private Optional<Integer> neonatalTotalBed;
    private Optional<Boolean> neonatalIsAvailable;
    private Optional<Boolean> neonatalIsExist;
}
