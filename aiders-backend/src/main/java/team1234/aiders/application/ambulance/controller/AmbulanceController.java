package team1234.aiders.application.ambulance.controller;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import team1234.aiders.application.ambulance.dto.AmbulanceResponseDto;
import team1234.aiders.application.ambulance.dto.AmbulanceStatusResponseDto;
import team1234.aiders.application.ambulance.service.AmbulanceService;
import team1234.aiders.config.security.CustomUserDetails;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/ambulance")
public class AmbulanceController {

    private final AmbulanceService ambulanceService;

    @GetMapping("/list")
    public ResponseEntity<List<AmbulanceResponseDto>> getAllAmbulances(@AuthenticationPrincipal CustomUserDetails user) {
        List<AmbulanceResponseDto> result = ambulanceService.getAmbulances(user);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/status")
    public ResponseEntity<AmbulanceStatusResponseDto> getAmbulanceStatus(@AuthenticationPrincipal CustomUserDetails user) {
        AmbulanceStatusResponseDto result = ambulanceService.getAmbulanceStatus(user);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/transfer/wait")
    public ResponseEntity<Void> transferToWait(@AuthenticationPrincipal CustomUserDetails user) {
        ambulanceService.transferToWait(user);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/transfer")
    public ResponseEntity<Void> dispatchToTransfer(@AuthenticationPrincipal CustomUserDetails user) {
        ambulanceService.dispatchToTransfer(user);
        return ResponseEntity.ok().build();
    }
}
