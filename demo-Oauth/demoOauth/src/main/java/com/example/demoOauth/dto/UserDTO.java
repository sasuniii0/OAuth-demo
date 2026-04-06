package com.example.demoOauth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class UserDTO {
    private Long id;
    private String email;
    private String name;
    private String picture;
    private String provider;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
