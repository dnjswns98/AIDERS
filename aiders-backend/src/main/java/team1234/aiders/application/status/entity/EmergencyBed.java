package team1234.aiders.application.status.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import team1234.aiders.application.user.entity.Hospital;

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

    private int generalAvailableBed;
    private int generalTotalBed;
    private Boolean generalIsAvailable;
    private Boolean generalIsExist;

    private int pediatricAvailableBed;
    private int pediatricTotalBed;
    private Boolean pediatricIsAvailable;
    private Boolean pediatricIsExist;

    private int traumaAvailableBed;
    private int traumaTotalBed;
    private Boolean traumaIsAvailable;
    private Boolean traumaIsExist;

    private int neonatalAvailableBed;
    private int neonatalTotalBed;
    private Boolean neonatalIsAvailable;
    private Boolean neonatalIsExist;
}
