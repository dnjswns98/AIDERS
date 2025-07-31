package team1234.aiders.application.ambulance.dto;

import lombok.Getter;
import team1234.aiders.application.ambulance.entity.PatientAgeRange;

import java.util.Optional;

@Getter
public class PatientOptionalInfoRequestDto {

    private Optional<Integer> ktas = Optional.empty();
    private Optional<String> department = Optional.empty();
    private Optional<Integer> sex = Optional.empty();
    private Optional<PatientAgeRange> ageRange = Optional.empty();

    private Optional<String> medicalRecord = Optional.empty();
    private Optional<String> familyHistory = Optional.empty();
    private Optional<String> pastHistory = Optional.empty();
    private Optional<String> medicine = Optional.empty();
    private Optional<String> name = Optional.empty();
    private Optional<String> rrn = Optional.empty();
    private Optional<String> nationality = Optional.empty();
    private Optional<String> vitalSigns = Optional.empty();
}
