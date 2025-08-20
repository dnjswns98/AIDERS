package team1234.aiders.application.ambulance.dto;

import lombok.Getter;
import team1234.aiders.application.ambulance.entity.Ambulance;
import team1234.aiders.application.ambulance.entity.PatientAgeRange;

@Getter
public class PatientInfoResponseDto {

    private final Integer ktas;
    private final String department;
    private final Integer sex;
    private final PatientAgeRange ageRange;
    private final String symptom;
    private final String medicalRecord;
    private final String familyHistory;
    private final String pastHistory;
    private final String medicine;
    private final String name;
    private final String rrn;
    private final String nationality;
    private final String vitalSigns;

    private PatientInfoResponseDto(Integer ktas, String department, Integer sex, PatientAgeRange ageRange, String symptom, String medicalRecord, String familyHistory, String pastHistory, String medicine, String name, String rrn, String nationality, String vitalSigns) {
        this.ktas = ktas;
        this.department = department;
        this.sex = sex;
        this.ageRange = ageRange;
        this.symptom = symptom;
        this.medicalRecord = medicalRecord;
        this.familyHistory = familyHistory;
        this.pastHistory = pastHistory;
        this.medicine = medicine;
        this.name = name;
        this.rrn = rrn;
        this.nationality = nationality;
        this.vitalSigns = vitalSigns;
    }

    public static PatientInfoResponseDto fromEntity(Ambulance entity) {
        return new PatientInfoResponseDto(
                entity.getPKtas(),
                entity.getPDepartment(),
                entity.getPSex(),
                entity.getPAgeRange(),
                entity.getPSymptom(),
                entity.getPMedicalRecord(),
                entity.getPFamilyHistory(),
                entity.getPPastHistory(),
                entity.getPMedicine(),
                entity.getPName(),
                entity.getPRrn(),
                entity.getPNationality(),
                entity.getPVitalSigns()
        );
    }
}
