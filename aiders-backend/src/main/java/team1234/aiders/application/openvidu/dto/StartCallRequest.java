package team1234.aiders.application.openvidu.dto;

import lombok.Data;

@Data
public class StartCallRequest {
    private String sessionId;
    private Long hospitalId;
}

