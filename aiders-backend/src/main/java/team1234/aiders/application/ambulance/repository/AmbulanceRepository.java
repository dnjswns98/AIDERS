package team1234.aiders.application.ambulance.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import team1234.aiders.application.ambulance.entity.Ambulance;

public interface AmbulanceRepository extends JpaRepository<Ambulance, Long> {
}
