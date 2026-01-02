package com.example.hotcinemas_be;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class HotcinemasBeApplication {

	public static void main(String[] args) {
		SpringApplication.run(HotcinemasBeApplication.class, args);
	}

}
