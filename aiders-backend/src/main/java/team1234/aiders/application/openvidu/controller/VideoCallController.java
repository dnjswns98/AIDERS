package team1234.aiders.application.openvidu.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/video-call") // 추후 수정
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class VideoCallController {
}
