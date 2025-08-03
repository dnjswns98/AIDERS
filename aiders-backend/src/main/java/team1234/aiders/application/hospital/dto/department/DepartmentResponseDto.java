package team1234.aiders.application.hospital.dto.department;

import lombok.Getter;
import team1234.aiders.application.hospital.entity.HospitalDepartment;

@Getter
public class DepartmentResponseDto {
    private final Boolean imIsAvailable;
    private final Boolean imIsExist;

    private final Boolean gsIsAvailable;
    private final Boolean gsIsExist;

    private final Boolean nrIsAvailable;
    private final Boolean nrIsExist;

    private final Boolean nsIsAvailable;
    private final Boolean nsIsExist;

    private final Boolean osIsAvailable;
    private final Boolean osIsExist;

    private final Boolean tsIsAvailable;
    private final Boolean tsIsExist;

    private final Boolean psIsAvailable;
    private final Boolean psIsExist;

    private final Boolean obIsAvailable;
    private final Boolean obIsExist;

    private final Boolean pdIsAvailable;
    private final Boolean pdIsExist;

    private final Boolean opIsAvailable;
    private final Boolean opIsExist;

    private final Boolean entIsAvailable;
    private final Boolean entIsExist;

    private final Boolean drIsAvailable;
    private final Boolean drIsExist;

    private final Boolean urIsAvailable;
    private final Boolean urIsExist;

    private final Boolean psyIsAvailable;
    private final Boolean psyIsExist;

    private final Boolean dtIsAvailable;
    private final Boolean dtIsExist;

    private DepartmentResponseDto(HospitalDepartment dept) {
        this.imIsAvailable = dept.getImIsAvailable();
        this.imIsExist = dept.getImIsExist();
        this.gsIsAvailable = dept.getGsIsAvailable();
        this.gsIsExist = dept.getGsIsExist();
        this.nrIsAvailable = dept.getNrIsAvailable();
        this.nrIsExist = dept.getNrIsExist();
        this.nsIsAvailable = dept.getNsIsAvailable();
        this.nsIsExist = dept.getNsIsExist();
        this.osIsAvailable = dept.getOsIsAvailable();
        this.osIsExist = dept.getOsIsExist();
        this.tsIsAvailable = dept.getTsIsAvailable();
        this.tsIsExist = dept.getTsIsExist();
        this.psIsAvailable = dept.getPsIsAvailable();
        this.psIsExist = dept.getPsIsExist();
        this.obIsAvailable = dept.getObIsAvailable();
        this.obIsExist = dept.getObIsExist();
        this.pdIsAvailable = dept.getPdIsAvailable();
        this.pdIsExist = dept.getPdIsExist();
        this.opIsAvailable = dept.getOpIsAvailable();
        this.opIsExist = dept.getOpIsExist();
        this.entIsAvailable = dept.getEntIsAvailable();
        this.entIsExist = dept.getEntIsExist();
        this.drIsAvailable = dept.getDrIsAvailable();
        this.drIsExist = dept.getDrIsExist();
        this.urIsAvailable = dept.getUrIsAvailable();
        this.urIsExist = dept.getUrIsExist();
        this.psyIsAvailable = dept.getPsyIsAvailable();
        this.psyIsExist = dept.getPsyIsExist();
        this.dtIsAvailable = dept.getDtIsAvailable();
        this.dtIsExist = dept.getDtIsExist();
    }

    public static DepartmentResponseDto fromEntity(HospitalDepartment dept) {
        return new DepartmentResponseDto(dept);
    }
}
