package team1234.aiders.application.hospital.dto;

import com.querydsl.core.annotations.QueryProjection;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import team1234.aiders.application.hospital.entity.Hospital;
import team1234.aiders.application.hospital.entity.HospitalDepartment;
import team1234.aiders.application.hospital.entity.EmergencyBed;

@Data
@NoArgsConstructor
public class HospitalData {
    private Hospital hospital;
    private HospitalDepartment department;
    private EmergencyBed bed;

    @QueryProjection
    public HospitalData(Hospital hospital, HospitalDepartment department, EmergencyBed bed) {
        this.hospital = hospital;
        this.department = department;
        this.bed = bed;
    }
}

