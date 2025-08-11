package team1234.aiders.application.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import team1234.aiders.application.user.entity.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long>, CustomUserRepository {
    Optional<User> findByUserKey(String userKey);

    @Modifying(clearAutomatically = true)
    @Query("update User u set u.isDeleted = true where u.id = :id")
    void softDeleteById(@Param("id") Long id);

    Optional<User> findByUserKeyAndPasswordResetKey(String userKey, String passwordResetKey);

    @Query("select u.id as id, u.userKey as userKey, u.password as password, u.role as role" +
            " from User u" +
            " where u.userKey = :userKey and u.isDeleted = false")
    Optional<LoginProjection> findUserByUserKey(@Param("userKey") String userKey);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value =
            "update user " +
            "set refresh_token = :refreshToken " +
            "where user_id = :userId", nativeQuery = true)
    int updateRefreshToken(@Param("userId") Long userId, @Param("refreshToken") String refreshToken);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value =
            "update user " +
            "set refresh_token = NULL " +
            "where user_key = :userKey and is_deleted = 0", nativeQuery = true)
    int clearRefreshTokenByUserKey(@Param("userKey") String userKey);

    @Query("select u.id as id, u.userKey as userKey, u.role as role, u.refreshToken as refreshToken" +
            " from User u" +
            " where u.userKey = :userKey and u.isDeleted = false")
    Optional<ReissueProjection> findReissueByUserKey(@Param("userKey") String userKey);

    interface LoginProjection {
        Long getId();
        String getUserKey();
        String getPassword();
        String getRole();
    }

    interface ReissueProjection {
        Long getId();
        String getUserKey();
        String getRole();
        String getRefreshToken();
    }
}
