package team1234.aiders.application.report.repository;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.OrderSpecifier;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Repository;
import team1234.aiders.application.report.dto.ReportSearchRequest;
import team1234.aiders.application.report.entity.Report;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import static team1234.aiders.application.report.entity.QReport.report;
import static team1234.aiders.application.ambulance.entity.QAmbulance.ambulance;

@Repository
@RequiredArgsConstructor
public class ReportQueryRepository {

    private final JPAQueryFactory query;

    public Page<Report> search(Long firestationId, ReportSearchRequest req, Pageable pageable) {
        BooleanBuilder where = new BooleanBuilder();

        // 소유권(소방서)
        where.and(report.firestation.id.eq(firestationId));

        // 날짜 필터
        LocalDateTime now = LocalDateTime.now();
        if (req.from() != null && req.to() != null) {
            where.and(report.createdAt.goe(req.from().atStartOfDay()));
            where.and(report.createdAt.loe(req.to().atTime(LocalTime.MAX)));
        } else if (req.from() != null) {
            where.and(report.createdAt.goe(req.from().atStartOfDay()));
            where.and(report.createdAt.loe(now));
        } else if (req.to() != null) {
            where.and(report.createdAt.loe(req.to().atTime(LocalTime.MAX)));
        }

        if (req.ktas() != null) where.and(report.ktas.eq(req.ktas()));

        boolean filterByUserKey = req.userKey() != null && !req.userKey().isBlank();

        if (req.keyword() != null && !req.keyword().isBlank()) {
            String kw = "%" + req.keyword().trim() + "%";
            where.and(report.content.like(kw).or(report.summary.like(kw)));
        }

        OrderSpecifier<?>[] orderSpecifiers = toOrderSpecifiers(pageable.getSort());

        var base = query.selectFrom(report);
        if (filterByUserKey) {
            base = base.join(report.ambulance, ambulance)
                    .where(ambulance.userKey.eq(req.userKey()));
        }

        List<Report> contents = base
                .where(where)
                .orderBy(orderSpecifiers)
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        Long total = (filterByUserKey
                ? query.select(report.count())
                .from(report).join(report.ambulance, ambulance)
                .where(where.and(ambulance.userKey.eq(req.userKey())))
                .fetchOne()
                : query.select(report.count())
                .from(report)
                .where(where)
                .fetchOne());

        return new PageImpl<>(contents, pageable, total == null ? 0 : total);
    }

    private OrderSpecifier<?>[] toOrderSpecifiers(Sort sort) {
        if (sort == null || sort.isEmpty()) return new OrderSpecifier<?>[]{ report.createdAt.desc() };
        List<OrderSpecifier<?>> list = new ArrayList<>();
        for (Sort.Order o : sort) {
            OrderSpecifier<?> spec = switch (o.getProperty()) {
                case "createdAt"    -> o.isAscending() ? report.createdAt.asc()    : report.createdAt.desc();
                case "ktas"         -> o.isAscending() ? report.ktas.asc()         : report.ktas.desc();
                case "hospitalName" -> o.isAscending() ? report.hospitalName.asc() : report.hospitalName.desc();
                default             -> report.createdAt.desc();
            };
            list.add(spec);
        }
        if (list.isEmpty()) list.add(report.createdAt.desc());
        return list.toArray(new OrderSpecifier<?>[0]);
    }
}
