package team1234.aiders.config.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.ForwardedHeaderFilter;

import java.util.List;

@Configuration
@EnableMethodSecurity(securedEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {
    private final SecurityHttpConfigurer securityHttpConfigurer;
    private final CustomAuthenticationFilter customAuthenticationFilter;


    private static final String[] PUBLIC_ENDPOINTS = {
            "/api/v1/auth/**",
            "/api/v1/user/password/**",
//            "/api/v1/video-call/**",  // 모든 video-call API 허용
//            "/api/**",  // 임시로 모든 API 허용
            "/ws/**",              // WebSocket 연결 허용
            "/ws"
    };

    private static final String[] OPEN_API_ENDPOINT = {
            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/swagger-resources/**",
            "/webjars/**",
            "/configuration/**"
    };

    //TODO: ADMIN 전용 API 경로들
    private static final String[] ADMIN_ENDPOINT = {
            "/api/v1/user",
            "/api/v1/regist/**",
            "/api/v1/user/{userId}"
    };

    //TODO: AMBULANCE 전용 API 경로들
    private static final String[] AMBULANCE_ENDPOINT = {
            "/api/v1/video-call/ambulance/**",
            "/api/v1/video-call/session/**",
            "/api/v1/patient/required",
            "/api/v1/patient/optional",
            "/api/v1/ambulance/transfer/**",
            "/api/v1/ambulance/status",
            "/api/v1/ambulance/patient-info",
            "/api/v1/alarm/send",
            "/api/v1/alarm/all/**",
            "/api/v1/match/**",
            "/api/v1/hospital/location/{userId}",
    };

    //TODO: HOSPITAL 전용 API 경로들
    private static final String[] HOSPITAL_ENDPOINT = {
            "/api/v1/video-call/hospital/**",
            "/api/v1/patient",
            "/api/v1/hospital/**",
            "/api/v1/alarm/**",
            "/api/v1/redis/**"
    };

    //TODO: FIRESTATION 전용 API 경로들
    private static final String[] FIRESTATION_ENDPOINT = {
            "/api/v1/dispatch/**",
            "/api/v1/firestation/**",
            "/api/v1/ambulance/list"
    };

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> {
                    auth
                            .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                            .requestMatchers(OPEN_API_ENDPOINT).permitAll()
                            .requestMatchers(ADMIN_ENDPOINT).hasRole("ADMIN")
                            .requestMatchers(AMBULANCE_ENDPOINT).hasRole("AMBULANCE")
                            .requestMatchers(HOSPITAL_ENDPOINT).hasRole("HOSPITAL")
                            .requestMatchers(FIRESTATION_ENDPOINT).hasRole("FIRESTATION")
                            .anyRequest().permitAll(); // 임시로 모든 요청 허용
                });

        http.with(securityHttpConfigurer, configurer -> {
        });

        http.addFilterBefore(customAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }


    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173", "https://localhost:5173", "http://localhost:8080", "https://localhost:8080", "https://i13d107.p.ssafy.io"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization", "SET_COOKIE"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public ForwardedHeaderFilter forwardedHeaderFilter() {
        return new ForwardedHeaderFilter();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
