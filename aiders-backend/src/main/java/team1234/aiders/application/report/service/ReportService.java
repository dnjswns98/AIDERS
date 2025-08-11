package team1234.aiders.application.report.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team1234.aiders.application.ambulance.entity.Ambulance;
import team1234.aiders.application.ambulance.repository.AmbulanceRepository;
import team1234.aiders.application.dispatch.entity.Dispatch;
import team1234.aiders.application.dispatch.entity.DispatchHistory;
import team1234.aiders.application.dispatch.repository.DispatchRepository;
import team1234.aiders.application.report.ai.AiReportGenerator;
import team1234.aiders.application.report.dto.AiReportResponse;
import team1234.aiders.application.report.dto.ReportResponse;
import team1234.aiders.application.report.dto.ReportSearchRequest;
import team1234.aiders.application.report.entity.Report;
import team1234.aiders.application.report.repository.ReportQueryRepository;
import team1234.aiders.application.report.repository.ReportRepository;
import team1234.aiders.config.security.CustomUserDetails;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class ReportService {

    private final ReportRepository reportRepository;
    private final DispatchRepository dispatchRepository;
    private final AmbulanceRepository ambulanceRepository;
    private final AiReportGenerator aiReportGenerator;
    private final ReportQueryRepository reportQueryRepository;

    private static final int SUMMARY_LIMIT = 255;

    @Transactional(readOnly = true)
    public Page<ReportResponse> listAll(CustomUserDetails user, Pageable pageable) {
        return reportQueryRepository.search(user.getId(), new ReportSearchRequest(null, null, null, null, null), pageable)
                .map(ReportResponse::from);
    }

    @Transactional(readOnly = true)
    public Page<ReportResponse> search(CustomUserDetails user, ReportSearchRequest req, Pageable pageable) {
        return reportQueryRepository.search(user.getId(), req, pageable).map(ReportResponse::from);
    }

    public Report create(CustomUserDetails user) {
        Ambulance amb = ambulanceRepository.findById(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Ambulance not found"));

        Dispatch dispatch = dispatchRepository.findFirstByAmbulanceIdOrderByIdDesc(amb.getId());
        if (dispatch == null) throw new IllegalStateException("배차 내역이 없습니다.");

        DispatchHistory h = dispatch.getDispatchHistory();

        Map<String, Object> vars = buildVars(amb);

        AiReportResponse ai = aiReportGenerator.generate(vars);

        String content = ai.content(); // TEXT 저장
        String summary = limit(ai.summary(), SUMMARY_LIMIT);

        Report report = reportRepository.findByDispatchId(dispatch.getId());
        if (report == null) {
            report = Report.builder()
                    .ktas(amb.getPKtas())
                    .ambulance(amb)
                    .dispatch(dispatch)
                    .dispatchHistory(h)
                    .firestation(h != null ? h.getFirestation() : null)
                    .hospitalName(amb.getHospitalName())
                    .content(content)
                    .summary(summary)
                    .build();
        } else {
            report.updateContent(content, summary);
        }
        return reportRepository.save(report);
    }

    // ---- var builder / helpers ----
    private Map<String, Object> buildVars(Ambulance amb) {
        LocalDateTime start = amb.getTransferStartTime();
        LocalDateTime end   = amb.getTransferEndTime();
        Long minutes = (start != null && end != null) ? Duration.between(start, end).toMinutes() : null;

        Map<String, Object> vars = new HashMap<>();
        vars.put("dispatchTime", fmt(amb.getDispatchTime()));
        vars.put("transferStart", fmt(start));
        vars.put("transferEnd", fmt(end));
        vars.put("transferMinutes", minutes);

        vars.put("pName", nz(amb.getPName()));
        vars.put("pSex", mapSex(amb.getPSex()));
        vars.put("pAgeRange", amb.getPAgeRange() != null ? amb.getPAgeRange().name() : "UNDECIDED");
        vars.put("ktas", amb.getPKtas());
        vars.put("department", nz(amb.getPDepartment()));
        vars.put("condition", nz(amb.getPCondition()));
        vars.put("vitalSigns", nz(amb.getPVitalSigns()));

        vars.put("hospitalName", nz(amb.getHospitalName()));
        vars.put("hospitalAddress", nz(amb.getHospitalAddress()));

        vars.put("pastHistory", nz(amb.getPPastHistory()));
        vars.put("medicine", nz(amb.getPMedicine()));
        vars.put("familyHistory", nz(amb.getPFamilyHistory()));
        return vars;
    }

    private static String fmt(LocalDateTime t) {
        if (t == null) return "미기재";
        return t.toLocalTime().toString().substring(0, 5);
    }
    private static String nz(String s) { return (s == null || s.isBlank()) ? "미기재" : s; }
    private static String mapSex(Integer sex) {
        if (sex == null) return "UNKNOWN";
        return switch (sex) { case 0 -> "여성"; case 1 -> "남성"; default -> "미정"; };
    }
    private static String limit(String s, int max) { return (s != null && s.length() > max) ? s.substring(0, max) : s; }
}
