package team1234.aiders.application.report.ai;

import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Component;
import team1234.aiders.application.report.dto.AiReportResponse;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class DefaultAiReportGenerator implements AiReportGenerator {

    private final ChatClient.Builder chatClientBuilder;

    @Override
    public AiReportResponse generate(Map<String, Object> vars) {
        String userPrompt = fillTemplate(USER_TEMPLATE, vars);
        return chatClientBuilder.build()
                .prompt()
                .system(SYSTEM_PROMPT)
                .user(userPrompt)
                .call()
                .entity(AiReportResponse.class);
    }

    private static String fillTemplate(String template, Map<String, Object> vars) {
        String s = template;
        for (var e : vars.entrySet()) {
            s = s.replace("{" + e.getKey() + "}", String.valueOf(e.getValue()));
        }
        return s;
    }

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
