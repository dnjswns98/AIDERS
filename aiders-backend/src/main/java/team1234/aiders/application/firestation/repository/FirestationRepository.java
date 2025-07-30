package team1234.aiders.application.firestation.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import team1234.aiders.application.firestation.entity.Firestation;

public interface FirestationRepository extends JpaRepository<Firestation, Long> {
}
