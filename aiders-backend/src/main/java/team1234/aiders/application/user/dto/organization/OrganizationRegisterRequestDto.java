package team1234.aiders.application.user.dto.organization;

import lombok.Getter;

@Getter
public class OrganizationRegisterRequestDto {

    private String userKey;
    private String role;
    private String address;
    private String name;
    private Double latitude;
    private Double longitude;
}
