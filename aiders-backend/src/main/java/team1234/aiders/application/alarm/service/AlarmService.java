package team1234.aiders.application.alarm.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import team1234.aiders.application.alarm.dto.AlarmMessage;
import team1234.aiders.application.alarm.entity.MatchingAlarm;
import team1234.aiders.application.alarm.repository.EditAlarmRepository;
import team1234.aiders.application.alarm.repository.MatchingAlarmRepository;
import team1234.aiders.application.alarm.repository.RequestAlarmRepository;
import team1234.aiders.application.ambulance.entity.Ambulance;
import team1234.aiders.application.ambulance.repository.AmbulanceRepository;
import team1234.aiders.application.hospital.entity.Hospital;

@Service
@RequiredArgsConstructor
public class AlarmService {

    private final AmbulanceRepository ambulanceRepository;
    private final MatchingAlarmRepository matchingAlarmRepository;
    private final RequestAlarmRepository requestAlarmRepository;
    private final EditAlarmRepository editAlarmRepository;

    public void saveAlarm(AlarmMessage message) {
        Ambulance ambulance = ambulanceRepository.findByUserKey(message.getAmbulanceKey())
                .orElseThrow(() -> new IllegalArgumentException("해당 구급차를 찾을 수 없습니다."));

        Hospital hospital = ambulance.getHospital();

        switch (message.getType()) {
            case MATCHING -> {
                MatchingAlarm alarm = MatchingAlarm.builder()
                        .hospital(hospital)
                        .pName(message.getPatientName())
                        .pKtas(message.getKtas())
                        .ambulanceKey(message.getAmbulanceKey())
                        .build();
                matchingAlarmRepository.save(alarm);
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
