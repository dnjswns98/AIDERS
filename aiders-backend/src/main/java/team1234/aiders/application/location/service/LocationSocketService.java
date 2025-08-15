package team1234.aiders.application.location.service;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team1234.aiders.application.ambulance.entity.Ambulance;
import team1234.aiders.application.firestation.entity.Firestation;
import team1234.aiders.application.hospital.entity.Hospital;
import team1234.aiders.application.location.dto.DistanceMessage;
import team1234.aiders.application.location.dto.LocationUpdateRequest;

import static team1234.aiders.common.util.DistanceUtils.calculateDistance;

@Service
@RequiredArgsConstructor
public class LocationSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * 하나의 트랜잭션에서 병원 정보, 소방서 정보까지 접근 가능
     */
    @Transactional(readOnly = true)
    public void handleLocationUpdate(Ambulance ambulance, LocationUpdateRequest request) {
        processLocationUpdate(ambulance, request);
        sendLocationToFireStation(ambulance, request);
    }

    private void processLocationUpdate(Ambulance ambulance, LocationUpdateRequest request) {
        double lat = request.latitude();
        double lng = request.longitude();

        Hospital hospital = ambulance.getHospital();
        if (hospital == null) {
            return;
        }

        double distance = calculateDistance(lat, lng, hospital.getLatitude(), hospital.getLongitude());

        DistanceMessage message = new DistanceMessage(
                ambulance.getId(),
                hospital.getId(),
                request.ambulanceNumber(),
                lat,
                lng,
                distance
        );

        messagingTemplate.convertAndSend("/topic/location/hospital/" + hospital.getId(), message);
        messagingTemplate.convertAndSend("/topic/location/ambulance/" + ambulance.getId(), message);
    }

    private void sendLocationToFireStation(Ambulance ambulance, LocationUpdateRequest request) {
        Firestation firestation = ambulance.getFirestation();
        if (firestation == null) {
            return;
        }

        messagingTemplate.convertAndSend("/topic/location/firestation/" + firestation.getId(), request);
    }
}
