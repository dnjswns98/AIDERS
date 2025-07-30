package team1234.aiders.application.user.entity;

import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.ReflectionUtils;
import team1234.aiders.application.ambulance.entity.AmbCurrentStatus;
import team1234.aiders.application.ambulance.entity.Ambulance;
import team1234.aiders.application.ambulance.entity.PatientAgeRange;
import team1234.aiders.application.firestation.entity.Firestation;
import team1234.aiders.application.hospital.entity.Hospital;

import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@TestPropertySource(locations = "classpath:application-test.properties")
@Transactional
class UserTest {

    @Autowired EntityManager em;

    private final GeometryFactory geometryFactory = new GeometryFactory();

    private void setField(Object target, String fieldName, Object value) {
        Class<?> clazz = target.getClass();
        Field field = null;
        while (clazz != null) {
            field = ReflectionUtils.findField(clazz, fieldName);
            if (field != null) break;
            clazz = clazz.getSuperclass();
        }
        if (field == null) {
            throw new IllegalArgumentException("Field '" + fieldName + "' not found in class hierarchy.");
        }
        field.setAccessible(true);
        ReflectionUtils.setField(field, target, value);
    }


    @Test
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

    @Test
    void 삭제_플래그_테스트() {
        Hospital hospital = new Hospital();
        setField(hospital, "userKey", "delete-key");
        setField(hospital, "password", "pw");
        setField(hospital, "passwordResetKey", "reset-key");
        setField(hospital, "latitude", 35.0);
        setField(hospital, "longitude", 128.0);
        setField(hospital, "address", "부산");
        setField(hospital, "name", "삭제병원");
        setField(hospital, "location", new GeometryFactory().createPoint(new Coordinate(128.0, 35.0)));
        em.persist(hospital);

        em.flush();
        em.clear();

        Hospital found = em.find(Hospital.class, hospital.getId());
        setField(found, "isDeleted", true);
        em.flush();
        em.clear();

        Hospital deleted = em.find(Hospital.class, hospital.getId());
        assertThat(deleted.getIsDeleted()).isTrue();
    }

    @Test
    void 병원_위치_기반_조회_테스트() {
        // given
        Hospital h1 = new Hospital();
        Hospital h2 = new Hospital();

        setField(h1, "userKey", "hospital-key-1");
        setField(h1, "password", "pw1234");
        setField(h1, "passwordResetKey", "reset-key-1");
        setField(h1, "name", "병원A");
        setField(h1, "latitude", 37.5665);
        setField(h1, "longitude", 126.9780);
        setField(h1, "address", "서울특별시");
        setField(h1, "location", createPoint(126.9780, 37.5665));

        setField(h2, "userKey", "hospital-key-2");
        setField(h2, "password", "pw5678");
        setField(h2, "passwordResetKey", "reset-key-2");
        setField(h2, "name", "병원B");
        setField(h2, "latitude", 35.1796);
        setField(h2, "longitude", 129.0756);
        setField(h2, "address", "부산광역시");
        setField(h2, "location", createPoint(129.0756, 35.1796));

        em.persist(h1);
        em.persist(h2);
        em.flush();
        em.clear();

        // when
        String point = "POINT(37.5665 126.9780)"; // 경도 위도 순서
        int radius = 5000; // 미터

        List<Hospital> result = em.createNativeQuery("""
        SELECT u.*, h.*
        FROM user u
        JOIN hospital h ON u.user_id = h.hospital_id
        WHERE ST_Distance_Sphere(h.location, ST_GeomFromText(:point, 4326)) <= :radius
    """, Hospital.class)
                .setParameter("point", point)
                .setParameter("radius", radius)
                .getResultList();

        // then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("병원A");
    }

    private Point createPoint(double longitude, double latitude) {
        Point point = geometryFactory.createPoint(new Coordinate(longitude, latitude));
        point.setSRID(4326); // 꼭 설정해줘야 함!
        return point;
    }
}