package team1234.aiders.application.match.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team1234.aiders.application.ambulance.entity.Ambulance;
import team1234.aiders.application.ambulance.repository.AmbulanceRepository;
import team1234.aiders.application.hospital.dto.HospitalData;
import team1234.aiders.application.hospital.entity.Hospital;
import team1234.aiders.application.hospital.repository.HospitalRepository;
import team1234.aiders.application.match.dto.MatchingCondition;
import static team1234.aiders.common.util.DistanceUtils.calculateDistance;

import team1234.aiders.application.report.repository.ReportRepository;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class MatchingService {

    private final AmbulanceRepository ambulanceRepository;
    private final HospitalRepository hospitalRepository;
    private final ReportRepository reportRepository;

    record ScoredHospitalData(HospitalData data, double distance) {}

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

        Ambulance ambulance = ambulanceRepository.findById(ambulanceId)
                .orElseThrow(() -> new IllegalArgumentException("Ambulance not found"));

        // 환자 정보 기반 MatchingCondition 생성
        MatchingCondition condition = MatchingCondition.builder()
                .ageRange(ambulance.getPAgeRange().name())  // NEWBORN, ADULT
                .departmentCode(mapToCode(ambulance.getPDepartment()))
                .isTrauma(ambulance.getPDepartment().contains("외과"))
                .build();

        // 병원 목록 필터링 (동적 쿼리)
        List<HospitalData> hospitalDataList = hospitalRepository.searchHospitalsDynamic(condition);

        if (hospitalDataList.isEmpty()) {
            throw new IllegalStateException("조건에 맞는 병원이 없습니다.");
        }

        // 거리 기준 상위 10개 병원만 필터링
        List<ScoredHospitalData> nearestHospitals = hospitalDataList.stream()
                .map(h -> new ScoredHospitalData(
                        h,
                        calculateDistance(ambLat, ambLng, h.getHospital().getLatitude(), h.getHospital().getLongitude())))
                .sorted(Comparator.comparingDouble(ScoredHospitalData::distance)) // 거리 기준 정렬
                .limit(10)
                .toList();

        // 병원 이름 리스트
        List<String> topHospitalNames = nearestHospitals.stream()
                .map(h -> h.data().getHospital().getName())
                .toList();

        // 최근 이송 횟수 조회 (최근 1일 기준)
        LocalDateTime ago = LocalDateTime.now().minusDays(1);
        List<Object[]> result = reportRepository.countRecentTransfersByHospitalName(ago, topHospitalNames);

        // 병원이름 -> 이송 횟수 맵핑
        Map<String, Long> recentTransferCountMap = result.stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> (Long) row[1]
                ));

        // 점수 계산 및 병원 선택
        ScoredHospitalData selected = nearestHospitals.stream()
                .max(Comparator.comparingDouble(h ->
                        calculateScore(h.data(), h.distance(), ambulance, recentTransferCountMap)))
                .orElseThrow(() -> new IllegalStateException("No suitable hospital"));

        // 구급차에 병원 정보 저장
        Hospital hospital = selected.data().getHospital();
        ambulance.setHospital(hospital);
        ambulance.setHospitalName(hospital.getName());
        ambulance.setHospitalAddress(hospital.getAddress());

        return hospital;
    }

    // 진료과 문자열을 코드로 변환
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

    // 점수 계산 함수
    private double calculateScore(HospitalData h, double distance, Ambulance amb, Map<String, Long> transferCountMap) {
        double urgencyFactor = 6 - amb.getPKtas();
        long transferCount = transferCountMap.getOrDefault(h.getHospital().getName(), 0L);
        double recentPenalty = transferCount * 1.5;

        double bonus = calcDepartmentBonus(h, amb);
        double congestionScore = calcRelevantCongestion(h, amb);

        return 20 * (urgencyFactor/(distance + 1)) + bonus - congestionScore - recentPenalty;
    }

    // 보너스 점수 계산
    private double calcDepartmentBonus(HospitalData h, Ambulance amb) {
        String dept = amb.getPDepartment();
        if (dept == null) return 0;

        String mappedDept = mapToCode(dept);

        return switch (mappedDept) {
            case "gs" -> h.getDepartment().getGsIsAvailable() ? 5 : 0;
            case "ts" -> h.getDepartment().getTsIsAvailable() ? 5 : 0;
            case "os" -> h.getDepartment().getOsIsAvailable() ? 5 : 0;
            case "pd" -> h.getDepartment().getPdIsAvailable() ? 5 : 0;
            case "im" -> h.getDepartment().getImIsAvailable() ? 5 : 0;
            case "nr" -> h.getDepartment().getNrIsAvailable() ? 5 : 0;
            case "ob" -> h.getDepartment().getObIsAvailable() ? 5 : 0;
            case "op" -> h.getDepartment().getOpIsAvailable() ? 5 : 0;
            case "ent" -> h.getDepartment().getEntIsAvailable() ? 5 : 0;
            case "dr" -> h.getDepartment().getDrIsAvailable() ? 5 : 0;
            case "ur" -> h.getDepartment().getUrIsAvailable() ? 5 : 0;
            case "psy" -> h.getDepartment().getPsyIsAvailable() ? 5 : 0;
            case "dt" -> h.getDepartment().getDtIsAvailable() ? 5 : 0;
            case "ns" -> h.getDepartment().getNsIsAvailable() ? 5 : 0;
            default -> 0;
        };
    }

    // 혼잡도 계산 (가용 병상 수/전체 병상 수)
    private double calcRelevantCongestion(HospitalData h, Ambulance amb) {
        int total = 0;
        int available = 0;

        switch (amb.getPAgeRange()) {
            case NEWBORN -> {
                if(h.getBed().getNeonatalIsExist() && h.getBed().getNeonatalIsAvailable()) {
                    total += h.getBed().getNeonatalTotalBed();
                    available += h.getBed().getNeonatalAvailableBed();
                }
            }
            case INFANT, KIDS, TEENAGER -> {
                if (h.getBed().getPediatricIsExist() && h.getBed().getPediatricIsAvailable()) {
                    total += h.getBed().getPediatricTotalBed();
                    available += h.getBed().getPediatricAvailableBed();
                }
            }
            case ADULT, ELDERLY, UNDECIDED -> {
                if (h.getBed().getGeneralIsExist() && h.getBed().getGeneralIsAvailable()) {
                    total += h.getBed().getGeneralTotalBed();
                    available += h.getBed().getGeneralAvailableBed();
                }
            }
        }

        // 외상 환자라면 trauma 병상도 고려
        if (amb.getPDepartment() != null && amb.getPDepartment().contains("외과")) {
            if (h.getBed().getTraumaIsExist() && h.getBed().getTraumaIsAvailable()) {
                total += h.getBed().getTraumaTotalBed();
                available += h.getBed().getTraumaAvailableBed();
            }
        }

        if (total == 0) return 0;
        return (1 - ((double) available / total)) * 10; // 혼잡도 점수
    }
}
