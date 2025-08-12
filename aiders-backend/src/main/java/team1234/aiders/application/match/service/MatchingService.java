// src/main/java/team1234/aiders/application/match/service/MatchingService.java
package team1234.aiders.application.match.service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team1234.aiders.application.ambulance.entity.Ambulance;
import team1234.aiders.application.ambulance.repository.AmbulanceRepository;
import team1234.aiders.application.hospital.dto.HospitalData;
import team1234.aiders.application.hospital.entity.EmergencyBed;
import team1234.aiders.application.hospital.entity.Hospital;
import team1234.aiders.application.hospital.repository.HospitalRepository;
import team1234.aiders.application.hospital.util.BedType;
import team1234.aiders.application.match.dto.MatchingCondition;
import team1234.aiders.application.report.repository.ReportRepository;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static team1234.aiders.common.util.DistanceUtils.calculateDistance;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class MatchingService {

    private final AmbulanceRepository ambulanceRepository;
    private final HospitalRepository hospitalRepository;
    private final ReportRepository reportRepository;

    @PersistenceContext
    private EntityManager em;

    record ScoredHospitalData(HospitalData data, double distance) {}
    record HospitalScore(ScoredHospitalData hospitalData, double score) {}

    public Hospital getMatchedHospital(Long ambulanceId) {
        Ambulance ambulance = ambulanceRepository.findById(ambulanceId)
                .orElseThrow(() -> new IllegalArgumentException("해당 구급차를 찾을 수 없습니다."));

        Hospital matchedHospital = ambulance.getHospital();

        if (matchedHospital == null) {
            throw new IllegalStateException("아직 병원이 매칭되지 않았습니다.");
        }

        return matchedHospital;
    }

    public Hospital autoMatch(Long ambulanceId, double ambLat, double ambLng) {
        log.info("[Start Auto-Matching] ambulanceId={}, lat={}, lng={}", ambulanceId, ambLat, ambLng);

        Ambulance ambulance = ambulanceRepository.findById(ambulanceId)
                .orElseThrow(() -> new IllegalArgumentException("Ambulance not found"));
        log.info("[Ambulance Loaded] KTAS={}, AgeRange={}, Department={}",
                ambulance.getPKtas(), ambulance.getPAgeRange(), ambulance.getPDepartment());

        // 1) 조건 구성 + 후보 병원 조회
        MatchingCondition condition = MatchingCondition.builder()
                .ageRange(ambulance.getPAgeRange().name())
                .departmentCode(mapToCode(ambulance.getPDepartment()))
                .isTrauma(ambulance.getPDepartment() != null && ambulance.getPDepartment().contains("외科"))
                .build();

        List<HospitalData> hospitalDataList = hospitalRepository.searchHospitalsDynamic(condition);
        if (hospitalDataList.isEmpty()) throw new IllegalStateException("조건에 맞는 병원이 없습니다.");

        // 2) 거리 상위 25
        List<ScoredHospitalData> nearestHospitals = hospitalDataList.stream()
                .map(h -> new ScoredHospitalData(
                        h, calculateDistance(ambLat, ambLng, h.getHospital().getLatitude(), h.getHospital().getLongitude())))
                .sorted(Comparator.comparingDouble(ScoredHospitalData::distance))
                .limit(25)
                .toList();

        // 3) 최근 이송 빈도 조회 (최근 1일)
        List<String> topHospitalNames = nearestHospitals.stream().map(h -> h.data().getHospital().getName()).toList();
        LocalDateTime ago = LocalDateTime.now().minusDays(1);
        Map<String, Long> recentTransferCountMap = reportRepository.countRecentTransfersByHospitalName(ago, topHospitalNames)
                .stream().collect(Collectors.toMap(r -> (String) r[0], r -> (Long) r[1]));

        // 4) 점수 계산 후 최종 선택
        HospitalScore selected = nearestHospitals.stream()
                .map(h -> new HospitalScore(h, calculateScore(h.data(), h.distance(), ambulance, recentTransferCountMap)))
                .max(Comparator.comparingDouble(HospitalScore::score))
                .orElseThrow(() -> new IllegalStateException("No suitable hospital"));

        HospitalData selectedData = selected.hospitalData().data();
        Hospital hospital = selectedData.getHospital();

        // 5) 병상 감소: 행 잠금 + 엔티티 메서드로 원자적 감소
        BedType bedType = resolveBedType(selectedData, ambulance);

        // 동일 병원에 대한 동시 갱신 충돌 방지를 위해 FOR UPDATE 잠금
        EmergencyBed bed = em.find(EmergencyBed.class, hospital.getId(), LockModeType.PESSIMISTIC_WRITE);
        if (bed == null) throw new IllegalStateException("응급병상 정보가 없습니다. hospitalId=" + hospital.getId());

        int before = getAvailable(bed, bedType);
        if (before <= 0) {
            throw new IllegalStateException("가용 병상이 부족합니다. hospitalId=%d, type=%s"
                    .formatted(hospital.getId(), bedType));
        }
        bed.decreaseAvailable(bedType);

        log.info("[Beds Decremented] hospitalId={}, type={}, before={}, after={}",
                hospital.getId(), bedType, before, getAvailable(bed, bedType));

        // 6) 병원 매칭 저장
        ambulance.setMatchedHospital(hospital, hospital.getName(), hospital.getAddress());

        log.info("🎯 [Matching Completed] Selected Hospital: {}", hospital.getId());
        return hospital;
    }

    private String mapToCode(String department) {
        if (department == null) return null;
        return switch (department.toLowerCase()) {
            case "내과" -> "im";
            case "외과" -> "gs";
            case "신경과" -> "nr";
            case "정형외과" -> "os";
            case "흉부외과" -> "ts";
            case "성형외과" -> "ps";
            case "산부인과" -> "ob";
            case "소아청소년과" -> "pd";
            case "안과" -> "op";
            case "이비인후과" -> "ent";
            case "피부과" -> "dr";
            case "비뇨의학과" -> "ur";
            case "정신건강의학과" -> "psy";
            case "치과" -> "dt";
            case "신경외과" -> "ns";
            default -> null;
        };
    }

    private double calculateScore(HospitalData h, double distance, Ambulance amb, Map<String, Long> transferCountMap) {
        double normDistance = distance / 10.0;
        long transferCount = transferCountMap.getOrDefault(h.getHospital().getName(), 0L);
        double[] bedCounts = calcBedCounts(h, amb);
        double pressureScore = Math.min((bedCounts[0] + 0.5 * transferCount) / bedCounts[1], 1.0);
        double alpha = Math.min((6 - amb.getPKtas()) / 5.0, 0.9);
        double beta = 1.0 - alpha;
        return -(alpha * normDistance + beta * pressureScore);
    }

    private BedType resolveBedType(HospitalData h, Ambulance amb) {
        boolean isTrauma = amb.getPDepartment() != null && amb.getPDepartment().contains("외과");
        int availNeonatal = safeInt(h.getBed().getNeonatal().getAvailable());
        int availPediatric = safeInt(h.getBed().getPediatric().getAvailable());
        int availGeneral   = safeInt(h.getBed().getGeneral().getAvailable());
        int availTrauma    = safeInt(h.getBed().getTrauma().getAvailable());

        if (isTrauma && h.getBed().getTrauma().getIsExist() && h.getBed().getTrauma().getIsAvailable() && availTrauma > 0) {
            return BedType.TRAUMA;
        }
        switch (amb.getPAgeRange()) {
            case NEWBORN -> {
                if (h.getBed().getNeonatal().getIsExist() && h.getBed().getNeonatal().getIsAvailable() && availNeonatal > 0)
                    return BedType.NEONATAL;
            }
            case INFANT, KIDS, TEENAGER -> {
                if (h.getBed().getPediatric().getIsExist() && h.getBed().getPediatric().getIsAvailable() && availPediatric > 0)
                    return BedType.PEDIATRIC;
            }
            case ADULT, ELDERLY, UNDECIDED -> {
                if (h.getBed().getGeneral().getIsExist() && h.getBed().getGeneral().getIsAvailable() && availGeneral > 0)
                    return BedType.GENERAL;
            }
        }
        if (availGeneral   > 0) return BedType.GENERAL;
        if (availPediatric > 0) return BedType.PEDIATRIC;
        if (availNeonatal  > 0) return BedType.NEONATAL;
        if (availTrauma    > 0) return BedType.TRAUMA;

        throw new IllegalStateException("가용 병상이 없습니다. hospitalId=%d".formatted(h.getHospital().getId()));
    }

    private double[] calcBedCounts(HospitalData h, Ambulance amb) {
        int total = 0, available = 0;
        switch (amb.getPAgeRange()) {
            case NEWBORN -> {
                if (h.getBed().getNeonatal().getIsExist() && h.getBed().getNeonatal().getIsAvailable()) {
                    total += safeInt(h.getBed().getNeonatal().getTotal());
                    available += safeInt(h.getBed().getNeonatal().getAvailable());
                }
            }
            case INFANT, KIDS, TEENAGER -> {
                if (h.getBed().getPediatric().getIsExist() && h.getBed().getPediatric().getIsAvailable()) {
                    total += safeInt(h.getBed().getPediatric().getTotal());
                    available += safeInt(h.getBed().getPediatric().getAvailable());
                }
            }
            case ADULT, ELDERLY, UNDECIDED -> {
                if (h.getBed().getGeneral().getIsExist() && h.getBed().getGeneral().getIsAvailable()) {
                    total += safeInt(h.getBed().getGeneral().getTotal());
                    available += safeInt(h.getBed().getGeneral().getAvailable());
                }
            }
        }
        if (amb.getPDepartment() != null && amb.getPDepartment().contains("외과")) {
            if (h.getBed().getTrauma().getIsExist() && h.getBed().getTrauma().getIsAvailable()) {
                total += safeInt(h.getBed().getTrauma().getTotal());
                available += safeInt(h.getBed().getTrauma().getAvailable());
            }
        }
        return new double[]{total - available, total};
    }

    private int getAvailable(EmergencyBed bed, BedType type) {
        return switch (type) {
            case GENERAL   -> safeInt(bed.getGeneral().getAvailable());
            case PEDIATRIC -> safeInt(bed.getPediatric().getAvailable());
            case TRAUMA    -> safeInt(bed.getTrauma().getAvailable());
            case NEONATAL  -> safeInt(bed.getNeonatal().getAvailable());
        };
    }

    private int safeInt(Integer v) { return v == null ? 0 : v; }
}
