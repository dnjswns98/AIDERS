package team1234.aiders.application.alarm.service;

import jakarta.persistence.EntityNotFoundException;
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

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

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

    public List<AlarmResponse> getMatchingAlarmResponses(Long hospitalId) {
        return matchingAlarmRepository.findByHospitalId(hospitalId).stream()
                .map(alarm -> AlarmResponse.builder()
                        .id(alarm.getId())
                        .type(AlarmType.MATCHING)
                        .ambulanceKey(alarm.getAmbulanceKey())
                        .patientName(alarm.getPName())
                        .ktas(alarm.getPKtas())
                        .createdAt(alarm.getCreatedAt())
                        .message("환자 " + alarm.getPName() + "가 병원에 자동 매칭되었습니다.")
                        .build())
                .toList();
    }

    public List<AlarmResponse> getRequestAlarmResponses(Long hospitalId) {
        return requestAlarmRepository.findByHospitalId(hospitalId).stream()
                .map(alarm -> AlarmResponse.builder()
                        .id(alarm.getId())
                        .type(AlarmType.REQUEST)
                        .ambulanceKey(alarm.getAmbulance().getUserKey())
                        .createdAt(alarm.getAmbulance().getTransferStartTime())
                        .message("구급차가 통화를 요청했습니다.")
                        .build())
                .toList();
    }

    public List<AlarmResponse> getEditAlarmResponses(Long hospitalId) {
        return editAlarmRepository.findByHospitalId(hospitalId).stream()
                .map(alarm -> AlarmResponse.builder()
                        .id(alarm.getId())
                        .type(AlarmType.EDIT)
                        .ambulanceKey(alarm.getAmbulance().getUserKey())
                        .createdAt(LocalDateTime.now()) // 따로 없다면 현재시간
                        .message("환자 정보가 수정되었습니다.")
                        .build())
                .toList();
    }

    public List<AlarmResponse> getAllAlarmsByHospitalId(Long hospitalId) {
        List<AlarmResponse> result = new ArrayList<>();

        matchingAlarmRepository.findByHospitalId(hospitalId).forEach(m -> result.add(
                AlarmResponse.builder()
                        .id(m.getId())
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
                        .id(r.getId())
                        .type(AlarmType.REQUEST)
                        .ambulanceKey(r.getAmbulance().getUserKey())
                        .createdAt(null)
                        .message("구급차의 통화 요청 알림")
                        .build()
        ));

        editAlarmRepository.findByHospitalId(hospitalId).forEach(e -> result.add(
                AlarmResponse.builder()
                        .id(e.getId())
                        .type(AlarmType.EDIT)
                        .ambulanceKey(e.getAmbulance().getUserKey())
                        .createdAt(null)
                        .message("환자 정보가 수정되었습니다.")
                        .build()
        ));

        return result;
    }

    public void deleteMatchingAlarmById(Long id) {
        MatchingAlarm alarm = matchingAlarmRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("해당 알림이 존재하지 않습니다."));
        matchingAlarmRepository.delete(alarm);
    }

    public void deleteRequestAlarmById(Long id) {
        RequestAlarm alarm = requestAlarmRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("해당 알림이 존재하지 않습니다."));
        requestAlarmRepository.delete(alarm);
    }

    public void deleteEditAlarmById(Long id) {
        EditAlarm alarm = editAlarmRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("해당 알림이 존재하지 않습니다."));
        editAlarmRepository.delete(alarm);
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

    @Transactional
    public void deleteAlarmsByHospitalId(Long hospitalId) {
        boolean hasAlarms = matchingAlarmRepository.existsByHospitalId(hospitalId)
                || requestAlarmRepository.existsByHospitalId(hospitalId)
                || editAlarmRepository.existsByHospitalId(hospitalId);

        if (!hasAlarms) {
            throw new NoSuchElementException("해당 병원에 대한 알림이 존재하지 않습니다.");
        }

        matchingAlarmRepository.deleteByHospitalId(hospitalId);
        requestAlarmRepository.deleteByHospitalId(hospitalId);
        editAlarmRepository.deleteByHospitalId(hospitalId);
    }

}
