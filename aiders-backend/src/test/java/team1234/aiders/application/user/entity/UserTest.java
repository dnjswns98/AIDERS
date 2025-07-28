package team1234.aiders.application.user.entity;

import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.ReflectionUtils;

import java.lang.reflect.Field;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestPropertySource(locations = "classpath:application-test.properties")
@Transactional()
class UserTest {

    @Autowired EntityManager em;

    private void setField(Object target, String fieldName, Object value) {
        Field field = ReflectionUtils.findField(target.getClass(), fieldName);
        field.setAccessible(true);
        ReflectionUtils.setField(field, target, value);
    }

    @Test
    @Rollback(false)
    void 병원_소방서_엠뷸런스_통합저장_테스트() {
        // ✅ Hospital 저장
        Hospital hospital = new Hospital();
        setField(hospital, "userKey", "hospital-key");
        setField(hospital, "password", "pw1");
        setField(hospital, "passwordResetKey", "reset1");
        setField(hospital, "latitude", 37.5665);
        setField(hospital, "longitude", 126.9780);
        setField(hospital, "address", "서울특별시 종로구");
        setField(hospital, "name", "서울병원");

        Point location = new GeometryFactory().createPoint(new Coordinate(126.9780, 37.5665)); // (X=경도, Y=위도)
        setField(hospital, "location", location);

        em.persist(hospital);

        // ✅ Firestation 저장
        Firestation firestation = new Firestation();
        setField(firestation, "userKey", "fire-key");
        setField(firestation, "password", "pw2");
        setField(firestation, "passwordResetKey", "reset2");
        setField(firestation, "latitude", 37.123);
        setField(firestation, "longitude", 127.123);
        setField(firestation, "address", "경기도 수원시");
        setField(firestation, "name", "수원소방서");

        em.persist(firestation);

        // ✅ Ambulance 저장
        Ambulance ambulance = new Ambulance();
        setField(ambulance, "userKey", "amb-key");
        setField(ambulance, "password", "pw3");
        setField(ambulance, "passwordResetKey", "reset3");
        setField(ambulance, "firestation", firestation);
        setField(ambulance, "currentStatus", AmbCurrentStatus.TRANSFER);
        setField(ambulance, "pLatitude", 37.111);
        setField(ambulance, "pLongitude", 127.111);
        setField(ambulance, "pAddress", "환자주소");
        setField(ambulance, "pCondition", "의식불명");
        setField(ambulance, "pKtas", 1);
        setField(ambulance, "pDepartment", "신경외과");
        setField(ambulance, "pSex", 1);
        setField(ambulance, "pAgeRange", PatientAgeRange.ADULT);
        setField(ambulance, "pMedicalRecord", "기록");
        setField(ambulance, "pFamilyHistory", "가족력");
        setField(ambulance, "pPastHistory", "과거력");
        setField(ambulance, "pMedicine", "복용약");
        setField(ambulance, "pName", "홍길동");
        setField(ambulance, "pRrn", "990101-1234567");
        setField(ambulance, "pNationality", "대한민국");
        setField(ambulance, "pVitalSigns", "정상");

        setField(ambulance, "dispatchTime", LocalDateTime.now().minusMinutes(10));
        setField(ambulance, "transferStartTime", LocalDateTime.now().minusMinutes(5));
        setField(ambulance, "transferEndTime", LocalDateTime.now());

        setField(ambulance, "hospital", hospital);

        em.persist(ambulance);

        em.flush();
        em.clear();

        // ✅ 조회 및 검증
        Ambulance foundAmb = em.find(Ambulance.class, ambulance.getId());
        assertThat(foundAmb).isNotNull();
        assertThat(foundAmb.getFirestation().getName()).isEqualTo("수원소방서");
        assertThat(foundAmb.getHospital().getName()).isEqualTo("서울병원");
        assertThat(foundAmb.getPName()).isEqualTo("홍길동");

        Hospital foundHospital = em.find(Hospital.class, hospital.getId());
        assertThat(foundHospital.getLocation().getX()).isEqualTo(126.9780);
        assertThat(foundHospital.getLocation().getY()).isEqualTo(37.5665);
    }
}