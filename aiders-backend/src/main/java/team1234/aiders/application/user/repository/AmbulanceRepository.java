package team1234.aiders.application.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import team1234.aiders.application.user.entity.Ambulance;

public interface AmbulanceRepository extends JpaRepository<Ambulance, Integer> {
}
