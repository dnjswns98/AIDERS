package team1234.aiders.application.report.controller;

import io.swagger.v3.oas.annotations.Operation;
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
    @Operation(summary = "보고서 생성", description = "현재 로그인한 구급차 기준으로 최신 배차 내역을 잡아 보고서 자동 생성")
    public ResponseEntity<ReportResponse> generate(@AuthenticationPrincipal CustomUserDetails user) {
        Report report = reportService.create(user);
        return ResponseEntity.ok(ReportResponse.from(report));
    }

    @GetMapping("/")
    @Operation(summary = "보고서 목록 조회", description = "해당 소방서 소속의 모든 보고서를 페이징 형태로 조회")
    public ResponseEntity<Page<ReportResponse>> listAll(
            @AuthenticationPrincipal CustomUserDetails user,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        return ResponseEntity.ok(reportService.listAll(user, pageable));
    }

    @PostMapping("/search")
    @Operation(summary = "보고서 검색", description = """
            필터 조건으로 보고서를 검색합니다. (페이징 형태)
            - from, to: 날짜 범위 (둘 다 없으면 전체)
            - ktas: KTAS 등급
            - userKey: 구급차 번호
            - keyword: content/summary 키워드
            """)
    public ResponseEntity<Page<ReportResponse>> search(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestBody ReportSearchEnvelope body
    ) {
        Pageable pageable = body.toPageable();
        ReportSearchRequest req = body.request();
        return ResponseEntity.ok(reportService.search(user, req, pageable));
    }

    @GetMapping("/{reportId}")
    @Operation(summary = "보고서 상세 조회", description = "특정 reportId에 해당하는 보고서 상세 내용을 조회")
    public ResponseEntity<ReportResponse> get(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long reportId
    ) {
        return ResponseEntity.ok(reportService.get(user, reportId));
    }

    @PutMapping("/{reportId}")
    @Operation(summary = "보고서 수정", description = "특정 reportId의 보고서 내용을 수정")
    public ResponseEntity<ReportResponse> update(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long reportId,
            @RequestBody ReportUpdateRequest request
    ) {
        return ResponseEntity.ok(reportService.update(user, reportId, request));
    }

    @DeleteMapping("/{reportId}")
    @Operation(summary = "보고서 삭제", description = "특정 reportId의 보고서 삭제. 성공 시 204 No Content 반환.")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long reportId
    ) {
        reportService.delete(user, reportId);
        return ResponseEntity.noContent().build();
    }
}
