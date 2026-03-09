package com.vestil.dormfix.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@Configuration
@EnableConfigurationProperties
public class ApplicationConfig {
    
    @Bean
    public AppProperties appProperties() {
        return new AppProperties();
    }
    
    @org.springframework.boot.context.properties.ConfigurationProperties(prefix = "app")
    public static class AppProperties {
        private String name = "DormFix";
        private String version = "1.0.0";
        private String description = "DormFix Maintenance Request System";
        
        public String getName() {
            return name;
        }
        
        public void setName(String name) {
            this.name = name;
        }
        
        public String getVersion() {
            return version;
        }
        
        public void setVersion(String version) {
            this.version = version;
        }
        
        public String getDescription() {
            return description;
        }
        
        public void setDescription(String description) {
            this.description = description;
        }
    }
}
