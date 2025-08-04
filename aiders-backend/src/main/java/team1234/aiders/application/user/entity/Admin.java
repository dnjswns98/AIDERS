package team1234.aiders.application.user.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;

@Entity
@DiscriminatorValue("admin")
@PrimaryKeyJoinColumn(name = "admin_id")
public class Admin extends User {
}
