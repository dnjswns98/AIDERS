package team1234.aiders.application.hospital.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import team1234.aiders.application.hospital.entity.Hospital;
import team1234.aiders.application.hospital.dto.HospitalData;

import java.util.List;

public interface HospitalRepository extends JpaRepository<Hospital, Long> {

    @Query("""
        SELECT new team1234.aiders.application.hospital.dto.HospitalData(h, h.department, h.bed)
        FROM Hospital h
    """)
    List<HospitalData> findHospitalsWithDeptAndBeds();
}
