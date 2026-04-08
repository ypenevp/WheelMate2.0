package com.legendss.backend.configs;

import com.legendss.backend.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        //auth
                        .requestMatchers("/api/v2/auth/register", "/api/v2/auth/verify", "/api/v2/auth/login").permitAll()
                        .requestMatchers("/api/v2/auth/get", "/api/v2/auth/getall").authenticated()

                        //wheelhairs
                        .requestMatchers("/api/v2/wheelchair/add").hasRole("USER")
                        .requestMatchers("/api/v2/wheelchair/update").hasRole("USER")
                        .requestMatchers("/api/v2/wheelchair/delete").hasRole("USER")
                        .requestMatchers("/api/v2/wheelchair/my").hasRole("USER")

                        //users functionalities
                        .requestMatchers("/api/v2/wheelchair/add-relative").hasRole("USER")
                        .requestMatchers("/api/v2/wheelchair/relative/my-tracked").hasRole("RELATIVE")
                        .requestMatchers("/api/v2/wheelchair/getallrel").hasRole("USER")
                        
                        //panic & fakepanic logs
                        .requestMatchers("/api/v2/panic/relative/my-tracked").hasRole("RELATIVE")
                        .requestMatchers("/api/v2/fakepanic/relative/my-tracked").hasRole("RELATIVE")
//                      .requestMatchers("/api/v2/fakepanic/**").permitAll()

                        .requestMatchers("/api/v2/wheelchair/update/{id}").permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}