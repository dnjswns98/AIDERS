package team1234.aiders.application.alarm.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import team1234.aiders.application.alarm.entity.RequestAlarm;
import team1234.aiders.application.ambulance.entity.Ambulance;
import team1234.aiders.application.hospital.entity.Hospital;

public interface RequestAlarmRepository extends JpaRepository<RequestAlarm, Long> {
    void deleteByAmbulanceAndHospital(Ambulance ambulance, Hospital hospital);
}
