package com.example.demoOauth.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RedirectionController {
    @GetMapping("/login-success")
    public String loginSuccess() {
        return "<script>window.location.href = 'http://localhost:5173';</script>";
    }
}
