// package: team1234.aiders.application.location.controller

package team1234.aiders.application.location.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;
import team1234.aiders.application.location.dto.LocationUpdateRequest;
import team1234.aiders.application.location.service.LocationSocketService;

@Controller
@RequiredArgsConstructor
public class LocationSocketController {

    private final LocationSocketService locationSocketService;

    /**
     * 구급차가 위치 정보를 보냄
     * 프론트에서 /pub/location/update 로 메시지를 보내면 호출됨
     */
    @MessageMapping("/location/update")
    public void receiveAmbulanceLocation(LocationUpdateRequest request) {
        locationSocketService.processLocationUpdate(request);
    }
}
