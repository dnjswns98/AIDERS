package team1234.aiders.application.hospital.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import team1234.aiders.application.hospital.entity.Hospital;
import team1234.aiders.application.hospital.entity.HospitalDepartment;
import team1234.aiders.application.hospital.entity.EmergencyBed;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HospitalData {
    private Hospital hospital;
    private HospitalDepartment department;
    private EmergencyBed bed;
}
