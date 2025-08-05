package team1234.aiders.application.firestation.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import team1234.aiders.application.firestation.dto.FirestationInfoResponseDto;
import team1234.aiders.application.firestation.dto.FirestationLocationResponseDto;
import team1234.aiders.application.firestation.service.FirestationService;
import team1234.aiders.config.security.CustomUserDetails;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/firestation")
public class FirestationController {

    private final FirestationService firestationService;

    @GetMapping("/location")
    public ResponseEntity<FirestationLocationResponseDto> getFirestationLocation(@AuthenticationPrincipal CustomUserDetails user) {
        FirestationLocationResponseDto response = firestationService.getFirestationLocation(user);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<FirestationInfoResponseDto> getFirestationInfo(@AuthenticationPrincipal CustomUserDetails user) {
        FirestationInfoResponseDto response = firestationService.getFirestationInfo(user);
        return ResponseEntity.ok(response);
    }
}
