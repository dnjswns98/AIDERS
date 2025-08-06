package team1234.aiders.application.match.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MatchResponse {
    private Long hospitalId;
    private String name;
    private String address;
    private double latitude;
    private double longitude;
}
