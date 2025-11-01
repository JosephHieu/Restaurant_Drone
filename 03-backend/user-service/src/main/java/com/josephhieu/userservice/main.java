package com.josephhieu.userservice;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class main {

    public static void main(String[] args) {

        String rawPassword = "123456"; // đổi thành mật khẩu cần mã hóa
        int strength = 10; // log rounds (10 là mặc định hợp lý). Tăng => chậm hơn nhưng an toàn hơn

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(strength);
        String hashed = encoder.encode(rawPassword);

        System.out.println("Raw password: " + rawPassword);
        System.out.println("Bcrypt hashed: " + hashed);

        // Kiểm tra:
        boolean matches = encoder.matches(rawPassword, hashed);
        System.out.println("Matches: " + matches);
    }
}
