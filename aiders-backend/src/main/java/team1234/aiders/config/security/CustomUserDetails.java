package team1234.aiders.config.security;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import team1234.aiders.application.user.entity.User;

import java.util.Collection;
import java.util.Collections;
import java.util.List;

@Getter
@RequiredArgsConstructor
public class CustomUserDetails implements UserDetails {

    private final Long id;
    private final String userKey;
    private final String password;
    private final String role;

    public CustomUserDetails(User user) {
        this.id = user.getId();
        this.userKey = user.getUserKey();
        this.password = user.getPassword();
        this.role = getDiscriminatorRole(user);
    }

    public Long getId() {
        return id;
    }
    private String getDiscriminatorRole(User user) {
        if (user.getClass().getSimpleName().equals("Hospital")) return "hospital";
        if (user.getClass().getSimpleName().equals("Firestation")) return "firestation";
        if (user.getClass().getSimpleName().equals("Ambulance")) return "ambulance";
        return "admin"; // 기본값 또는 실제 Admin 엔티티가 있다면 그에 맞춰 조정
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
