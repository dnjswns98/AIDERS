package team1234.aiders.application.alarm.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import team1234.aiders.application.alarm.dto.AlarmMessage;
import team1234.aiders.application.alarm.service.AlarmService;

@Controller
@RequiredArgsConstructor
public class AlarmController {
    private final SimpMessagingTemplate messagingTemplate;
    private final AlarmService alarmService;

    @MessageMapping("/alarm/send")
    public void sendAlarm(AlarmMessage alarmMessage){
        // DB에 저장
        alarmService.saveAlarm(alarmMessage);

        // WebSocket 전송 (구독자: /topic/alarm/{hospitalId})
        String destination = "/topic/alarm/" + alarmService.getHospitalIdByAmbulanceKey(alarmMessage.getAmbulanceKey());
        messagingTemplate.convertAndSend(destination, alarmMessage);
    }
}
