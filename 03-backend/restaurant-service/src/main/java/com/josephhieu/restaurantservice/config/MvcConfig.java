package com.josephhieu.restaurantservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class MvcConfig implements WebMvcConfigurer {

    // Lấy giá trị từ application.yml
    @Value("${storage.upload-dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Ánh xạ URL nội bộ của service (/images/**) tới đường dẫn vật lý
        // Mọi ảnh upload sẽ được phục vụ từ thư mục C:/foodfast-uploads
        registry.addResourceHandler("/images/**")
                .addResourceLocations("file:///" + uploadDir + "/");
    }
}