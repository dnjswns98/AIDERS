package team1234.aiders.application.dispatch.dto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Getter
@RequiredArgsConstructor
public class DispatchRequestDto {
    private List<Long> ambulanceIds;
    private Double latitude;
    private Double longitude;
    private String address;
    private String condition;
}
