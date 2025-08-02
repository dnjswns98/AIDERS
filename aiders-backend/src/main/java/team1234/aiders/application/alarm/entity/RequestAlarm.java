package team1234.aiders.application.alarm.entity;

import jakarta.persistence.*;
import lombok.*;
import team1234.aiders.application.ambulance.entity.Ambulance;
import team1234.aiders.application.hospital.entity.Hospital;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class RequestAlarm {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_alarm_id", nullable = false)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ambulance_id",  nullable = false)
    private Ambulance ambulance;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id",  nullable = false)
    private Hospital hospital;
}
