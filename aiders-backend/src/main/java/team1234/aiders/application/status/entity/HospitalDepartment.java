package team1234.aiders.application.status.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import team1234.aiders.application.user.entity.Hospital;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class HospitalDepartment {

    @Id
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "hospital_id",  nullable = false)
    private Hospital hospital;

    private Boolean imIsAvailable;
    private Boolean imIsExist;

    private Boolean gsIsAvailable;
    private Boolean gsIsExist;

    private Boolean nrIsAvailable;
    private Boolean nrIsExist;

    private Boolean nsIsAvailable;
    private Boolean nsIsExist;

    private Boolean osIsAvailable;
    private Boolean osIsExist;

    private Boolean tsIsAvailable;
    private Boolean tsIsExist;

    private Boolean psIsAvailable;
    private Boolean psIsExist;

    private Boolean obIsAvailable;
    private Boolean obIsExist;

    private Boolean pdIsAvailable;
    private Boolean pdIsExist;

    private Boolean opIsAvailable;
    private Boolean opIsExist;

    private Boolean entIsAvailable;
    private Boolean entIsExist;

    private Boolean drIsAvailable;
    private Boolean drIsExist;

    private Boolean urIsAvailable;
    private Boolean urIsExist;

    private Boolean psyIsAvailable;
    private Boolean psyIsExist;

    private Boolean dtIsAvailable;
    private Boolean dtIsExist;
}
