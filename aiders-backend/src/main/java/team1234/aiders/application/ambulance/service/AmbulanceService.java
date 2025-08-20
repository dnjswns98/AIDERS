package team1234.aiders.application.ambulance.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team1234.aiders.application.ambulance.dto.AmbulanceDispatchPatientInfoResponseDto;
import team1234.aiders.application.ambulance.dto.AmbulanceResponseDto;
import team1234.aiders.application.ambulance.dto.AmbulanceStatusResponseDto;
import team1234.aiders.application.ambulance.entity.AmbCurrentStatus;
import team1234.aiders.application.ambulance.entity.Ambulance;
import team1234.aiders.application.ambulance.repository.AmbulanceRepository;
import team1234.aiders.config.security.CustomUserDetails;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AmbulanceService {

    private final AmbulanceRepository ambulanceRepository;

    @Transactional(readOnly = true)
    public List<AmbulanceResponseDto> getAmbulances(CustomUserDetails user) {
        List<Ambulance> ambulances = ambulanceRepository.findAllByFirestationId(user.getId());

        return ambulances.stream()
                .map(AmbulanceResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AmbulanceStatusResponseDto getAmbulanceStatus(CustomUserDetails user) {
        Ambulance ambulance = findAmbulanceUser(user);
        return AmbulanceStatusResponseDto.fromEntity(ambulance);
    }

    @Transactional(readOnly = true)
    public AmbulanceDispatchPatientInfoResponseDto getAmbulanceDispatchPatientInfo(CustomUserDetails user) {
        Ambulance ambulance = findAmbulanceUser(user);
        return AmbulanceDispatchPatientInfoResponseDto.fromEntity(ambulance);
    }

    public void transferToWait(CustomUserDetails user) {
        Ambulance ambulance = findAmbulanceUser(user);

        ambulance.changeStatus(AmbCurrentStatus.WAIT);
        ambulance.clearPatientInfo();
        ambulance.clearHospitalInfo();
        ambulance.clearTransferInfo();
    }

    public void dispatchToTransfer(CustomUserDetails user) {
        Ambulance ambulance = findAmbulanceUser(user);

        ambulance.transferStart();
        ambulance.changeStatus(AmbCurrentStatus.TRANSFER);
    }

    private Ambulance findAmbulanceUser(CustomUserDetails user) {
        Long ambulanceId = user.getId();

        return ambulanceRepository.findById(ambulanceId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }
}
