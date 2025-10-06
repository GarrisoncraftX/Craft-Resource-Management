package com.craftresourcemanagement.hr.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private static final Logger logger = LoggerFactory.getLogger(CloudinaryService.class);

    private final Cloudinary cloudinary;

    public CloudinaryService(@Value("${cloudinary.cloud-name}") String cloudName,
                             @Value("${cloudinary.api-key}") String apiKey,
                             @Value("${cloudinary.api-secret}") String apiSecret) {
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
            "cloud_name", cloudName,
            "api_key", apiKey,
            "api_secret", apiSecret
        ));
    }

    public String uploadImage(MultipartFile file) throws IOException {
        try {
            logger.info("Uploading image to Cloudinary: {}", file.getOriginalFilename());
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
            String url = (String) uploadResult.get("url");
            logger.info("Image uploaded successfully: {}", url);
            return url;
        } catch (IOException e) {
            logger.error("Failed to upload image to Cloudinary: {}", file.getOriginalFilename(), e);
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error during Cloudinary upload: {}", file.getOriginalFilename(), e);
            throw new IOException("Unexpected error during upload", e);
        }
    }
}
