package team1234.aiders.application.ambulance.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team1234.aiders.application.ambulance.dto.PatientInfoResponseDto;
import team1234.aiders.application.ambulance.dto.PatientOptionalInfoRequestDto;
import team1234.aiders.application.ambulance.dto.PatientRequiredInfoRequestDto;
import team1234.aiders.application.ambulance.entity.Ambulance;
import team1234.aiders.application.ambulance.repository.AmbulanceRepository;
import team1234.aiders.config.security.CustomUserDetails;

@Service
@RequiredArgsConstructor
@Transactional
public class PatientService {

    private final AmbulanceRepository ambulanceRepository;

    public void saveRequiredInfo(CustomUserDetails user, PatientRequiredInfoRequestDto request) {
        Ambulance ambulance = findAmbulanceUser(user);
        ambulance.updateRequiredPatientInfo(request);
    }

    public void saveOptionalInfo(CustomUserDetails user, PatientOptionalInfoRequestDto request) {
        Ambulance ambulance = findAmbulanceUser(user);
        ambulance.updateOptionalPatientInfo(request);
    }

    public PatientInfoResponseDto getPatientInfo(CustomUserDetails user) {
        Ambulance ambulance = findAmbulanceUser(user);
        return PatientInfoResponseDto.fromEntity(ambulance);
    }

    private Ambulance findAmbulanceUser(CustomUserDetails user) {
        Long ambulanceId = user.getId();

        return ambulanceRepository.findById(ambulanceId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }

    @Transactional(readOnly = true)
    public PatientInfoResponseDto getPatientInfoByAmbulanceId(Long ambulanceId, CustomUserDetails user) {
        Ambulance amb = ambulanceRepository.findById(ambulanceId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 구급차입니다. id=" + ambulanceId));

        return PatientInfoResponseDto.fromEntity(amb);
    }

}
