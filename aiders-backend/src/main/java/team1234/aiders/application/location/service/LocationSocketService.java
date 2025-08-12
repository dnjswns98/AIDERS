// package: team1234.aiders.application.location.service

package team1234.aiders.application.location.service;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import team1234.aiders.application.ambulance.entity.Ambulance;
import team1234.aiders.application.ambulance.repository.AmbulanceRepository;
import team1234.aiders.application.hospital.entity.Hospital;
import team1234.aiders.application.location.dto.DistanceMessage;
import team1234.aiders.application.location.dto.LocationUpdateRequest;

import static team1234.aiders.common.util.DistanceUtils.calculateDistance;

@Service
@RequiredArgsConstructor
public class LocationSocketService {

    private final AmbulanceRepository ambulanceRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public void processLocationUpdate(LocationUpdateRequest request) {
        Long ambulanceId = request.ambulanceId();
        double lat = request.latitude();
        double lng = request.longitude();

        // 구급차 찾기
        Ambulance ambulance = ambulanceRepository.findById(ambulanceId)
                .orElseThrow(() -> new IllegalArgumentException("구급차를 찾을 수 없습니다."));

        // 매칭된 병원 가져오기
        Hospital hospital = ambulance.getHospital();
        if (hospital == null) {
            return; // 아직 병원과 매칭되지 않았다면 아무것도 하지 않음
        }

        double hospitalLat = hospital.getLatitude();
        double hospitalLng = hospital.getLongitude();

        // 거리 계산
        double distance = calculateDistance(lat, lng, hospitalLat, hospitalLng);

        // 양측에 메시지 전송
        DistanceMessage message = new DistanceMessage(ambulanceId, hospital.getId(), request.ambulanceNumber(), lat, lng, distance);

        // 병원에게
        messagingTemplate.convertAndSend("/topic/location/hospital/" + hospital.getId(), message);

        // 구급차에게
        messagingTemplate.convertAndSend("/topic/location/ambulance/" + ambulanceId, message);
    }
}
