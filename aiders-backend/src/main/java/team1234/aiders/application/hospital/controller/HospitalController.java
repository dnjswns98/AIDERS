package team1234.aiders.application.hospital.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import team1234.aiders.application.hospital.dto.HospitalInfoResponseDto;
import team1234.aiders.application.hospital.dto.HospitalLocationResponseDto;
import team1234.aiders.application.hospital.dto.department.DepartmentResponseDto;
import team1234.aiders.application.hospital.dto.department.DepartmentUpdateRequestDto;
import team1234.aiders.application.hospital.dto.emergencybed.EmergencyBedResponseDto;
import team1234.aiders.application.hospital.dto.emergencybed.EmergencyBedRequestDto;
import team1234.aiders.application.hospital.service.HospitalService;
import team1234.aiders.application.hospital.util.BedType;
import team1234.aiders.config.security.CustomUserDetails;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/hospital")
public class HospitalController {

    private final HospitalService hospitalService;

    @GetMapping("/location")
    public ResponseEntity<HospitalLocationResponseDto> getHospitalLocation(@AuthenticationPrincipal CustomUserDetails user) {
        HospitalLocationResponseDto response = hospitalService.getHospitalLocation(user);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<HospitalInfoResponseDto> getHospitalInfo(@AuthenticationPrincipal CustomUserDetails user) {
        HospitalInfoResponseDto response = hospitalService.getHospitalInfo(user);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/location/{userId}")
    public ResponseEntity<HospitalLocationResponseDto> getHospitalLocationByUserId(@PathVariable Long userId) {
        HospitalLocationResponseDto response = hospitalService.getHospitalLocationByUserId(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/department")
    public ResponseEntity<DepartmentResponseDto> getDepartments(@AuthenticationPrincipal CustomUserDetails user) {
        DepartmentResponseDto response = hospitalService.getDepartmentStatus(user);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/department")
    public ResponseEntity<Void> updateDepartment(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestBody DepartmentUpdateRequestDto dto) {
        hospitalService.updateDepartmentStatus(user, dto);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/bed")
    public ResponseEntity<EmergencyBedResponseDto> getBedInfo(@AuthenticationPrincipal CustomUserDetails user) {
        EmergencyBedResponseDto response = hospitalService.getBedInfo(user);
        return ResponseEntity.ok().body(response);
    }

    @PatchMapping("/bed")
    public ResponseEntity<Void> updateBedInfo(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestBody EmergencyBedRequestDto request) {
        hospitalService.updateEmergencyBed(user, request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/bed/decrease/manual")
    public ResponseEntity<Void> decreaseBedManually(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestParam BedType type) {
        hospitalService.decreaseBedManually(user, type);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/bed/increase/manual")
    public ResponseEntity<Void> increaseBedManually(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestParam BedType type) {
        hospitalService.increaseBedManually(user, type);
        return ResponseEntity.ok().build();
    }
}
