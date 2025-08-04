package team1234.aiders.application.user.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.annotation.Transient;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "role", discriminatorType = DiscriminatorType.STRING)
@EntityListeners(AuditingEntityListener.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public abstract class User {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    @Column(nullable = false, columnDefinition = "TINYINT(1) default 0")
    private Boolean isDeleted = false;

    @Column(name = "role", nullable = false, updatable = false, insertable = false)
    private String role;

    @Column(unique = true, nullable = false)
    private String userKey;

    @Column(nullable = false)
    private String password;

    @Column(unique = true, nullable = false)
    private String passwordResetKey;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    private String refreshToken;

    public User(String userKey, String role, String password, String passwordResetKey) {
        this.userKey = userKey;
        this.role = role;
        this.password = password;
        this.passwordResetKey = passwordResetKey;
    }

    public void updateRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    @Transient
    public String getRole() {
      return this.role;
    }

    public void changePassword(String encodedPassword) {
        this.password = encodedPassword;
    }
}

