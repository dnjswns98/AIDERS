package team1234.aiders.application.hospital.repository;

import team1234.aiders.application.hospital.dto.HospitalData;
import team1234.aiders.application.match.dto.MatchingCondition;

import java.util.List;

public interface HospitalQueryRepository {
    List<HospitalData> searchHospitalsDynamic(MatchingCondition condition);
}

