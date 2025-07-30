package team1234.aiders.application.dispatch.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import team1234.aiders.application.user.entity.Firestation;

import java.time.LocalDateTime;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DispatchHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "dispatch_history_id", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "firestation_id", nullable = false)
    private Firestation firestation;

    @Column(nullable = false)
    private Double pLatitude;

    @Column(nullable = false)
    private Double pLongitude;

    @Column(nullable = false)
    private String pAddress;

    @Column(nullable = false)
    private String pCondition;

    @CreatedDate
    private LocalDateTime createdAt;
}
