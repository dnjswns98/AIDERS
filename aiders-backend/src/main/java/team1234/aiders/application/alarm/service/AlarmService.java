package team1234.aiders.application.alarm.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import team1234.aiders.application.alarm.dto.AlarmMessage;
import team1234.aiders.application.alarm.dto.AlarmResponse;
import team1234.aiders.application.alarm.dto.AlarmType;
import team1234.aiders.application.alarm.entity.EditAlarm;
import team1234.aiders.application.alarm.entity.MatchingAlarm;
import team1234.aiders.application.alarm.entity.RequestAlarm;
import team1234.aiders.application.alarm.repository.EditAlarmRepository;
import team1234.aiders.application.alarm.repository.MatchingAlarmRepository;
import team1234.aiders.application.alarm.repository.RequestAlarmRepository;
import team1234.aiders.application.ambulance.entity.Ambulance;
import team1234.aiders.application.ambulance.repository.AmbulanceRepository;
import team1234.aiders.application.hospital.entity.Hospital;

import java.util.ArrayList;
import java.util.List;

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
                RequestAlarm alarm = RequestAlarm.builder()
                        .hospital(hospital)
                        .ambulance(ambulance)
                        .build();
                requestAlarmRepository.save(alarm);
            }
            case EDIT -> {
                EditAlarm alarm = EditAlarm.builder()
                        .hospital(hospital)
                        .ambulance(ambulance)
                        .build();
                editAlarmRepository.save(alarm);
            }
        }
    }

    public Long getHospitalIdByAmbulanceKey(String ambulanceKey) {
        return ambulanceRepository.findByUserKey(ambulanceKey)
                .orElseThrow()
                .getHospital().getId();
    }

    public List<AlarmResponse> getAllAlarmsByHospitalId(Long hospitalId) {
        List<AlarmResponse> result = new ArrayList<>();

        matchingAlarmRepository.findByHospitalId(hospitalId).forEach(m -> result.add(
                AlarmResponse.builder()
                        .type(AlarmType.MATCHING)
                        .ambulanceKey(m.getAmbulanceKey())
                        .patientName(m.getPName())
                        .ktas(m.getPKtas())
                        .createdAt(m.getCreatedAt())
                        .message("환자 " + m.getPName() + " 매칭 완료")
                        .build()
        ));

        requestAlarmRepository.findByHospitalId(hospitalId).forEach(r -> result.add(
                AlarmResponse.builder()
                        .type(AlarmType.REQUEST)
                        .ambulanceKey(r.getAmbulance().getUserKey())
                        .createdAt(null)
                        .message("구급차의 통화 요청 알림")
                        .build()
        ));

        editAlarmRepository.findByHospitalId(hospitalId).forEach(e -> result.add(
                AlarmResponse.builder()
                        .type(AlarmType.EDIT)
                        .ambulanceKey(e.getAmbulance().getUserKey())
                        .createdAt(null)
                        .message("환자 정보가 수정되었습니다.")
                        .build()
        ));

        return result;
    }

    @Transactional
    public void deleteAlarmsByAmbulanceKey(String ambulanceKey) {
        Ambulance ambulance = ambulanceRepository.findByUserKey(ambulanceKey)
                .orElseThrow(() -> new IllegalArgumentException("구급차를 찾을 수 없습니다."));
        Hospital hospital = ambulance.getHospital();

        matchingAlarmRepository.deleteByAmbulanceKeyAndHospitalId(ambulanceKey, hospital.getId());
        requestAlarmRepository.deleteByAmbulanceAndHospital(ambulance, hospital);
        editAlarmRepository.deleteByAmbulanceAndHospital(ambulance, hospital);
    }

}
