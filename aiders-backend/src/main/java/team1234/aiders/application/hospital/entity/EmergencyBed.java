package team1234.aiders.application.hospital.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import team1234.aiders.application.hospital.dto.emergencybed.EmergencyBedRequestDto;
import team1234.aiders.application.hospital.util.BedType;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class EmergencyBed {

    @Id
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "hospital_id")
    private Hospital hospital;

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

    // General
    public void updateGeneralAvailable(Integer value) {
        this.generalAvailableBed = value;
    }

    public void updateGeneralTotal(Integer value) {
        this.generalTotalBed = value;
    }

    public void updateGeneralIsAvailable(Boolean value) {
        this.generalIsAvailable = value;
    }

    public void updateGeneralIsExist(Boolean value) {
        this.generalIsExist = value;
    }

    // Pediatric
    public void updatePediatricAvailable(Integer value) {
        this.pediatricAvailableBed = value;
    }

    public void updatePediatricTotal(Integer value) {
        this.pediatricTotalBed = value;
    }

    public void updatePediatricIsAvailable(Boolean value) {
        this.pediatricIsAvailable = value;
    }

    public void updatePediatricIsExist(Boolean value) {
        this.pediatricIsExist = value;
    }

    // Trauma
    public void updateTraumaAvailable(Integer value) {
        this.traumaAvailableBed = value;
    }

    public void updateTraumaTotal(Integer value) {
        this.traumaTotalBed = value;
    }

    public void updateTraumaIsAvailable(Boolean value) {
        this.traumaIsAvailable = value;
    }

    public void updateTraumaIsExist(Boolean value) {
        this.traumaIsExist = value;
    }

    // Neonatal
    public void updateNeonatalAvailable(Integer value) {
        this.neonatalAvailableBed = value;
    }

    public void updateNeonatalTotal(Integer value) {
        this.neonatalTotalBed = value;
    }

    public void updateNeonatalIsAvailable(Boolean value) {
        this.neonatalIsAvailable = value;
    }

    public void updateNeonatalIsExist(Boolean value) {
        this.neonatalIsExist = value;
    }

    public void decreaseAvailableBed(BedType type) {
        switch (type) {
            case GENERAL -> this.generalAvailableBed -= 1;
            case PEDIATRIC -> this.pediatricAvailableBed -= 1;
            case TRAUMA -> this.traumaAvailableBed -= 1;
            case NEONATAL -> this.neonatalAvailableBed -= 1;
        }
    }

    public void increaseAvailableBed(BedType type) {
        switch (type) {
            case GENERAL -> this.generalAvailableBed += 1;
            case PEDIATRIC -> this.pediatricAvailableBed += 1;
            case TRAUMA -> this.traumaAvailableBed += 1;
            case NEONATAL -> this.neonatalAvailableBed += 1;
        }
    }

    public static EmergencyBed createEmergencyBed(Hospital hospital, EmergencyBedRequestDto dto) {
        EmergencyBed bed = new EmergencyBed();
        bed.hospital = hospital;

        // General
        boolean isGeneralEmpty = dto.getGeneralAvailableBed() == null && dto.getGeneralTotalBed() == null;
        bed.generalAvailableBed = dto.getGeneralAvailableBed();
        bed.generalTotalBed = dto.getGeneralTotalBed();
        bed.generalIsAvailable = isGeneralEmpty ? false : (dto.getGeneralIsAvailable() != null ? dto.getGeneralIsAvailable() : true);
        bed.generalIsExist = isGeneralEmpty ? false : (dto.getGeneralIsExist() != null ? dto.getGeneralIsExist() : true);

        // Pediatric
        boolean isPediatricEmpty = dto.getPediatricAvailableBed() == null && dto.getPediatricTotalBed() == null;
        bed.pediatricAvailableBed = dto.getPediatricAvailableBed();
        bed.pediatricTotalBed = dto.getPediatricTotalBed();
        bed.pediatricIsAvailable = isPediatricEmpty ? false : (dto.getPediatricIsAvailable() != null ? dto.getPediatricIsAvailable() : true);
        bed.pediatricIsExist = isPediatricEmpty ? false : (dto.getPediatricIsExist() != null ? dto.getPediatricIsExist() : true);

        // Trauma
        boolean isTraumaEmpty = dto.getTraumaAvailableBed() == null && dto.getTraumaTotalBed() == null;
        bed.traumaAvailableBed = dto.getTraumaAvailableBed();
        bed.traumaTotalBed = dto.getTraumaTotalBed();
        bed.traumaIsAvailable = isTraumaEmpty ? false : (dto.getTraumaIsAvailable() != null ? dto.getTraumaIsAvailable() : true);
        bed.traumaIsExist = isTraumaEmpty ? false : (dto.getTraumaIsExist() != null ? dto.getTraumaIsExist() : true);

        // Neonatal
        boolean isNeonatalEmpty = dto.getNeonatalAvailableBed() == null && dto.getNeonatalTotalBed() == null;
        bed.neonatalAvailableBed = dto.getNeonatalAvailableBed();
        bed.neonatalTotalBed = dto.getNeonatalTotalBed();
        bed.neonatalIsAvailable = isNeonatalEmpty ? false : (dto.getNeonatalIsAvailable() != null ? dto.getNeonatalIsAvailable() : true);
        bed.neonatalIsExist = isNeonatalEmpty ? false : (dto.getNeonatalIsExist() != null ? dto.getNeonatalIsExist() : true);

        return bed;
    }

}
