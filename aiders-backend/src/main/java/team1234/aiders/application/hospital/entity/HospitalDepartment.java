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
        switch (code) {
            case "IM" -> {
                isExist.ifPresent(value -> this.imIsExist = value);
                isAvailable.ifPresent(value -> this.imIsAvailable = value);
            }
            case "GS" -> {
                isExist.ifPresent(value -> this.gsIsExist = value);
                isAvailable.ifPresent(value -> this.gsIsAvailable = value);
            }
            case "NR" -> {
                isExist.ifPresent(value -> this.nrIsExist = value);
                isAvailable.ifPresent(value -> this.nrIsAvailable = value);
            }
            case "NS" -> {
                isExist.ifPresent(value -> this.nsIsExist = value);
                isAvailable.ifPresent(value -> this.nsIsAvailable = value);
            }
            case "OS" -> {
                isExist.ifPresent(value -> this.osIsExist = value);
                isAvailable.ifPresent(value -> this.osIsAvailable = value);
            }
            case "TS" -> {
                isExist.ifPresent(value -> this.tsIsExist = value);
                isAvailable.ifPresent(value -> this.tsIsAvailable = value);
            }
            case "PS" -> {
                isExist.ifPresent(value -> this.psIsExist = value);
                isAvailable.ifPresent(value -> this.psIsAvailable = value);
            }
            case "OB" -> {
                isExist.ifPresent(value -> this.obIsExist = value);
                isAvailable.ifPresent(value -> this.obIsAvailable = value);
            }
            case "PD" -> {
                isExist.ifPresent(value -> this.pdIsExist = value);
                isAvailable.ifPresent(value -> this.pdIsAvailable = value);
            }
            case "OP" -> {
                isExist.ifPresent(value -> this.opIsExist = value);
                isAvailable.ifPresent(value -> this.opIsAvailable = value);
            }
            case "ENT" -> {
                isExist.ifPresent(value -> this.entIsExist = value);
                isAvailable.ifPresent(value -> this.entIsAvailable = value);
            }
            case "DR" -> {
                isExist.ifPresent(value -> this.drIsExist = value);
                isAvailable.ifPresent(value -> this.drIsAvailable = value);
            }
            case "UR" -> {
                isExist.ifPresent(value -> this.urIsExist = value);
                isAvailable.ifPresent(value -> this.urIsAvailable = value);
            }
            case "PSY" -> {
                isExist.ifPresent(value -> this.psyIsExist = value);
                isAvailable.ifPresent(value -> this.psyIsAvailable = value);
            }
            case "DT" -> {
                isExist.ifPresent(value -> this.dtIsExist = value);
                isAvailable.ifPresent(value -> this.dtIsAvailable = value);
            }
            default -> throw new IllegalArgumentException("지원하지 않는 진료과 코드입니다: " + code);
        }
    }
}
