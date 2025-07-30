package team1234.aiders.application.dispatch.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import team1234.aiders.application.dispatch.entity.DispatchHistory;

import java.util.List;

public interface DispatchHistoryRepository extends JpaRepository<DispatchHistory, Long> {
    List<DispatchHistory> findByFirestationId(Long firestationId);
}
