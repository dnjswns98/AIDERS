package team1234.aiders.application.report.repository;

import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import team1234.aiders.application.report.entity.Report;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ReportRepository extends JpaRepository<Report, Long> {

    Report findByDispatchId(Long dispatchId);

    boolean existsByDispatchId(Long dispatchId);

    Optional<Report> findByIdAndFirestationId(Long id, Long firestationId);

    @Query("""
        SELECT r.hospitalName, COUNT(r)
        FROM Report r
        WHERE r.createdAt >= :threshold
        AND r.hospitalName IN :hospitalNames
        GROUP BY r.hospitalName
    """)
    List<Object[]> countRecentTransfersByHospitalName(LocalDateTime threshold, List<String> hospitalNames);

}
