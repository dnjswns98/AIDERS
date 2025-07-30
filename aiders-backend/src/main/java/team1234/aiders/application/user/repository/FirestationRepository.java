package team1234.aiders.application.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import team1234.aiders.application.user.entity.Firestation;

public interface FirestationRepository extends JpaRepository<Firestation, Long> {
}
