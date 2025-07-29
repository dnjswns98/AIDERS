package team1234.aiders.config.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SecurityHttpConfigurer extends AbstractHttpConfigurer<SecurityHttpConfigurer, HttpSecurity> {

    private final CustomAuthenticationFilter customAuthenticationFilter;

    @Override
    public void configure(HttpSecurity http){
        http.addFilterBefore(customAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
    }
}