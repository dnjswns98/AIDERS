package team1234.aiders.application.ambulance.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team1234.aiders.application.ambulance.dto.PatientOptionalInfoRequestDto;
import team1234.aiders.application.ambulance.dto.PatientRequiredInfoRequestDto;
import team1234.aiders.application.ambulance.entity.AmbCurrentStatus;
import team1234.aiders.application.ambulance.entity.Ambulance;
import team1234.aiders.application.ambulance.repository.AmbulanceRepository;
import team1234.aiders.config.security.CustomUserDetails;

@Service
@RequiredArgsConstructor
@Transactional
public class AmbulanceService {

    private final AmbulanceRepository ambulanceRepository;

    public void transferToWait(CustomUserDetails user) {
        Ambulance ambulance = findAmbulanceUser(user);

        ambulance.changeStatus(AmbCurrentStatus.WAIT);
        ambulance.clearPatientInfo();
        ambulance.clearHospitalInfo();
    }

    private Ambulance findAmbulanceUser(CustomUserDetails user) {
        Long ambulanceId = user.getId();

        return ambulanceRepository.findById(ambulanceId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }
}
