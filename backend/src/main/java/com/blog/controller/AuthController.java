package com.blog.controller;

import com.blog.common.Result;
import com.blog.dto.LoginRequest;
import com.blog.dto.RegisterRequest;
import com.blog.entity.User;
import com.blog.service.UserService;
import com.blog.util.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public Result<?> register(@Valid @RequestBody RegisterRequest req) {
        if (userService.findByUsername(req.getUsername()) != null) {
            return Result.fail("用户名已存在");
        }
        User user = userService.register(req.getUsername(), req.getPassword(), req.getEmail());
        return Result.success(user);
    }

    @PostMapping("/login")
    public Result<?> login(@Valid @RequestBody LoginRequest req) {
        if (!userService.authenticate(req.getUsername(), req.getPassword())) {
            return Result.fail("用户名或密码错误");
        }
        String token = jwtUtil.generateToken(req.getUsername());
        User user = userService.findByUsername(req.getUsername());
        user.setPassword(null);
        Map<String, Object> data = new HashMap<>();
        data.put("token", token);
        data.put("user", user);
        return Result.success(data);
    }
}
