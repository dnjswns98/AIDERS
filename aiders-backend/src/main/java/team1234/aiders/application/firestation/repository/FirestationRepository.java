package team1234.aiders.application.firestation.repository;

import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import team1234.aiders.application.firestation.entity.Firestation;

import java.util.Optional;

public interface FirestationRepository extends JpaRepository<Firestation, Long> {

    @Query("select f from Firestation f where f.name = :name")
    Optional<Firestation> findByName(@Param("name") String name);
}
