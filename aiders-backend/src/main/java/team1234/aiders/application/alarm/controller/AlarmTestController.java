package team1234.aiders.application.alarm.controller;

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

        return ResponseEntity.ok("알림 저장 및 전송 성공");
    }

    @DeleteMapping("/all/{ambulanceKey}")
    public ResponseEntity<Void> deleteAllAlarms(@PathVariable String ambulanceKey) {
        alarmService.deleteAlarmsByAmbulanceKey(ambulanceKey);
        return ResponseEntity.ok().build();
    }

    @ResponseBody
    @GetMapping("{hospitalId}")
    public List<AlarmResponse> getAlarms(@PathVariable Long hospitalId) {
        return alarmService.getAllAlarmsByHospitalId(hospitalId);
    }

    @GetMapping("/matching/{hospitalId}")
    public List<AlarmResponse> getMatchingAlarms(@PathVariable Long hospitalId) {
        return alarmService.getMatchingAlarmResponses(hospitalId);
    }

    @GetMapping("/request/{hospitalId}")
    public List<AlarmResponse> getRequestAlarms(@PathVariable Long hospitalId) {
        return alarmService.getRequestAlarmResponses(hospitalId);
    }

    @GetMapping("/edit/{hospitalId}")
    public List<AlarmResponse> getEditAlarms(@PathVariable Long hospitalId) {
        return alarmService.getEditAlarmResponses(hospitalId);
    }
}

