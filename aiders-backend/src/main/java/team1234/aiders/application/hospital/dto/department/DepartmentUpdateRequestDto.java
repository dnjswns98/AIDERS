package team1234.aiders.application.hospital.dto.department;

import lombok.Getter;

import java.util.Optional;

@Getter
public class DepartmentUpdateRequestDto {

    private String departmentCode;
    private Optional<Boolean> isExist = Optional.empty();
    private Optional<Boolean> isAvailable = Optional.empty();
}
