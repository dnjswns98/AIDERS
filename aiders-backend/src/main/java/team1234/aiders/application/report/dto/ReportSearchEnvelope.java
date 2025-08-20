package team1234.aiders.application.report.dto;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

public record ReportSearchEnvelope(
        ReportSearchRequest request,
        Integer page,
        Integer size,
        String sort // 예: "createdAt,desc"
) {
    public Pageable toPageable() {
        if (sort == null || sort.isBlank()) return PageRequest.of(page == null?0:page, size == null?20:size);
        String[] parts = sort.split(",", 2);
        String prop = parts[0];
        Sort.Direction dir = (parts.length>1 && "asc".equalsIgnoreCase(parts[1])) ? Sort.Direction.ASC : Sort.Direction.DESC;
        return PageRequest.of(page == null?0:page, size == null?20:size, Sort.by(dir, prop));
    }
}

