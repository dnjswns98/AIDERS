package team1234.aiders.application.user.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team1234.aiders.application.user.dto.UserResponseDto;
import team1234.aiders.application.user.repository.UserRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<UserResponseDto> getUsers(Pageable pageable, String search, String role) {
        return userRepository.searchUsers(pageable, search, role);
    }

    public void deleteUser(Long id) {
        userRepository.softDeleteById(id);
    }
}
