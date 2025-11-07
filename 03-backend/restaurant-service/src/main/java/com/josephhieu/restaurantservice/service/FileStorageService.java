package com.josephhieu.restaurantservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;

    // SỬA CONSTRUCTOR ĐỂ NHẬN GIÁ TRỊ TỪ CẤU HÌNH
    public FileStorageService(@Value("${storage.upload-dir}") String uploadDir) {
        // Sử dụng đường dẫn từ cấu hình
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();

        try {
            // Khởi tạo thư mục
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the upload directory: " + uploadDir, ex);
        }
    }

    /**
     * Lưu file vật lý vào thư mục đã cấu hình
     * @param file File ảnh được gửi lên
     * @return Tên file gốc (đã được chuẩn hóa)
     */
    public String storeFile(MultipartFile file) {
        String originalFilename = file.getOriginalFilename();

        if (originalFilename == null || originalFilename.isEmpty()) {
            throw new RuntimeException("Tên file không hợp lệ.");
        }

        // Tạo tên file chuẩn hóa: Chuyển về chữ thường để tránh lỗi Case-Sensitivity
        String fileName = originalFilename.toLowerCase();

        try {
            // KIỂM TRA: Nếu file đã tồn tại, xóa file cũ để tránh lỗi.
            Path targetLocation = this.fileStorageLocation.resolve(fileName);

            // Copy file vào vị trí đích (C:\foodfast-uploads)
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return fileName; // Trả về tên file gốc đã được chuẩn hóa
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + originalFilename + ". Please try again! Lỗi: " + ex.getMessage(), ex);
        }
    }
}