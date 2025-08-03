package team1234.aiders.application.alarm.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import team1234.aiders.application.alarm.entity.MatchingAlarm;

public interface MatchingAlarmRepository extends JpaRepository<MatchingAlarm, Long> {
    void deleteByAmbulanceKeyAndHospitalId(String ambulanceKey, Long hospitalId);
}
