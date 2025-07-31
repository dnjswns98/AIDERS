package team1234.aiders.application.hospital.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import team1234.aiders.application.hospital.dto.DepartmentUpdateRequestDto;
import team1234.aiders.application.hospital.entity.Hospital;
import team1234.aiders.application.hospital.service.HospitalService;
import team1234.aiders.application.hospital.util.BedType;
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

    @PostMapping("/bed/decrease/manual")
    public ResponseEntity<Void> decreaseBedManually(@AuthenticationPrincipal CustomUserDetails user,
                                                    @RequestParam BedType type) {
        hospitalService.decreaseBedManually(user, type);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/bed/increase/manual")
    public ResponseEntity<Void> increaseBedManually(@AuthenticationPrincipal CustomUserDetails user,
                                                    @RequestParam BedType type) {
        hospitalService.increaseBedManually(user, type);
        return ResponseEntity.ok().build();
    }
}
