// src/main/java/team1234/aiders/application/report/dto/ReportResponse.java
package team1234.aiders.application.report.dto;

import team1234.aiders.application.report.entity.Report;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public record ReportResponse(
        Long reportId,
        Long dispatchId,
        String title,
        Integer ktas,
        String hospitalName,
        String content,
        String summary,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    private static final DateTimeFormatter DAY = DateTimeFormatter.ofPattern("yyyyMMdd");

    public static ReportResponse from(Report r) {
        String userKey = r.getAmbulance().getUserKey();
        LocalDateTime created = r.getCreatedAt();
        String dateStr = (created != null ? created.toLocalDate() : LocalDate.now()).format(DAY);
        String computedTitle = userKey + "_" + dateStr;

        return new ReportResponse(
                r.getId(),
                r.getDispatch().getId(),
                computedTitle,
                r.getKtas(),
                r.getHospitalName(),
                r.getContent(),
                r.getSummary(),
                r.getCreatedAt(),
                r.getUpdatedAt()
        );
    }

}
