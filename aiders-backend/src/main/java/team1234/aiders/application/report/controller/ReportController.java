package team1234.aiders.application.report.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import team1234.aiders.application.report.dto.ReportResponse;
import team1234.aiders.application.report.dto.ReportSearchEnvelope;
import team1234.aiders.application.report.dto.ReportSearchRequest;
import team1234.aiders.application.report.dto.ReportUpdateRequest;
import team1234.aiders.application.report.entity.Report;
import team1234.aiders.application.report.service.ReportService;
import team1234.aiders.config.security.CustomUserDetails;

@RestController
@RequestMapping("/api/v1/report")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping("/")
    public ResponseEntity<ReportResponse> generate(@AuthenticationPrincipal CustomUserDetails user) {
        Report report = reportService.create(user);
        return ResponseEntity.ok(ReportResponse.from(report));
    }

    @GetMapping("/")
    public ResponseEntity<Page<ReportResponse>> listAll(
            @AuthenticationPrincipal CustomUserDetails user,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        return ResponseEntity.ok(reportService.listAll(user, pageable));
    }

    @PostMapping("/search")
    public ResponseEntity<Page<ReportResponse>> search(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestBody ReportSearchEnvelope body
    ) {
        Pageable pageable = body.toPageable();
        ReportSearchRequest req = body.request();
        return ResponseEntity.ok(reportService.search(user, req, pageable));
    }

    @GetMapping("/{reportId}")
    public ResponseEntity<ReportResponse> get(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long reportId
    ) {
        return ResponseEntity.ok(reportService.get(user, reportId));
    }

    @PutMapping("/{reportId}")
    public ResponseEntity<ReportResponse> update(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long reportId,
            @RequestBody ReportUpdateRequest request
    ) {
        return ResponseEntity.ok(reportService.update(user, reportId, request));
    }
}
