package team1234.aiders.config;

import static org.springframework.http.HttpHeaders.AUTHORIZATION;
import static org.springframework.security.config.Elements.JWT;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;

@Configuration
public class SwaggerConfig {

    @Bean
    OpenAPI openAPI() {
        SecurityScheme securityScheme = new SecurityScheme()
                .name(JWT)
                .type(SecurityScheme.Type.HTTP)
                .in(SecurityScheme.In.HEADER)
                .scheme("Bearer")
                .bearerFormat(JWT)
                .name(AUTHORIZATION)
                // TODO 이메일에서 JWT 토큰으로 수정하기
                .description("인증 토큰을 입력해주세요 (Bearer 제외), 지금은 USER DB id");

        return new OpenAPI()
                .addSecurityItem(new SecurityRequirement().addList(JWT))
                .components(new Components().addSecuritySchemes(JWT, securityScheme));
    }

}
