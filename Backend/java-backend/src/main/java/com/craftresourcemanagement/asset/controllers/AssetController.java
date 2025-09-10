package com.craftresourcemanagement.asset.controllers;

import com.craftresourcemanagement.asset.entities.Asset;
import com.craftresourcemanagement.asset.entities.MaintenanceRecord;
import com.craftresourcemanagement.asset.entities.DisposalRecord;
import com.craftresourcemanagement.asset.services.AssetService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/assets")
public class AssetController {

    private final AssetService assetService;

    public AssetController(AssetService assetService) {
        this.assetService = assetService;
    }

    // Asset endpoints
    @PostMapping
    public ResponseEntity<Asset> createAsset(@RequestBody Asset asset) {
        return ResponseEntity.ok(assetService.createAsset(asset));
    }

    @GetMapping
    public ResponseEntity<List<Asset>> getAllAssets() {
        return ResponseEntity.ok(assetService.getAllAssets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Asset> getAssetById(@PathVariable Long id) {
        Asset assetData = assetService.getAssetById(id);
        if (assetData == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(assetData);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Asset> updateAsset(@PathVariable Long id, @RequestBody Asset assetRequest) {
        Asset updatedAsset = assetService.updateAsset(id, assetRequest);
        if (updatedAsset == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updatedAsset);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAsset(@PathVariable Long id) {
        assetService.deleteAsset(id);
        return ResponseEntity.noContent().build();
    }

    // MaintenanceRecord endpoints
    @PostMapping("/maintenance-records")
    public ResponseEntity<MaintenanceRecord> createMaintenanceRecord(@RequestBody MaintenanceRecord maintenanceRecord) {
        return ResponseEntity.ok(assetService.createMaintenanceRecord(maintenanceRecord));
    }

    @GetMapping("/maintenance-records")
    public ResponseEntity<List<MaintenanceRecord>> getAllMaintenanceRecords() {
        return ResponseEntity.ok(assetService.getAllMaintenanceRecords());
    }

    @GetMapping("/maintenance-records/{id}")
    public ResponseEntity<MaintenanceRecord> getMaintenanceRecordById(@PathVariable Long id) {
        MaintenanceRecord maintenanceRecord = assetService.getMaintenanceRecordById(id);
        if (maintenanceRecord == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(maintenanceRecord);
    }

    @PutMapping("/maintenance-records/{id}")
    public ResponseEntity<MaintenanceRecord> updateMaintenanceRecord(@PathVariable Long id, @RequestBody MaintenanceRecord maintenanceRecord) {
        MaintenanceRecord updatedRecord = assetService.updateMaintenanceRecord(id, maintenanceRecord);
        if (updatedRecord == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updatedRecord);
    }

    @DeleteMapping("/maintenance-records/{id}")
    public ResponseEntity<Void> deleteMaintenanceRecord(@PathVariable Long id) {
        assetService.deleteMaintenanceRecord(id);
        return ResponseEntity.noContent().build();
    }

    // DisposalRecord endpoints
    @PostMapping("/disposal-records")
    public ResponseEntity<DisposalRecord> createDisposalRecord(@RequestBody DisposalRecord disposalRecord) {
        return ResponseEntity.ok(assetService.createDisposalRecord(disposalRecord));
    }

    @GetMapping("/disposal-records")
    public ResponseEntity<List<DisposalRecord>> getAllDisposalRecords() {
        return ResponseEntity.ok(assetService.getAllDisposalRecords());
    }

    @GetMapping("/disposal-records/{id}")
    public ResponseEntity<DisposalRecord> getDisposalRecordById(@PathVariable Long id) {
        DisposalRecord disposalRecord = assetService.getDisposalRecordById(id);
        if (disposalRecord == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(disposalRecord);
    }

    @PutMapping("/disposal-records/{id}")
    public ResponseEntity<DisposalRecord> updateDisposalRecord(@PathVariable Long id, @RequestBody DisposalRecord disposalRecord) {
        DisposalRecord updatedDisposalRecord = assetService.updateDisposalRecord(id, disposalRecord);
        if (updatedDisposalRecord == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updatedDisposalRecord);
    }

    @DeleteMapping("/disposal-records/{id}")
    public ResponseEntity<Void> deleteDisposalRecord(@PathVariable Long id) {
        assetService.deleteDisposalRecord(id);
        return ResponseEntity.noContent().build();
    }
}
