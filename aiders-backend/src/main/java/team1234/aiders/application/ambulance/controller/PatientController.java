package team1234.aiders.application.ambulance.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import team1234.aiders.application.ambulance.dto.PatientInfoResponseDto;
import team1234.aiders.application.ambulance.dto.PatientOptionalInfoRequestDto;
import team1234.aiders.application.ambulance.dto.PatientRequiredInfoRequestDto;
import team1234.aiders.application.ambulance.entity.Ambulance;
import team1234.aiders.application.ambulance.service.PatientService;
import team1234.aiders.config.security.CustomUserDetails;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/patient")
public class PatientController {

    private final PatientService patientService;

    @PutMapping("/required")
    public ResponseEntity<Void> saveRequiredInfo(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestBody PatientRequiredInfoRequestDto dto) {
        patientService.saveRequiredInfo(user, dto);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/optional")
    public ResponseEntity<Void> saveOptionalInfo(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestBody PatientOptionalInfoRequestDto dto) {
        patientService.saveOptionalInfo(user, dto);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/")
    public ResponseEntity<PatientInfoResponseDto> getPatientInfo(@AuthenticationPrincipal CustomUserDetails user) {
        PatientInfoResponseDto info = patientService.getPatientInfo(user);
        return ResponseEntity.ok().body(info);
    }

    @GetMapping("/{ambulanceId}")
    public ResponseEntity<PatientInfoResponseDto> getPatientInfoByAmbulanceId(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long ambulanceId) {
        PatientInfoResponseDto info = patientService.getPatientInfoByAmbulanceId(ambulanceId, user);
        return ResponseEntity.ok(info);
    }
}
