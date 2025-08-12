package team1234.aiders.application.report.dto;

import java.time.LocalDate;

/**
 * 검색 조건:
 * - 날짜: from만 있으면 from~현재, to만 있으면 ~to, 둘 다 있으면 from~to
 * - ktas
 * - userKey: 구급차번호
 * - keyword: content/summary 부분일치
 */
public record ReportSearchRequest(
        LocalDate from,
        LocalDate to,
        Integer ktas,
        String userKey,
        String keyword
) {}
