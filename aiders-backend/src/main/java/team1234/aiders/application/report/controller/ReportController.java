package team1234.aiders.application.report.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import team1234.aiders.application.report.dto.ReportResponse;
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
}
