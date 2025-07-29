package team1234.aiders.config.swagger;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("AIDERS API 문서")
                        .description("응급 이송 시스템 AIDERS의 REST API 명세서입니다.")
                        .version("v1.0.0")
                        .contact(new Contact()
                                .name("채일 김")
                                .email("chaeil@example.com")
                                .url("https://github.com/team1234/aiders")));
    }
}