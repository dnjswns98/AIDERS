package team1234.aiders.application.report.ai;

import team1234.aiders.application.report.dto.AiReportResponse;
import java.util.Map;

public interface AiReportGenerator {
    AiReportResponse generate(Map<String, Object> vars);
}
