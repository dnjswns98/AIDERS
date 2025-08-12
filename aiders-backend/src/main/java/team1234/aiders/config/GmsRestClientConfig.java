// src/main/java/team1234/aiders/config/GmsRestClientConfig.java
package team1234.aiders.config;

import org.springframework.boot.web.client.RestClientCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.net.InetSocketAddress;

@Configuration
public class GmsRestClientConfig {

    @Bean
    RestClientCustomizer gmsRestClientCustomizer() {
        return builder -> builder
                .requestInterceptor((request, body, execution) -> {
                    // 게이트웨이에 타깃 도메인을 알려줌 (도메인-in-path일 때 종종 필요)
                    request.getHeaders().set("X-Target-Domain", "api.openai.com");
                    request.getHeaders().set("X-Forwarded-Host", "api.openai.com");

                    return execution.execute(request, body);
                });
    }
}
