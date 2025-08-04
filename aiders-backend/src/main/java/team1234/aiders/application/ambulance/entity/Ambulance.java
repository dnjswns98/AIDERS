package team1234.aiders.application.ambulance.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import team1234.aiders.application.ambulance.dto.PatientOptionalInfoRequestDto;
import team1234.aiders.application.ambulance.dto.PatientRequiredInfoRequestDto;
import team1234.aiders.application.hospital.entity.Hospital;
import team1234.aiders.application.firestation.entity.Firestation;
import team1234.aiders.application.user.entity.User;

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
    @Column(columnDefinition = "varchar(20) default 'WAIT'")
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

    private String hospitalName;
    private String hospitalAddress;

    @Builder
    public Ambulance(
            String userKey,
            String role,
            String password,
            String passwordResetKey,
            Firestation firestation
    ) {
        super(userKey, role, password, passwordResetKey);
        this.firestation = firestation;
    }

    public void updateRequiredPatientInfo(PatientRequiredInfoRequestDto dto) {
        this.pKtas = dto.getKtas();
        this.pDepartment = dto.getDepartment();
    }

    public void updateOptionalPatientInfo(PatientOptionalInfoRequestDto dto) {
        dto.getKtas().ifPresent(v -> this.pKtas = v);
        dto.getDepartment().ifPresent(v -> this.pDepartment = v);
        dto.getSex().ifPresent(v -> this.pSex = v);
        dto.getAgeRange().ifPresent(v -> this.pAgeRange = v);
        dto.getMedicalRecord().ifPresent(v -> this.pMedicalRecord = v);
        dto.getFamilyHistory().ifPresent(v -> this.pFamilyHistory = v);
        dto.getPastHistory().ifPresent(v -> this.pPastHistory = v);
        dto.getMedicine().ifPresent(v -> this.pMedicine = v);
        dto.getName().ifPresent(v -> this.pName = v);
        dto.getRrn().ifPresent(v -> this.pRrn = v);
        dto.getNationality().ifPresent(v -> this.pNationality = v);
        dto.getVitalSigns().ifPresent(v -> this.pVitalSigns = v);
    }


    public void changeStatus(AmbCurrentStatus status) {
        this.currentStatus = status;
    }

    public void transferComplete() {
        this.transferEndTime = LocalDateTime.now();
    }

    public void clearPatientInfo() {
        this.pLatitude = null;
        this.pLongitude = null;
        this.pAddress = null;
        this.pCondition = null;
        this.pKtas = null;
        this.pDepartment = null;
        this.pSex = null;
        this.pAgeRange = PatientAgeRange.UNDECIDED;
        this.pMedicalRecord = null;
        this.pFamilyHistory = null;
        this.pPastHistory = null;
        this.pMedicine = null;
        this.pName = null;
        this.pRrn = null;
        this.pNationality = null;
        this.pVitalSigns = null;
    }

    public void clearHospitalInfo() {
        this.hospital = null;
        this.hospitalName = null;
        this.hospitalAddress = null;
    }

    public void clearTransferInfo() {
        this.dispatchTime = null;
        this.transferStartTime = null;
        this.transferEndTime = null;
    }
}
