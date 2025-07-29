package team1234.aiders.application.alarm.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import team1234.aiders.application.user.entity.Hospital;

import java.time.LocalDateTime;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MatchingAlarm {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "matching_alarm_id",  nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id",  nullable = false)
    private Hospital hospital;

    @CreatedDate
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private String pName;

    @Column(nullable = false)
    private Integer pKtas;

    @Column(nullable = false)
    private String ambulanceKey;
}
