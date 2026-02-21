package com.craftresourcemanagement.asset.controllers;

import com.craftresourcemanagement.asset.dto.AssetDTO;
import com.craftresourcemanagement.asset.entities.Asset;
import com.craftresourcemanagement.asset.services.AssetService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/assets")
@CrossOrigin(origins = "*")
public class AssetController {

    private final AssetService assetService;

    public AssetController(AssetService assetService) {
        this.assetService = assetService;
    }

    @GetMapping
    public ResponseEntity<List<AssetDTO>> getAllAssets(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(assetService.getAllAssets(status, category));
    }

    @GetMapping("/counts")
    public ResponseEntity<Map<String, Long>> getAssetCounts() {
        return ResponseEntity.ok(assetService.getAssetCounts());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getAssetStats() {
        return ResponseEntity.ok(assetService.getAssetStats());
    }

    @GetMapping("/by-category")
    public ResponseEntity<List<Map<String, Object>>> getAssetsByCategory() {
        return ResponseEntity.ok(assetService.getAssetsByCategory());
    }

    @GetMapping("/trends")
    public ResponseEntity<List<Map<String, Object>>> getAssetTrends() {
        return ResponseEntity.ok(assetService.getAssetTrends());
    }

    @GetMapping("/companies")
    public ResponseEntity<List<Map<String, Object>>> getAllCompanies() {
        return ResponseEntity.ok(assetService.getAllCompanies());
    }

    @GetMapping("/models")
    public ResponseEntity<List<Map<String, Object>>> getAllModels() {
        return ResponseEntity.ok(assetService.getAllModels());
    }

    @GetMapping("/status-labels")
    public ResponseEntity<List<Map<String, Object>>> getAllStatusLabels() {
        return ResponseEntity.ok(assetService.getAllStatusLabels());
    }

    @GetMapping("/locations")
    public ResponseEntity<List<Map<String, Object>>> getAllLocations() {
        return ResponseEntity.ok(assetService.getAllLocations());
    }

    @GetMapping("/manufacturers")
    public ResponseEntity<List<Map<String, Object>>> getAllManufacturers() {
        return ResponseEntity.ok(assetService.getAllManufacturers());
    }

    @GetMapping("/suppliers")
    public ResponseEntity<List<Map<String, Object>>> getAllSuppliers() {
        return ResponseEntity.ok(assetService.getAllSuppliers());
    }

    @GetMapping("/departments")
    public ResponseEntity<List<Map<String, Object>>> getAllDepartments() {
        return ResponseEntity.ok(assetService.getAllDepartments());
    }

    @GetMapping("/categories")
    public ResponseEntity<List<Map<String, Object>>> getAllCategories() {
        return ResponseEntity.ok(assetService.getAllCategories());
    }

    @GetMapping("/depreciations")
    public ResponseEntity<List<Map<String, Object>>> getAllDepreciations() {
        return ResponseEntity.ok(assetService.getAllDepreciations());
    }

    @GetMapping("/maintenance-records")
    public ResponseEntity<List<Map<String, Object>>> getAllMaintenanceRecords() {
        return ResponseEntity.ok(assetService.getAllMaintenanceRecords());
    }

    @GetMapping("/maintenance/costs")
    public ResponseEntity<List<Map<String, Object>>> getMaintenanceCosts() {
        return ResponseEntity.ok(assetService.getMaintenanceCosts());
    }

    @GetMapping("/disposal-records")
    public ResponseEntity<List<Map<String, Object>>> getAllDisposalRecords() {
        return ResponseEntity.ok(assetService.getAllDisposalRecords());
    }

    @GetMapping("/reports/depreciation")
    public ResponseEntity<List<Map<String, Object>>> getDepreciationReport() {
        return ResponseEntity.ok(assetService.getDepreciationReport());
    }

    @GetMapping("/reports/maintenance")
    public ResponseEntity<List<Map<String, Object>>> getMaintenanceReport() {
        return ResponseEntity.ok(assetService.getMaintenanceReport());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssetDTO> getAssetById(@PathVariable Long id) {
        return ResponseEntity.ok(assetService.getAssetById(id));
    }

    @PostMapping("/{id}/image")
    public ResponseEntity<AssetDTO> uploadAssetImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        if (file.getSize() > 25 * 1024 * 1024) { // 25MB limit
            return ResponseEntity.badRequest().build();
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().build();
        }
        try {
            AssetDTO result = assetService.uploadAssetImage(id, file);
            return ResponseEntity.ok(result);
        } catch (IOException e) {
            return ResponseEntity.status(500).build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping
    public ResponseEntity<AssetDTO> createAsset(
            @RequestBody Asset asset,
            @RequestHeader(value = "x-user-id", required = false) String userId) {
        Long userIdLong = userId != null ? Long.parseLong(userId) : null;
        return ResponseEntity.ok(assetService.createAsset(asset, userIdLong));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AssetDTO> updateAsset(
            @PathVariable Long id,
            @RequestBody Asset asset,
            @RequestHeader(value = "x-user-id", required = false) String userId) {
        Long userIdLong = userId != null ? Long.parseLong(userId) : null;
        return ResponseEntity.ok(assetService.updateAsset(id, asset, userIdLong));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAsset(
            @PathVariable Long id,
            @RequestHeader(value = "x-user-id", required = false) String userId) {
        Long userIdLong = userId != null ? Long.parseLong(userId) : null;
        assetService.deleteAsset(id, userIdLong);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/checkout")
    public ResponseEntity<AssetDTO> checkoutAsset(
            @PathVariable Long id,
            @RequestBody Map<String, Object> checkoutData,
            @RequestHeader(value = "x-user-id", required = false) String userId) {
        Long assignedTo = Long.valueOf(checkoutData.get("assigned_to").toString());
        String assignedType = (String) checkoutData.get("assigned_type");
        String note = (String) checkoutData.get("note");
        Long userIdLong = userId != null ? Long.parseLong(userId) : null;
        return ResponseEntity.ok(assetService.checkoutAsset(id, assignedTo, assignedType, note, userIdLong));
    }

    @PostMapping("/{id}/checkin")
    public ResponseEntity<AssetDTO> checkinAsset(
            @PathVariable Long id,
            @RequestBody Map<String, Object> checkinData,
            @RequestHeader(value = "x-user-id", required = false) String userId) {
        String note = (String) checkinData.get("note");
        Long userIdLong = userId != null ? Long.parseLong(userId) : null;
        return ResponseEntity.ok(assetService.checkinAsset(id, note, userIdLong));
    }

    @PostMapping("/maintenance-records")
    public ResponseEntity<Map<String, Object>> createMaintenanceRecord(@RequestBody Map<String, Object> record) {
        return ResponseEntity.ok(assetService.createMaintenanceRecord(record));
    }

    @PostMapping("/disposal-records")
    public ResponseEntity<Map<String, Object>> createDisposalRecord(@RequestBody Map<String, Object> record) {
        return ResponseEntity.ok(assetService.createDisposalRecord(record));
    }
    @PostMapping("/categories")
    public ResponseEntity<Map<String, Object>> createCategory(@RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(assetService.createCategory(data));
    }
    @PutMapping("/categories/{id}")
    public ResponseEntity<Map<String, Object>> updateCategory(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(assetService.updateCategory(id, data));
    }
    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        assetService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/depreciations")
    public ResponseEntity<Map<String, Object>> createDepreciation(@RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(assetService.createDepreciation(data));
    }
    @PutMapping("/depreciations/{id}")
    public ResponseEntity<Map<String, Object>> updateDepreciation(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(assetService.updateDepreciation(id, data));
    }
    @DeleteMapping("/depreciations/{id}")
    public ResponseEntity<Void> deleteDepreciation(@PathVariable Long id) {
        assetService.deleteDepreciation(id);
        return ResponseEntity.noContent().build();
    }

    // Asset Audits
    @PostMapping("/audits")
    public ResponseEntity<Map<String, Object>> createAssetAudit(
            @RequestBody Map<String, Object> auditData,
            @RequestHeader(value = "x-user-id", required = false) String userId) {
        if (userId != null) {
            auditData.put("auditedBy", Long.parseLong(userId));
        }
        return ResponseEntity.ok(assetService.createAssetAudit(auditData));
    }

    @PutMapping("/audits/{id}")
    public ResponseEntity<Map<String, Object>> updateAssetAudit(@PathVariable Long id, @RequestBody Map<String, Object> auditData) {
        try {
            return ResponseEntity.ok(assetService.updateAssetAudit(id, auditData));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/audits")
    public ResponseEntity<List<Map<String, Object>>> getAllAssetAudits() {
        return ResponseEntity.ok(assetService.getAllAssetAudits());
    }

    @GetMapping("/audits/{id}")
    public ResponseEntity<Map<String, Object>> getAssetAuditById(@PathVariable Long id) {
        return ResponseEntity.ok(assetService.getAssetAuditById(id));
    }
}
