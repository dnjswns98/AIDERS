package team1234.aiders.application.dispatch.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import team1234.aiders.application.user.entity.Ambulance;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Dispatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "dispatch_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ambulance_id")
    private Ambulance ambulance;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dispatch_history_id")
    private DispatchHistory dispatchHistory;
}
