package team1234.aiders.application.hospital.entity;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.locationtech.jts.geom.Point;
import team1234.aiders.application.user.entity.User;
import team1234.aiders.common.util.PointUtils;

@Entity
@DiscriminatorValue("hospital")
@PrimaryKeyJoinColumn(name = "hospital_id")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Hospital extends User {

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "POINT")
    private Point location;

    @Builder
    public Hospital(String userKey, String password, String passwordResetKey, String role,
                       String address, String name, Double latitude, Double longitude) {
        super(userKey, password, passwordResetKey, role);
        this.address = address;
        this.name = name;
        this.latitude = latitude;
        this.longitude = longitude;
        this.location = PointUtils.createPoint(latitude, longitude);
    }
}
