package team1234.aiders.application.ambulance.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import team1234.aiders.application.ambulance.entity.Ambulance;

import java.util.Optional;

public interface AmbulanceRepository extends JpaRepository<Ambulance, Long> {
    Optional<Ambulance> findByUserKey(String userKey);
}
