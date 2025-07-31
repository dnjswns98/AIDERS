package team1234.aiders.application.hospital.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
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
}
