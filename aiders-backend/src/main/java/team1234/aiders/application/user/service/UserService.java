package team1234.aiders.application.user.service;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team1234.aiders.application.ambulance.entity.Ambulance;
import team1234.aiders.application.ambulance.repository.AmbulanceRepository;
import team1234.aiders.application.firestation.entity.Firestation;
import team1234.aiders.application.firestation.repository.FirestationRepository;
import team1234.aiders.application.user.dto.UserResponseDto;
import team1234.aiders.application.user.dto.ambulance.AmbulanceRegistRequestDto;
import team1234.aiders.application.user.dto.ambulance.AmbulanceRegistResponseDto;
import team1234.aiders.application.user.repository.UserRepository;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final FirestationRepository firestationRepository;
    private final PasswordEncoder passwordEncoder;
    private final AmbulanceRepository ambulanceRepository;

    @Transactional(readOnly = true)
    public Page<UserResponseDto> getUsers(Pageable pageable, String search, String role) {
        return userRepository.searchUsers(pageable, search, role);
    }

    public AmbulanceRegistResponseDto registAmbulance(AmbulanceRegistRequestDto request) {
        Firestation firestation = findFirestation(request);

        PasswordInfo passwordInfo = generatePasswordInfo();

        Ambulance ambulance = createAmbulance(request, firestation, passwordInfo);
        ambulanceRepository.save(ambulance);

        return new AmbulanceRegistResponseDto(passwordInfo.getRawPassword(), passwordInfo.getResetKey());
    }

    public void deleteUser(Long id) {
        userRepository.softDeleteById(id);
    }

    private Firestation findFirestation(AmbulanceRegistRequestDto request) {
        Firestation firestation = firestationRepository.findByName(request.getName())
                .orElseThrow(() -> new IllegalArgumentException("소방서 정보를 찾을 수 없습니다."));
        return firestation;
    }

    private PasswordInfo generatePasswordInfo() {
        String rawPassword = UUID.randomUUID().toString();
        String resetKey = UUID.randomUUID().toString();
        String encodedPassword = passwordEncoder.encode(rawPassword);
        return new PasswordInfo(rawPassword, resetKey, encodedPassword);
    }

    private Ambulance createAmbulance(
            AmbulanceRegistRequestDto request, Firestation firestation, PasswordInfo passwordInfo) {
        return Ambulance.builder()
                .userKey(request.getUserKey())
                .role(request.getRole())
                .password(passwordInfo.getEncodedPassword())
                .passwordResetKey(passwordInfo.getResetKey())
                .firestation(firestation)
                .build();
    }

    @Getter
    @AllArgsConstructor
    private static class PasswordInfo {
        private final String rawPassword;
        private final String resetKey;
        private final String encodedPassword;
    }
}
