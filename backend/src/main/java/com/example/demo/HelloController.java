package com.example.demo;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "http://localhost:5173") // Quan trọng: Cho phép React (cổng 5173) gọi vào
public class HelloController {

    @GetMapping("/hello")
    public String sayHello() {
        return "Xin chào UBND! Hệ thống Backend đã chạy ngon lành!";
    }
}
