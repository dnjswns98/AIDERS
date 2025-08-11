package team1234.aiders.config.security;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import team1234.aiders.application.user.entity.User;
import team1234.aiders.application.user.repository.UserRepository;
import team1234.aiders.application.user.repository.UserRepository.LoginProjection;

import java.util.Collection;
import java.util.Collections;
import java.util.List;

@Getter
public class CustomUserDetails implements UserDetails {

    private final Long id;
    private final String userKey;
    private final String password;
    private final String role;

    public CustomUserDetails(Long id, String userKey, String password, String role) {
        this.id = id;
        this.userKey = userKey;
        this.password = password;
        this.role = role;
    }

    public static CustomUserDetails fromLoginProjection(LoginProjection p) {
        return new CustomUserDetails(p.getId(), p.getUserKey(), p.getPassword(), p.getRole());
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // ROLE 접두사 붙이기 (Spring Security 표준)
        return Collections.singleton(() -> "ROLE_" + role.toUpperCase());
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return userKey;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

}
