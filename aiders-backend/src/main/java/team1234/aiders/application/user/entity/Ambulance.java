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
    @Column(nullable = false)
    private AmbCurrentStatus currentStatus;

    @Column(nullable = false)
    private Double pLatitude;

    @Column(nullable = false)
    private Double pLongitude;

    @Column(nullable = false)
    private String pAddress;

    @Column(nullable = false)
    private String pCondition;

    @Column(nullable = false)
    private int pKtas;

    @Column(nullable = false)
    private String pDepartment;

    @Column(nullable = false)
    private int pSex;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PatientAgeRange pAgeRange;

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
}
