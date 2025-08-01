package team1234.aiders.application.alarm.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import team1234.aiders.application.alarm.dto.AlarmMessage;
import team1234.aiders.application.alarm.entity.EditAlarm;

import java.util.Optional;

public interface EditAlarmRepository extends JpaRepository<EditAlarm, Long> {

}
