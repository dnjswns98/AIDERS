// application/report/dto/ReportResponse.java
package team1234.aiders.application.report.dto;

import java.time.LocalDateTime;
import team1234.aiders.application.report.entity.Report;

public record ReportResponse(
        Long reportId,
        Long dispatchId,
        Integer ktas,
        String hospitalName,
        String content,
        String summary,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static ReportResponse from(Report r) {
        return new ReportResponse(
                r.getId(),
                r.getDispatch().getId(),
                r.getKtas(),
                r.getHospitalName(),
                r.getContent(),
                r.getSummary(),
                r.getCreatedAt(),
                r.getUpdatedAt()
        );
    }
}
