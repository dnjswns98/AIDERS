package team1234.aiders.application.alarm.controller;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import team1234.aiders.application.alarm.dto.AlarmMessage;
import team1234.aiders.application.alarm.dto.AlarmResponse;
import team1234.aiders.application.alarm.entity.EditAlarm;
import team1234.aiders.application.alarm.entity.MatchingAlarm;
import team1234.aiders.application.alarm.entity.RequestAlarm;
import team1234.aiders.application.alarm.service.AlarmService;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/test/alarm")
public class AlarmTestController {

    private final AlarmService alarmService;
    private final SimpMessagingTemplate messagingTemplate;

    @PostMapping("/send")
    @Operation(summary = "알림 생성 및 WebSocket 전송", description = "알림을 저장하고 해당 병원에 WebSocket 메시지를 전송")
    public ResponseEntity<String> saveAndSendAlarm(@RequestBody AlarmMessage alarmMessage) {
        if (alarmMessage.getCreatedAt() == null) {
            alarmMessage.setCreatedAt(LocalDateTime.now());
        }

        // 1. DB 저장
        alarmService.saveAlarm(alarmMessage);

        // 2. 병원 ID 조회
        Long hospitalId = alarmService.getHospitalIdByAmbulanceKey(alarmMessage.getAmbulanceKey());

        // 3. WebSocket 메시지 전송
        String destination = "/topic/alarm/" + hospitalId;
        messagingTemplate.convertAndSend(destination, alarmMessage);

        return ResponseEntity.ok(alarmMessage.getType() + "알림 저장 및 전송 성공");
    }

    @GetMapping("{hospitalId}")
    @Operation(summary = "병원의 전체 알림 목록 조회", description = "해당 병원 ID에 대한 모든 알림 목록을 조회")
    public List<AlarmResponse> getAlarms(@PathVariable Long hospitalId) {
        return alarmService.getAllAlarmsByHospitalId(hospitalId);
    }

    @GetMapping("/matching/{hospitalId}")
    @Operation(summary = "매칭 알림 목록 조회", description = "해당 병원에 대한 매칭 알림 목록을 조회")
    public List<AlarmResponse> getMatchingAlarms(@PathVariable Long hospitalId) {
        return alarmService.getMatchingAlarmResponses(hospitalId);
    }

    @GetMapping("/request/{hospitalId}")
    @Operation(summary = "통화 요청 알림 목록 조회", description = "해당 병원에 대한 통화 요청 알림 목록을 조회")
    public List<AlarmResponse> getRequestAlarms(@PathVariable Long hospitalId) {
        return alarmService.getRequestAlarmResponses(hospitalId);
    }

    @GetMapping("/edit/{hospitalId}")
    @Operation(summary = "수정 알림 목록 조회", description = "해당 병원에 대한 환자 정보 수정 알림 목록을 조회")
    public List<AlarmResponse> getEditAlarms(@PathVariable Long hospitalId) {
        return alarmService.getEditAlarmResponses(hospitalId);
    }

    @DeleteMapping("/matching/{id}")
    @Operation(summary = "매칭 알림 삭제", description = "알림 ID로 매칭 알림을 삭제")
    public ResponseEntity<Void> deleteMatchingAlarm(@PathVariable Long id) {
        alarmService.deleteMatchingAlarmById(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/request/{id}")
    @Operation(summary = "통화 요청 알림 삭제", description = "알림 ID로 통화 요청 알림을 삭제")
    public ResponseEntity<Void> deleteRequestAlarm(@PathVariable Long id) {
        alarmService.deleteRequestAlarmById(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/edit/{id}")
    @Operation(summary = "수정 알림 삭제", description = "알림 ID로 환자 정보 수정 알림을 삭제")
    public ResponseEntity<Void> deleteEditAlarm(@PathVariable Long id) {
        alarmService.deleteEditAlarmById(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/all/{ambulanceKey}")
    @Operation(summary = "해당 구급차의 모든 알림 삭제", description = "구급차 키를 기반으로 매칭, 요청, 수정 알림 모두 삭제")
    public ResponseEntity<Void> deleteAllAlarms(@PathVariable String ambulanceKey) {
        alarmService.deleteAlarmsByAmbulanceKey(ambulanceKey);
        return ResponseEntity.ok().build();
    }
}

