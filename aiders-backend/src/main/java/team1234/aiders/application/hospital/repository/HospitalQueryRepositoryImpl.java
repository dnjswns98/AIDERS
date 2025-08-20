package team1234.aiders.application.hospital.repository;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import team1234.aiders.application.hospital.dto.HospitalData;
import team1234.aiders.application.hospital.dto.QHospitalData;
import team1234.aiders.application.hospital.entity.QEmergencyBed;
import team1234.aiders.application.hospital.entity.QHospital;
import team1234.aiders.application.hospital.entity.QHospitalDepartment;
import team1234.aiders.application.match.dto.MatchingCondition;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class HospitalQueryRepositoryImpl implements HospitalQueryRepository {

    private final JPAQueryFactory queryFactory;

    @Override
    public List<HospitalData> searchHospitalsDynamic(MatchingCondition condition) {
        QHospital h = QHospital.hospital;
        QHospitalDepartment d = QHospitalDepartment.hospitalDepartment;
        QEmergencyBed b = QEmergencyBed.emergencyBed;

        BooleanBuilder builder = new BooleanBuilder();

        // 진료과 필터링
        if (condition.getDepartmentCode() != null) {
            switch (condition.getDepartmentCode()) {
                case "im" -> builder.and(d.imIsExist.isTrue().and(d.imIsAvailable.isTrue()));     // 내과
                case "gs" -> builder.and(d.gsIsExist.isTrue().and(d.gsIsAvailable.isTrue()));     // 외과
                case "nr" -> builder.and(d.nrIsExist.isTrue().and(d.nrIsAvailable.isTrue()));     // 신경과
                case "os" -> builder.and(d.osIsExist.isTrue().and(d.osIsAvailable.isTrue()));     // 정형외과
                case "ts" -> builder.and(d.tsIsExist.isTrue().and(d.tsIsAvailable.isTrue()));     // 흉부외과
                case "ps" -> builder.and(d.psIsExist.isTrue().and(d.psIsAvailable.isTrue()));     // 성형외과
                case "ob" -> builder.and(d.obIsExist.isTrue().and(d.obIsAvailable.isTrue()));     // 산부인과
                case "pd" -> builder.and(d.pdIsExist.isTrue().and(d.pdIsAvailable.isTrue()));     // 소아청소년과
                case "op" -> builder.and(d.opIsExist.isTrue().and(d.opIsAvailable.isTrue()));     // 안과
                case "ent" -> builder.and(d.entIsExist.isTrue().and(d.entIsAvailable.isTrue()));  // 이비인후과
                case "dr" -> builder.and(d.drIsExist.isTrue().and(d.drIsAvailable.isTrue()));     // 피부과
                case "ur" -> builder.and(d.urIsExist.isTrue().and(d.urIsAvailable.isTrue()));     // 비뇨의학과
                case "psy" -> builder.and(d.psyIsExist.isTrue().and(d.psyIsAvailable.isTrue()));  // 정신건강의학과
                case "dt" -> builder.and(d.dtIsExist.isTrue().and(d.dtIsAvailable.isTrue()));     // 치과
                case "ns" -> builder.and(d.nsIsExist.isTrue().and(d.nsIsAvailable.isTrue()));
            }
        }


        // 연령대 + 외상 병상 조건 필터링
        switch (condition.getAgeRange()) {
            case "NEWBORN" -> {
                builder.and(
                        b.neonatal.isExist.isTrue()
                                .and(b.neonatal.isAvailable.isTrue())
                                .and(b.neonatal.available.gt(0))
                );
            }
            case "INFANT", "KIDS", "TEENAGER" -> {
                BooleanBuilder ageBuilder = new BooleanBuilder();
                ageBuilder.or(
                        b.pediatric.isExist.isTrue()
                                .and(b.pediatric.isAvailable.isTrue())
                                .and(b.pediatric.available.gt(0))
                );
                ageBuilder.or(
                        b.general.isExist.isTrue()
                                .and(b.general.isAvailable.isTrue())
                                .and(b.general.available.gt(0))
                );
                if (condition.isTrauma()) {
                    ageBuilder.or(
                            b.trauma.isExist.isTrue()
                                    .and(b.trauma.isAvailable.isTrue())
                                    .and(b.trauma.available.gt(0))
                    );
                }
                builder.and(ageBuilder);
            }
            case "ADULT", "ELDERLY", "UNDECIDED" -> {
                BooleanBuilder adultBuilder = new BooleanBuilder();
                adultBuilder.or(
                        b.general.isExist.isTrue()
                                .and(b.general.isAvailable.isTrue())
                                .and(b.general.available.gt(0))
                );
                if (condition.isTrauma()) {
                    adultBuilder.or(
                            b.trauma.isExist.isTrue()
                                    .and(b.trauma.isAvailable.isTrue())
                                    .and(b.trauma.available.gt(0))
                    );
                }
                builder.and(adultBuilder);
            }
        }

        return queryFactory
                .select(new QHospitalData(h, d, b))
                .from(h)
                .join(h.department, d)
                .join(h.bed, b)
                .where(builder)
                .fetch();
    }
}
