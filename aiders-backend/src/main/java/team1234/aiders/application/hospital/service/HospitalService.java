package team1234.aiders.application.hospital.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team1234.aiders.application.hospital.dto.DepartmentUpdateRequestDto;
import team1234.aiders.application.hospital.entity.HospitalDepartment;
import team1234.aiders.application.hospital.repository.HospitalDepartmentRepository;
import team1234.aiders.config.security.CustomUserDetails;

@Service
@RequiredArgsConstructor
@Transactional
public class HospitalService {

    private final HospitalDepartmentRepository departmentRepository;

    public void updateDepartmentStatus(CustomUserDetails user, DepartmentUpdateRequestDto request) {
        HospitalDepartment dept = departmentRepository.findById(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));

        dept.updateDepartment(request.getDepartmentCode(), request.getIsExist(), request.getIsAvailable());
    }
}
