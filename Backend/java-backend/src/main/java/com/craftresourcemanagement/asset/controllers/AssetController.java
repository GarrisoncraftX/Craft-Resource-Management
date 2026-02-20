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

    @GetMapping
    public ResponseEntity<List<AssetDTO>> getAllAssets(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(assetService.getAllAssets(status, category));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssetDTO> getAssetById(@PathVariable Long id) {
        return ResponseEntity.ok(assetService.getAssetById(id));
    }

    @PostMapping
    public ResponseEntity<AssetDTO> createAsset(@RequestBody Asset asset) {
        return ResponseEntity.ok(assetService.createAsset(asset));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AssetDTO> updateAsset(@PathVariable Long id, @RequestBody Asset asset) {
        return ResponseEntity.ok(assetService.updateAsset(id, asset));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAsset(@PathVariable Long id) {
        assetService.deleteAsset(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/checkout")
    public ResponseEntity<AssetDTO> checkoutAsset(
            @PathVariable Long id,
            @RequestBody Map<String, Object> checkoutData) {
        Long assignedTo = Long.valueOf(checkoutData.get("assigned_to").toString());
        String assignedType = (String) checkoutData.get("assigned_type");
        String note = (String) checkoutData.get("note");
        return ResponseEntity.ok(assetService.checkoutAsset(id, assignedTo, assignedType, note));
    }

    @PostMapping("/{id}/checkin")
    public ResponseEntity<AssetDTO> checkinAsset(
            @PathVariable Long id,
            @RequestBody Map<String, Object> checkinData) {
        String note = (String) checkinData.get("note");
        return ResponseEntity.ok(assetService.checkinAsset(id, note));
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

    // Maintenance endpoints
    @GetMapping("/maintenance-records")
    public ResponseEntity<List<Map<String, Object>>> getAllMaintenanceRecords() {
        return ResponseEntity.ok(assetService.getAllMaintenanceRecords());
    }

    @PostMapping("/maintenance-records")
    public ResponseEntity<Map<String, Object>> createMaintenanceRecord(@RequestBody Map<String, Object> record) {
        return ResponseEntity.ok(assetService.createMaintenanceRecord(record));
    }

    @GetMapping("/maintenance/costs")
    public ResponseEntity<List<Map<String, Object>>> getMaintenanceCosts() {
        return ResponseEntity.ok(assetService.getMaintenanceCosts());
    }

    // Disposal endpoints
    @GetMapping("/disposal-records")
    public ResponseEntity<List<Map<String, Object>>> getAllDisposalRecords() {
        return ResponseEntity.ok(assetService.getAllDisposalRecords());
    }

    @PostMapping("/disposal-records")
    public ResponseEntity<Map<String, Object>> createDisposalRecord(@RequestBody Map<String, Object> record) {
        return ResponseEntity.ok(assetService.createDisposalRecord(record));
    }

    // Settings endpoints
    @GetMapping("/categories")
    public ResponseEntity<List<Map<String, Object>>> getAllCategories() {
        return ResponseEntity.ok(assetService.getAllCategories());
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

    @GetMapping("/depreciations")
    public ResponseEntity<List<Map<String, Object>>> getAllDepreciations() {
        return ResponseEntity.ok(assetService.getAllDepreciations());
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

    @GetMapping("/reports/depreciation")
    public ResponseEntity<List<Map<String, Object>>> getDepreciationReport() {
        return ResponseEntity.ok(assetService.getDepreciationReport());
    }

    @GetMapping("/reports/maintenance")
    public ResponseEntity<List<Map<String, Object>>> getMaintenanceReport() {
        return ResponseEntity.ok(assetService.getMaintenanceReport());
    }
}
