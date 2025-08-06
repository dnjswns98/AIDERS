package team1234.aiders.application.hospital.util;

import team1234.aiders.application.hospital.dto.emergencybed.EmergencyBedRequestDto;
import team1234.aiders.application.hospital.entity.EmergencyBed;

public class UpdateBed {

    private UpdateBed() {}

    public static void updateAll(EmergencyBedRequestDto dto, EmergencyBed bed) {
        updateGeneralBed(dto, bed);
        updatePediatricBed(dto, bed);
        updateTraumaBed(dto, bed);
        updateNeonatalBed(dto, bed);
    }

    public static void updateGeneralBed(EmergencyBedRequestDto dto, EmergencyBed bed) {
        if (dto.getGeneralAvailableBed() != null) {
            bed.updateGeneralAvailable(dto.getGeneralAvailableBed());
        }
        if (dto.getGeneralTotalBed() != null) {
            bed.updateGeneralTotal(dto.getGeneralTotalBed());
        }
        if (dto.getGeneralIsAvailable() != null) {
            bed.updateGeneralIsAvailable(dto.getGeneralIsAvailable());
        }
        if (dto.getGeneralIsExist() != null) {
            bed.updateGeneralIsExist(dto.getGeneralIsExist());
        }
    }

    public static void updatePediatricBed(EmergencyBedRequestDto dto, EmergencyBed bed) {
        if (dto.getPediatricAvailableBed() != null) {
            bed.updatePediatricAvailable(dto.getPediatricAvailableBed());
        }
        if (dto.getPediatricTotalBed() != null) {
            bed.updatePediatricTotal(dto.getPediatricTotalBed());
        }
        if (dto.getPediatricIsAvailable() != null) {
            bed.updatePediatricIsAvailable(dto.getPediatricIsAvailable());
        }
        if (dto.getPediatricIsExist() != null) {
            bed.updatePediatricIsExist(dto.getPediatricIsExist());
        }
    }

    public static void updateTraumaBed(EmergencyBedRequestDto dto, EmergencyBed bed) {
        if (dto.getTraumaAvailableBed() != null) {
            bed.updateTraumaAvailable(dto.getTraumaAvailableBed());
        }
        if (dto.getTraumaTotalBed() != null) {
            bed.updateTraumaTotal(dto.getTraumaTotalBed());
        }
        if (dto.getTraumaIsAvailable() != null) {
            bed.updateTraumaIsAvailable(dto.getTraumaIsAvailable());
        }
        if (dto.getTraumaIsExist() != null) {
            bed.updateTraumaIsExist(dto.getTraumaIsExist());
        }
    }

    public static void updateNeonatalBed(EmergencyBedRequestDto dto, EmergencyBed bed) {
        if (dto.getNeonatalAvailableBed() != null) {
            bed.updateNeonatalAvailable(dto.getNeonatalAvailableBed());
        }
        if (dto.getNeonatalTotalBed() != null) {
            bed.updateNeonatalTotal(dto.getNeonatalTotalBed());
        }
        if (dto.getNeonatalIsAvailable() != null) {
            bed.updateNeonatalIsAvailable(dto.getNeonatalIsAvailable());
        }
        if (dto.getNeonatalIsExist() != null) {
            bed.updateNeonatalIsExist(dto.getNeonatalIsExist());
        }
    }
}
