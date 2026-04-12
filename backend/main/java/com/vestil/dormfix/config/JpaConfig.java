package com.vestil.dormfix.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration
@EnableJpaRepositories(basePackages = "com.vestil.dormfix.repository")
@EnableJpaAuditing
public class JpaConfig {
    
}
