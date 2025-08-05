package team1234.aiders.application.match.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MatchingCondition {
    private String departmentCode;  // 예: "gs", "pd"
    private String ageRange;        // NEWBORN, INFANT, ADULT ...
    private boolean isTrauma;
}
