package team1234.aiders.application.alarm.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import team1234.aiders.application.alarm.dto.AlarmMessage;
import team1234.aiders.application.alarm.entity.EditAlarm;
import team1234.aiders.application.ambulance.entity.Ambulance;
import team1234.aiders.application.hospital.entity.Hospital;

import java.util.List;
import java.util.Optional;

public interface EditAlarmRepository extends JpaRepository<EditAlarm, Long> {
    void deleteByAmbulanceAndHospital(Ambulance ambulance, Hospital hospital);

    List<EditAlarm> findByHospitalId(Long hospitalId);
}
