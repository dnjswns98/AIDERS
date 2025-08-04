package team1234.aiders.application.user.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import team1234.aiders.application.user.dto.UserResponseDto;
import team1234.aiders.application.user.dto.ambulance.AmbulanceRegistRequestDto;
import team1234.aiders.application.user.dto.UserRegistResponseDto;
import team1234.aiders.application.user.dto.organization.OrganizationRegisterRequestDto;
import team1234.aiders.application.user.dto.password.PasswordResetAuthRequestDto;
import team1234.aiders.application.user.service.UserService;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/user")
public class UserController {

    private final UserService userService;

    @GetMapping("/")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserResponseDto>> getUsers(
            @PageableDefault(page = 0, size = 15, sort = "id,desc") Pageable pageable,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role) {
        Page<UserResponseDto> result = userService.getUsers(pageable, search, role);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/regist/ambulance")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserRegistResponseDto> registerAmbulance(@RequestBody AmbulanceRegistRequestDto request) {
        userService.registAmbulance(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/regist/organization")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserRegistResponseDto> registOrganization(@RequestBody OrganizationRegisterRequestDto request) {
        userService.registOrganization(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/password/auth")
    public ResponseEntity<Void> authenticateForPasswordReset(@RequestBody PasswordResetAuthRequestDto request) {
        boolean authenticated = userService.authenticateForPasswordReset(request);
        if (!authenticated) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable("userId") Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }
}
