package team1234.aiders.application.ambulance.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team1234.aiders.application.ambulance.entity.AmbCurrentStatus;
import team1234.aiders.application.ambulance.entity.Ambulance;
import team1234.aiders.application.ambulance.repository.AmbulanceRepository;
import team1234.aiders.config.security.CustomUserDetails;

@Service
@RequiredArgsConstructor
public class AmbulanceService {

    private final AmbulanceRepository ambulanceRepository;

    @Transactional
    public void transferToWait(CustomUserDetails user) {
        Long userId = user.getId();

        Ambulance ambulance = ambulanceRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        ambulance.changeStatus(AmbCurrentStatus.WAIT);
        ambulance.clearPatientInfo();
        ambulance.clearHospitalInfo();
        ambulance.clearHospitalInfo();
    }
}
