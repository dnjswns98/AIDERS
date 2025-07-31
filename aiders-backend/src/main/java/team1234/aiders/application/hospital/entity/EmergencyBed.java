package team1234.aiders.application.hospital.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

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
}
