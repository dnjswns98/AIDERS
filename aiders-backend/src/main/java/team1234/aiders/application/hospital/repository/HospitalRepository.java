package team1234.aiders.application.hospital.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import team1234.aiders.application.hospital.entity.Hospital;

public interface HospitalRepository extends JpaRepository<Hospital, Long>, HospitalQueryRepository {
}
