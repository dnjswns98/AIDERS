package team1234.aiders.application.ambulance.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import team1234.aiders.application.ambulance.service.AmbulanceService;
import team1234.aiders.config.security.CustomUserDetails;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/ambulance")
public class AmbulanceController {

    private AmbulanceService ambulanceService;

    @PostMapping("/transfer-to-wait")
    public ResponseEntity<Void> transferToWait(@AuthenticationPrincipal CustomUserDetails user) {
        ambulanceService.transferToWait(user);
        return ResponseEntity.ok().build();
    }
}
