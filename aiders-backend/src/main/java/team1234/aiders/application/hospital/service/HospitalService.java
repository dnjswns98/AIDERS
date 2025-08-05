package team1234.aiders.application.hospital.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team1234.aiders.application.hospital.dto.HospitalInfoResponseDto;
import team1234.aiders.application.hospital.dto.HospitalLocationResponseDto;
import team1234.aiders.application.hospital.dto.department.DepartmentResponseDto;
import team1234.aiders.application.hospital.dto.department.DepartmentUpdateRequestDto;
import team1234.aiders.application.hospital.dto.emergencybed.EmergencyBedResponseDto;
import team1234.aiders.application.hospital.dto.emergencybed.EmergencyBedUpdateRequestDto;
import team1234.aiders.application.hospital.entity.EmergencyBed;
import team1234.aiders.application.hospital.entity.Hospital;
import team1234.aiders.application.hospital.entity.HospitalDepartment;
import team1234.aiders.application.hospital.repository.EmergencyBedRepository;
import team1234.aiders.application.hospital.repository.HospitalDepartmentRepository;
import team1234.aiders.application.hospital.repository.HospitalRepository;
import team1234.aiders.application.hospital.util.BedType;
import team1234.aiders.application.hospital.util.UpdateBed;
import team1234.aiders.config.security.CustomUserDetails;

@Service
@RequiredArgsConstructor
@Transactional
public class HospitalService {

    private final HospitalRepository hospitalRepository;
    private final HospitalDepartmentRepository departmentRepository;
    private final EmergencyBedRepository emergencyBedRepository;

    @Transactional(readOnly = true)
    public HospitalLocationResponseDto getHospitalLocation(CustomUserDetails user) {
        Hospital hospital = findHospital(user.getId());

        return HospitalLocationResponseDto.fromEntity(hospital);
    }

    @Transactional(readOnly = true)
    public HospitalInfoResponseDto getHospitalInfo(CustomUserDetails user) {
        Hospital hospital = findHospital(user.getId());

        return HospitalInfoResponseDto.fromEntity(hospital);
    }

    private Hospital findHospital(Long user) {
        Hospital hospital = hospitalRepository.findById(user)
                .orElseThrow(() -> new IllegalArgumentException("찾는 병원이 없습니다."));
        return hospital;
    }

    @Transactional(readOnly = true)
    public HospitalLocationResponseDto getHospitalLocationByUserId(Long userId) {
        Hospital hospital = findHospital(userId);

        return HospitalLocationResponseDto.fromEntity(hospital);
    }

    @Transactional(readOnly = true)
    public DepartmentResponseDto getDepartmentStatus(CustomUserDetails user) {
        HospitalDepartment department = findDepartmentByUser(user);
        return DepartmentResponseDto.fromEntity(department);
    }

    public void updateDepartmentStatus(CustomUserDetails user, DepartmentUpdateRequestDto request) {
        HospitalDepartment dept = findDepartmentByUser(user);

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

    private HospitalDepartment findDepartmentByUser(CustomUserDetails user) {
        HospitalDepartment department = departmentRepository.findById(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("진료과목 정보를 찾을 수 없습니다."));
        return department;
    }

    private EmergencyBed findBedByUser(CustomUserDetails user) {
        return emergencyBedRepository.findById(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("병상 정보가 없습니다."));
    }
}
