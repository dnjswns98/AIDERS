package team1234.aiders.application.alarm.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import team1234.aiders.application.alarm.entity.RequestAlarm;

public interface RequestAlarmRepository extends JpaRepository<RequestAlarm, Long> {
}
