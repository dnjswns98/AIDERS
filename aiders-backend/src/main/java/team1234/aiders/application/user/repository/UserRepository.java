package team1234.aiders.application.user.repository;

import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import team1234.aiders.application.user.entity.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long>, CustomUserRepository {
    Optional<User> findByUserKey(String userKey);

    @Modifying(clearAutomatically = true)
    @Query("update User u set u.isDeleted = true where u.id = :id")
    void softDeleteById(@Param("id") Long id);

    Optional<User> findByUserKeyAndPasswordResetKey(String userKey, String passwordResetKey);
}
