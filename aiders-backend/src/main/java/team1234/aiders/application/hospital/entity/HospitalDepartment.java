package team1234.aiders.application.hospital.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Optional;

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

    public void updateDepartment(String code, Optional<Boolean> isExist, Optional<Boolean> isAvailable) {
        Runnable updater = getUpdater(code, isExist, isAvailable);
        updater.run();
    }

    private Runnable getUpdater(String code, Optional<Boolean> isExist, Optional<Boolean> isAvailable) {
        if ("IM".equals(code)) return () -> apply(isExist, isAvailable, v -> imIsExist = v, v -> imIsAvailable = v);
        if ("GS".equals(code)) return () -> apply(isExist, isAvailable, v -> gsIsExist = v, v -> gsIsAvailable = v);
        if ("NR".equals(code)) return () -> apply(isExist, isAvailable, v -> nrIsExist = v, v -> nrIsAvailable = v);
        if ("NS".equals(code)) return () -> apply(isExist, isAvailable, v -> nsIsExist = v, v -> nsIsAvailable = v);
        if ("OS".equals(code)) return () -> apply(isExist, isAvailable, v -> osIsExist = v, v -> osIsAvailable = v);
        if ("TS".equals(code)) return () -> apply(isExist, isAvailable, v -> tsIsExist = v, v -> tsIsAvailable = v);
        if ("PS".equals(code)) return () -> apply(isExist, isAvailable, v -> psIsExist = v, v -> psIsAvailable = v);
        if ("OB".equals(code)) return () -> apply(isExist, isAvailable, v -> obIsExist = v, v -> obIsAvailable = v);
        if ("PD".equals(code)) return () -> apply(isExist, isAvailable, v -> pdIsExist = v, v -> pdIsAvailable = v);
        if ("OP".equals(code)) return () -> apply(isExist, isAvailable, v -> opIsExist = v, v -> opIsAvailable = v);
        if ("ENT".equals(code)) return () -> apply(isExist, isAvailable, v -> entIsExist = v, v -> entIsAvailable = v);
        if ("DR".equals(code)) return () -> apply(isExist, isAvailable, v -> drIsExist = v, v -> drIsAvailable = v);
        if ("UR".equals(code)) return () -> apply(isExist, isAvailable, v -> urIsExist = v, v -> urIsAvailable = v);
        if ("PSY".equals(code)) return () -> apply(isExist, isAvailable, v -> psyIsExist = v, v -> psyIsAvailable = v);
        if ("DT".equals(code)) return () -> apply(isExist, isAvailable, v -> dtIsExist = v, v -> dtIsAvailable = v);

        throw new IllegalArgumentException("지원하지 않는 진료과 코드입니다: " + code);
    }

    private void apply(Optional<Boolean> isExist, Optional<Boolean> isAvailable,
                       java.util.function.Consumer<Boolean> existSetter,
                       java.util.function.Consumer<Boolean> availableSetter) {
        isExist.ifPresent(existSetter);
        isAvailable.ifPresent(availableSetter);
    }

}
