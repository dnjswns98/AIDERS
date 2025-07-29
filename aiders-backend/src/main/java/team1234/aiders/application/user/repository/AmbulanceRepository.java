package team1234.aiders.application.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import team1234.aiders.application.user.entity.Ambulance;

import java.util.Optional;

public interface AmbulanceRepository extends JpaRepository<Ambulance, Long> {
}
