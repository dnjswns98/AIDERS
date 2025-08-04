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
import team1234.aiders.application.hospital.entity.Hospital;
import team1234.aiders.application.hospital.repository.HospitalRepository;
import team1234.aiders.application.user.dto.UserResponseDto;
import team1234.aiders.application.user.dto.ambulance.AmbulanceRegistRequestDto;
import team1234.aiders.application.user.dto.UserRegistResponseDto;
import team1234.aiders.application.user.dto.organization.OrganizationRegisterRequestDto;
import team1234.aiders.application.user.dto.password.PasswordResetAuthRequestDto;
import team1234.aiders.application.user.repository.UserRepository;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final FirestationRepository firestationRepository;
    private final HospitalRepository hospitalRepository;
    private final PasswordEncoder passwordEncoder;
    private final AmbulanceRepository ambulanceRepository;

    @Transactional(readOnly = true)
    public Page<UserResponseDto> getUsers(Pageable pageable, String search, String role) {
        return userRepository.searchUsers(pageable, search, role);
    }

    public UserRegistResponseDto registAmbulance(AmbulanceRegistRequestDto request) {
        Firestation firestation = findFirestation(request);

        PasswordInfo passwordInfo = generatePasswordInfo();

        Ambulance ambulance = createAmbulance(request, firestation, passwordInfo);
        ambulanceRepository.save(ambulance);

        return new UserRegistResponseDto(passwordInfo.getRawPassword(), passwordInfo.getResetKey());
    }

    public UserRegistResponseDto registOrganization(OrganizationRegisterRequestDto request) {
        PasswordInfo passwordInfo = generatePasswordInfo();

        if (request.getRole().equals("firestation")) {
            Firestation firestation = createFirestation(request, passwordInfo);
            firestationRepository.save(firestation);
        }
        if (request.getRole().equals("hospital")) {
            Hospital hospital = createHospital(request, passwordInfo);
            hospitalRepository.save(hospital);
        }
        return new UserRegistResponseDto(passwordInfo.getRawPassword(), passwordInfo.getResetKey());
    }

    @Transactional(readOnly = true)
    public Boolean authenticateForPasswordReset(PasswordResetAuthRequestDto request) {
        return userRepository.findByUserKeyAndPasswordResetKey(request.getUserKey(), request.getPasswordResetKey()).isPresent();
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

    private Firestation createFirestation(OrganizationRegisterRequestDto request, PasswordInfo passwordInfo) {
        return Firestation.builder()
                .userKey(request.getUserKey())
                .password(passwordInfo.getEncodedPassword())
                .passwordResetKey(passwordInfo.getResetKey())
                .role(request.getRole())
                .name(request.getName())
                .address(request.getAddress())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .build();
    }

    private Hospital createHospital(OrganizationRegisterRequestDto request, PasswordInfo passwordInfo) {
        return Hospital.builder()
                .userKey(request.getUserKey())
                .password(passwordInfo.getEncodedPassword())
                .passwordResetKey(passwordInfo.getResetKey())
                .role(request.getRole())
                .name(request.getName())
                .address(request.getAddress())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
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
