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
import team1234.aiders.common.util.DistanceUtils;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class MatchingService {

    private final AmbulanceRepository ambulanceRepository;
    private final HospitalRepository hospitalRepository;
    private final DistanceUtils distanceUtils;

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
                        distanceUtils.calculateDistance(ambLat, ambLng, h.getHospital().getLatitude(), h.getHospital().getLongitude())))
                .sorted(Comparator.comparingDouble(ScoredHospitalData::distance)) // 거리 기준 정렬
                .limit(10)
                .toList();

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
