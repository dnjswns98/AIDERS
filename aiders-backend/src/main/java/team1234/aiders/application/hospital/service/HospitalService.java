package team1234.aiders.application.hospital.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team1234.aiders.application.ambulance.entity.Ambulance;
import team1234.aiders.application.hospital.dto.DepartmentUpdateRequestDto;
import team1234.aiders.application.hospital.dto.EmergencyBedResponseDto;
import team1234.aiders.application.hospital.dto.EmergencyBedUpdateRequestDto;
import team1234.aiders.application.hospital.entity.EmergencyBed;
import team1234.aiders.application.hospital.entity.HospitalDepartment;
import team1234.aiders.application.hospital.repository.EmergencyBedRepository;
import team1234.aiders.application.hospital.repository.HospitalDepartmentRepository;
import team1234.aiders.application.hospital.util.BedType;
import team1234.aiders.application.hospital.util.UpdateBed;
import team1234.aiders.config.security.CustomUserDetails;

@Service
@RequiredArgsConstructor
@Transactional
public class HospitalService {

    private final HospitalDepartmentRepository departmentRepository;
    private final EmergencyBedRepository emergencyBedRepository;

    public void updateDepartmentStatus(CustomUserDetails user, DepartmentUpdateRequestDto request) {
        HospitalDepartment dept = departmentRepository.findById(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));

        dept.updateDepartment(request.getDepartmentCode(), request.getIsExist(), request.getIsAvailable());
    }

    @Transactional(readOnly = true)
    public EmergencyBedResponseDto getBedInfo(CustomUserDetails user) {
        EmergencyBed bed = findBedByUser(user);
        return EmergencyBedResponseDto.fromEntity(bed);
    }

    public void updateEmergencyBed(CustomUserDetails user ,EmergencyBedUpdateRequestDto request) {
        EmergencyBed bed = findBedByUser(user);
        UpdateBed.updateAll(request, bed);
    }

    public void decreaseBedManually(CustomUserDetails user, BedType bedType) {
        EmergencyBed bed = findBedByUser(user);
        bed.decreaseAvailableBed(bedType);
    }

    public void increaseBedManually(CustomUserDetails user, BedType bedType) {
        EmergencyBed bed = findBedByUser(user);
        bed.increaseAvailableBed(bedType);
    }

    private EmergencyBed findBedByUser(CustomUserDetails user) {
        return emergencyBedRepository.findById(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("병상 정보가 없습니다."));
    }
}
