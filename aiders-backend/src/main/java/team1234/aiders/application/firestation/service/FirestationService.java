package team1234.aiders.application.firestation.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team1234.aiders.application.firestation.dto.FirestationLocationResponseDto;
import team1234.aiders.application.firestation.entity.Firestation;
import team1234.aiders.application.firestation.repository.FirestationRepository;
import team1234.aiders.config.security.CustomUserDetails;

@Service
@RequiredArgsConstructor
@Transactional
public class FirestationService {

    private final FirestationRepository firestationRepository;

    @Transactional(readOnly = true)
    public FirestationLocationResponseDto getFirestationLocation(CustomUserDetails user) {
        Firestation  firestation = firestationRepository.findById(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Firestation Not Found"));

        return FirestationLocationResponseDto.fromEntity(firestation);
    }
}
