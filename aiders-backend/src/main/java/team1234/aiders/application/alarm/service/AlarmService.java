package team1234.aiders.application.alarm.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import team1234.aiders.application.alarm.dto.AlarmMessage;
import team1234.aiders.application.ambulance.repository.AmbulanceRepository;

@Service
@RequiredArgsConstructor
public class AlarmService {

    private final AmbulanceRepository ambulanceRepository;

    public void saveAlarm(AlarmMessage message) {
        // message.getType()에 따라 서로 다른 알람 저장
        switch (message.getType()) {
            case MATCHING -> {
                // MatchingAlarm 생성 후 저장
            }
            case REQUEST -> {
                // RequestAlarm 생성 후 저장
            }
            case EDIT -> {
                // EditAlarm 생성 후 저장
            }
        }
    }

    public Long getHospitalIdByAmbulanceKey(String ambulanceKey) {
        return ambulanceRepository.findByUserKey(ambulanceKey)
                .orElseThrow()
                .getHospital().getId();
    }
}
