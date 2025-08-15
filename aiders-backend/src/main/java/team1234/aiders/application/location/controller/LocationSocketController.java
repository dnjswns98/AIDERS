// package: team1234.aiders.application.location.controller

package team1234.aiders.application.location.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;
import team1234.aiders.application.ambulance.entity.Ambulance;
import team1234.aiders.application.ambulance.repository.AmbulanceRepository;
import team1234.aiders.application.location.dto.LocationUpdateRequest;
import team1234.aiders.application.location.service.LocationSocketService;

@Controller
@RequiredArgsConstructor
public class LocationSocketController {

    private final LocationSocketService locationSocketService;
    private final AmbulanceRepository ambulanceRepository;

    /**
     * 구급차가 위치 정보를 보냄
     * 프론트에서 /pub/location/update 로 메시지를 보내면 호출됨
     */
    @MessageMapping("/location/update")
    public void receiveAmbulanceLocation(LocationUpdateRequest request) {
        Ambulance ambulance = ambulanceRepository.findById(request.ambulanceId())
                .orElseThrow(() -> new IllegalArgumentException("구급차를 찾을 수 없습니다."));

        locationSocketService.handleLocationUpdate(ambulance, request);
    }
}
