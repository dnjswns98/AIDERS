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

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "available", column = @Column(name = "general_available_bed")),
            @AttributeOverride(name = "total", column = @Column(name = "general_total_bed")),
            @AttributeOverride(name = "isAvailable", column = @Column(name = "general_is_available")),
            @AttributeOverride(name = "isExist", column = @Column(name = "general_is_exist"))
    })
    private BedInfo general;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "available", column = @Column(name = "pediatric_available_bed")),
            @AttributeOverride(name = "total", column = @Column(name = "pediatric_total_bed")),
            @AttributeOverride(name = "isAvailable", column = @Column(name = "pediatric_is_available")),
            @AttributeOverride(name = "isExist", column = @Column(name = "pediatric_is_exist"))
    })
    private BedInfo pediatric;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "available", column = @Column(name = "trauma_available_bed")),
            @AttributeOverride(name = "total", column = @Column(name = "trauma_total_bed")),
            @AttributeOverride(name = "isAvailable", column = @Column(name = "trauma_is_available")),
            @AttributeOverride(name = "isExist", column = @Column(name = "trauma_is_exist"))
    })
    private BedInfo trauma;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "available", column = @Column(name = "neonatal_available_bed")),
            @AttributeOverride(name = "total", column = @Column(name = "neonatal_total_bed")),
            @AttributeOverride(name = "isAvailable", column = @Column(name = "neonatal_is_available")),
            @AttributeOverride(name = "isExist", column = @Column(name = "neonatal_is_exist"))
    })
    private BedInfo neonatal;

    public static EmergencyBed from(Hospital hospital, EmergencyBedRequestDto dto) {
        EmergencyBed bed = new EmergencyBed();
        bed.hospital = hospital;
        bed.general = BedInfo.from(dto.getGeneralAvailableBed(), dto.getGeneralTotalBed(), dto.getGeneralIsAvailable(), dto.getGeneralIsExist());
        bed.pediatric = BedInfo.from(dto.getPediatricAvailableBed(), dto.getPediatricTotalBed(), dto.getPediatricIsAvailable(), dto.getPediatricIsExist());
        bed.trauma = BedInfo.from(dto.getTraumaAvailableBed(), dto.getTraumaTotalBed(), dto.getTraumaIsAvailable(), dto.getTraumaIsExist());
        bed.neonatal = BedInfo.from(dto.getNeonatalAvailableBed(), dto.getNeonatalTotalBed(), dto.getNeonatalIsAvailable(), dto.getNeonatalIsExist());
        return bed;
    }

    public void update(EmergencyBedRequestDto dto) {
        updateGeneral(dto);
        updatePediatric(dto);
        updateTrauma(dto);
        updateNeonatal(dto);
    }

    public void updateGeneral(EmergencyBedRequestDto dto) {
        general = general.update(dto.getGeneralAvailableBed(), dto.getGeneralTotalBed(), dto.getGeneralIsAvailable(), dto.getGeneralIsExist());
    }

    public void updatePediatric(EmergencyBedRequestDto dto) {
        pediatric = pediatric.update(dto.getPediatricAvailableBed(), dto.getPediatricTotalBed(), dto.getPediatricIsAvailable(), dto.getPediatricIsExist());
    }

    public void updateTrauma(EmergencyBedRequestDto dto) {
        trauma = trauma.update(dto.getTraumaAvailableBed(), dto.getTraumaTotalBed(), dto.getTraumaIsAvailable(), dto.getTraumaIsExist());
    }

    public void updateNeonatal(EmergencyBedRequestDto dto) {
        neonatal = neonatal.update(dto.getNeonatalAvailableBed(), dto.getNeonatalTotalBed(), dto.getNeonatalIsAvailable(), dto.getNeonatalIsExist());
    }

    public void increaseAvailable(BedType type) {
        if (type == BedType.GENERAL) {
            general = general.increaseAvailable();
            return;
        }
        if (type == BedType.PEDIATRIC) {
            pediatric = pediatric.increaseAvailable();
            return;
        }
        if (type == BedType.TRAUMA) {
            trauma = trauma.increaseAvailable();
            return;
        }
        if (type == BedType.NEONATAL) {
            neonatal = neonatal.increaseAvailable();
        }
    }

    public void decreaseAvailable(BedType type) {
        if (type == BedType.GENERAL) {
            general = general.decreaseAvailable();
            return;
        }
        if (type == BedType.PEDIATRIC) {
            pediatric = pediatric.decreaseAvailable();
            return;
        }
        if (type == BedType.TRAUMA) {
            trauma = trauma.decreaseAvailable();
            return;
        }
        if (type == BedType.NEONATAL) {
            neonatal = neonatal.decreaseAvailable();
        }
    }
}
