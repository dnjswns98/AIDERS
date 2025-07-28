package team1234.aiders.application.user.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "role", discriminatorType = DiscriminatorType.STRING)
public class User {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    private Boolean isDeleted;

    @Column(unique = true, nullable = false)
    private String userKey;

    @Column(unique = true, nullable = false)
    private String password;

    @Column(unique = true, nullable = false)
    private String passwordResetKey;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private String accessToken;
    private String refreshToken;
}

