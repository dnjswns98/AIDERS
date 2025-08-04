package team1234.aiders.application.firestation.entity;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import team1234.aiders.application.user.entity.User;

@Entity
@DiscriminatorValue("firestation")
@PrimaryKeyJoinColumn(name = "firestation_id")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Firestation extends User {

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(nullable = false)
    private String address;

    @Column(unique = true, nullable = false)
    private String name;

    @Builder
    public Firestation(String userKey, String password, String passwordResetKey, String role,
                       String address, String name, Double latitude, Double longitude) {
        super(userKey, password, passwordResetKey, role);
        this.address = address;
        this.name = name;
        this.latitude = latitude;
        this.longitude = longitude;
    }
}
