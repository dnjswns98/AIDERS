package team1234.aiders.application.hospital.util;

import team1234.aiders.application.hospital.dto.emergencybed.EmergencyBedUpdateRequestDto;
import team1234.aiders.application.hospital.entity.EmergencyBed;

public class UpdateBed {

    private UpdateBed() {}

    public static void updateAll(EmergencyBedUpdateRequestDto dto, EmergencyBed bed) {
        updateGeneralBed(dto, bed);
        updatePediatricBed(dto, bed);
        updateTraumaBed(dto, bed);
        updateNeonatalBed(dto, bed);
    }

    public static void updateGeneralBed(EmergencyBedUpdateRequestDto dto, EmergencyBed bed) {
        dto.getGeneralAvailableBed().ifPresent(bed::updateGeneralAvailable);
        dto.getGeneralTotalBed().ifPresent(bed::updateGeneralTotal);
        dto.getGeneralIsAvailable().ifPresent(bed::updateGeneralIsAvailable);
        dto.getGeneralIsExist().ifPresent(bed::updateGeneralIsExist);
    }

    public static void updatePediatricBed(EmergencyBedUpdateRequestDto dto, EmergencyBed bed) {
        dto.getPediatricAvailableBed().ifPresent(bed::updatePediatricAvailable);
        dto.getPediatricTotalBed().ifPresent(bed::updatePediatricTotal);
        dto.getPediatricIsAvailable().ifPresent(bed::updatePediatricIsAvailable);
        dto.getPediatricIsExist().ifPresent(bed::updatePediatricIsExist);
    }

    public static void updateTraumaBed(EmergencyBedUpdateRequestDto dto, EmergencyBed bed) {
        dto.getTraumaAvailableBed().ifPresent(bed::updateTraumaAvailable);
        dto.getTraumaTotalBed().ifPresent(bed::updateTraumaTotal);
        dto.getTraumaIsAvailable().ifPresent(bed::updateTraumaIsAvailable);
        dto.getTraumaIsExist().ifPresent(bed::updateTraumaIsExist);
    }

    public static void updateNeonatalBed(EmergencyBedUpdateRequestDto dto, EmergencyBed bed) {
        dto.getNeonatalAvailableBed().ifPresent(bed::updateNeonatalAvailable);
        dto.getNeonatalTotalBed().ifPresent(bed::updateNeonatalTotal);
        dto.getNeonatalIsAvailable().ifPresent(bed::updateNeonatalIsAvailable);
        dto.getNeonatalIsExist().ifPresent(bed::updateNeonatalIsExist);
    }
}
