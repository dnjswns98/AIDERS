// src/main/java/team1234/aiders/application/report/service/ReportService.java
package team1234.aiders.application.report.service;

import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team1234.aiders.application.ambulance.entity.Ambulance;
import team1234.aiders.application.ambulance.repository.AmbulanceRepository;
import team1234.aiders.application.dispatch.entity.Dispatch;
import team1234.aiders.application.dispatch.entity.DispatchHistory;
import team1234.aiders.application.dispatch.repository.DispatchRepository;
import team1234.aiders.application.report.dto.AiReportResponse;
import team1234.aiders.application.report.entity.Report;
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

    // M5에서는 Builder 주입만 자동으로 가능
    private final ChatClient.Builder chatClientBuilder;

    private static final int SUMMARY_LIMIT = 255;

    private ChatClient chatClient() {
        return chatClientBuilder.build();
    }

    public Report create(CustomUserDetails user) {
        Ambulance amb = ambulanceRepository.findById(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Ambulance not found"));

        Dispatch dispatch = dispatchRepository.findFirstByAmbulanceIdOrderByIdDesc(amb.getId());
        if (dispatch == null) throw new IllegalStateException("배차 내역이 없습니다.");

        DispatchHistory h = dispatch.getDispatchHistory();

        Map<String, Object> vars = buildVars(amb);

        // 템플릿 직접 치환
        String filled = fillTemplate(USER_TEMPLATE, vars);

        AiReportResponse ai = chatClient().prompt()
                .system(SYSTEM_PROMPT)
                .user(filled) // 변수 이미 치환된 문자열만 전달
                .call()
                .entity(AiReportResponse.class);

        String content = ai.content();
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

    private static String fillTemplate(String template, Map<String, Object> vars) {
        String s = template;
        for (Map.Entry<String, Object> e : vars.entrySet()) {
            String key = "{" + e.getKey() + "}";
            String val = String.valueOf(e.getValue());
            s = s.replace(key, val);
        }
        return s;
    }

    private static String fmt(LocalDateTime t) {
        if (t == null) return "미기재";
        return t.toLocalTime().toString().substring(0, 5); // HH:mm
    }

    private static String nz(String s) {
        return (s == null || s.isBlank()) ? "미기재" : s;
    }

    private static String mapSex(Integer sex) {
        if (sex == null) return "UNKNOWN";
        return switch (sex) {
            case 0 -> "여성";
            case 1 -> "남성";
            default -> "미정";
        };
    }

    private static String limit(String s, int max) {
        if (s == null) return null;
        return s.length() > max ? s.substring(0, max) : s;
    }

    // === Prompts ===
    private static final String SYSTEM_PROMPT = """
너는 한국어 의료 문서 작성 보조자다. 다음 규칙을 반드시 지켜라.

[출력 형식]
- 오직 JSON 한 줄만 반환한다.
- 스키마: {"content":"...","summary":"..."}

[content 작성 규칙]
- 한국어로 작성한다.
- 아래 섹션 제목을 포함하여 보고서형으로 쓴다:
  1) 개요
  2) 환자 인적/상태
  3) 현장/이송 전 처치
  4) 이송 경과(타임라인)
  5) 병원 인계 내용
  6) 권고사항
- 타임라인에는 출동시각, 이송시작, 이송종료를 시:분 형식으로 넣고, 주요 이벤트를 한 줄씩 요약한다.
- 과도한 미사여구 없이 간결·객관적으로 작성한다.

[summary 작성 규칙]
- 5~7줄 내로 핵심만 요약한다.
- 반드시 포함: 환자 성별/연령대, KTAS, 주요 증상/상태, 주요 처치, 이송경과 핵심, 인계 포인트.

[보안/개인정보]
- 주민등록번호, 상세 주소 등 과도한 식별정보는 적지 않는다(주소는 동/구 단위까지).
- 이름은 이니셜 처리 또는 호칭(환자)로 표기해도 된다.

[기타]
- 사실이 제공되지 않은 내용은 추정하지 말고 생략한다.
""";

    private static final String USER_TEMPLATE = """
[이송 개요]
- 출동시각: {dispatchTime}
- 이송시작: {transferStart}
- 이송종료: {transferEnd}
- 총 이송시간(분): {transferMinutes}

[환자 정보]
- 이름: {pName}
- 성별: {pSex}
- 연령대: {pAgeRange}
- 중증도(KTAS): {ktas}
- 주 진료과: {department}
- 현재 상태/증상: {condition}
- 활력징후: {vitalSigns}

[병원/인계]
- 병원명: {hospitalName}
- 병원주소: {hospitalAddress}

[특이사항/과거력]
- 과거력: {pastHistory}
- 복용약: {medicine}
- 가족력: {familyHistory}

위 정보를 바탕으로 위 규칙을 따른 JSON을 반환하라.
""";
}
