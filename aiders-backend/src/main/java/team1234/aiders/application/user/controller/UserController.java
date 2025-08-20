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
import team1234.aiders.application.user.dto.password.PasswordChangeRequestDto;
import team1234.aiders.application.user.dto.password.PasswordResetAuthRequestDto;
import team1234.aiders.application.user.dto.password.PasswordResetTokenResponseDto;
import team1234.aiders.application.user.service.UserService;
import team1234.aiders.common.jwt.JwtProvider;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/user")
public class UserController {

    private final UserService userService;
    private final JwtProvider jwtProvider;

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
        UserRegistResponseDto response = userService.registAmbulance(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/regist/organization")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserRegistResponseDto> registOrganization(@RequestBody OrganizationRegisterRequestDto request) {
        UserRegistResponseDto response = userService.registOrganization(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/password/auth")
    public ResponseEntity<PasswordResetTokenResponseDto> authenticateForPasswordReset(@RequestBody PasswordResetAuthRequestDto request) {
        userService.authenticateForPasswordReset(request);

        String resetToken = jwtProvider.generatePasswordResetToken(request.getUserKey());
        return ResponseEntity.ok(new PasswordResetTokenResponseDto(resetToken));
    }

    @PostMapping("/password/change")
    public ResponseEntity<Void> changePassword(@RequestBody PasswordChangeRequestDto request) {
        String userKey = jwtProvider.getUserKeyFromPasswordResetToken(request.getResetToken());

        userService.changePassword(userKey, request.getNewPassword());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable("userId") Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }
}
