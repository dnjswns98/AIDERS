package team1234.aiders.application.hospital.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import team1234.aiders.application.hospital.dto.DepartmentUpdateRequestDto;
import team1234.aiders.application.hospital.entity.Hospital;
import team1234.aiders.application.hospital.service.HospitalService;
import team1234.aiders.config.security.CustomUserDetails;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/hospital")
public class HospitalController {

    private HospitalService hospitalService;

    @PatchMapping("/department")
    public ResponseEntity<Void> updateDepartment(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestBody DepartmentUpdateRequestDto dto) {
        hospitalService.updateDepartmentStatus(user, dto);

        return ResponseEntity.ok().build();
    }
}
