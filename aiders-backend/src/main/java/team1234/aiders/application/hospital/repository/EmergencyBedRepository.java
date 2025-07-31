package team1234.aiders.application.hospital.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import team1234.aiders.application.hospital.entity.EmergencyBed;

public interface EmergencyBedRepository extends JpaRepository<EmergencyBed, Long> {
}
