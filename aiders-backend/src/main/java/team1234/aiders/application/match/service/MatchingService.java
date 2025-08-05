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

        return null;
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
            default -> null;
        };
    }
}
