package com.papeleria;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = "com.papeleria")
public class PapeleriaApplication {
    public static void main(String[] args) {
        SpringApplication.run(PapeleriaApplication.class, args);
    }
}