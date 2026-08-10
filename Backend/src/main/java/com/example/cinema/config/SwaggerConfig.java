package com.example.cinema.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("HotCinema API")
                        .description("API Documentation for HotCinema Booking System")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Development Team")
                                .email("contact@hotcinema.com")
                                .url("https://hotcinema.com"))
                        .license(new License().name("Apache 2.0").url("http://springdoc.org")));
    }
}
