package team1234.aiders.application.user.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import team1234.aiders.application.user.dto.UserResponseDto;

public interface CustomUserRepository {
    Page<UserResponseDto> searchUsers(Pageable pageable, String search, String role);
}
