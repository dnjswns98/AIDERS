package team1234.aiders.application.dispatch.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import team1234.aiders.application.dispatch.entity.Dispatch;

import java.util.List;

@Repository
public interface DispatchRepository extends JpaRepository<Dispatch,Long> {

    List<Dispatch> findByDispatchHistoryId(Long dispatchHistoryId);

    // 해당 구급차의 가장 최근 배차 1건 (최신 = 현재 이송건)
    Dispatch findFirstByAmbulanceIdOrderByIdDesc(Long ambulanceId);
}
