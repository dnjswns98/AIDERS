package team1234.aiders;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class AidersApplication {

	public static void main(String[] args) {
		SpringApplication.run(AidersApplication.class, args);
	}

}
