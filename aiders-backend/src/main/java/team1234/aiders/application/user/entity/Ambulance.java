package team1234.aiders.application.user.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@DiscriminatorValue("ambulance")
@PrimaryKeyJoinColumn(name = "ambulance_id")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Ambulance extends User {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "firestation_id",  nullable = false)
    private Firestation firestation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "varchar(20) default 'WAIT'")
    private AmbCurrentStatus currentStatus = AmbCurrentStatus.WAIT;

    private Double pLatitude;
    private Double pLongitude;
    private String pAddress;
    private String pCondition;
    private Integer pKtas;

    private String pDepartment;

    private Integer pSex;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "varchar(20) default 'UNDECIDED'")
    private PatientAgeRange pAgeRange = PatientAgeRange.UNDECIDED;

    private String pMedicalRecord;
    private String pFamilyHistory;
    private String pPastHistory;
    private String pMedicine;
    private String pName;
    private String pRrn;
    private String pNationality;
    private String pVitalSigns;


    private LocalDateTime dispatchTime;
    private LocalDateTime transferStartTime;
    private LocalDateTime transferEndTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id")
    private Hospital hospital;

    public void changeStatus(AmbCurrentStatus status) {
        this.currentStatus = status;
    }
}
