package com.craftresourcemanagement.hr.models;

public class BiometricData {
    private String fingerprintTemplate;
    private String faceImageBase64;

    public BiometricData() {
    }

    public BiometricData(String fingerprintTemplate, String faceImageBase64) {
        this.fingerprintTemplate = fingerprintTemplate;
        this.faceImageBase64 = faceImageBase64;
    }

    public String getFingerprintTemplate() {
        return fingerprintTemplate;
    }

    public void setFingerprintTemplate(String fingerprintTemplate) {
        this.fingerprintTemplate = fingerprintTemplate;
    }

    public String getFaceImageBase64() {
        return faceImageBase64;
    }

    public void setFaceImageBase64(String faceImageBase64) {
        this.faceImageBase64 = faceImageBase64;
    }
}
