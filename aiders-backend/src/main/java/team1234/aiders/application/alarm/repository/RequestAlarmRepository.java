package team1234.aiders.application.alarm.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import team1234.aiders.application.alarm.entity.RequestAlarm;
import team1234.aiders.application.ambulance.entity.Ambulance;
import team1234.aiders.application.hospital.entity.Hospital;

import java.util.List;

public interface RequestAlarmRepository extends JpaRepository<RequestAlarm, Long> {
    void deleteByAmbulanceAndHospital(Ambulance ambulance, Hospital hospital);

    void deleteByHospitalId(Long hospitalId);

    List<RequestAlarm> findByHospitalId(Long hospitalId);

    boolean existsByHospitalId(Long hospitalId);
}
