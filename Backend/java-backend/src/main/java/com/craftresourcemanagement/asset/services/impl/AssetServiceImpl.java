package com.craftresourcemanagement.asset.services.impl;

import com.craftresourcemanagement.asset.entities.Asset;
import com.craftresourcemanagement.asset.entities.MaintenanceRecord;
import com.craftresourcemanagement.asset.entities.DisposalRecord;
import com.craftresourcemanagement.asset.repositories.AssetRepository;
import com.craftresourcemanagement.asset.repositories.MaintenanceRecordRepository;
import com.craftresourcemanagement.asset.repositories.DisposalRecordRepository;
import com.craftresourcemanagement.asset.services.AssetService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AssetServiceImpl implements AssetService {

    private final AssetRepository assetRepository;
    private final MaintenanceRecordRepository maintenanceRecordRepository;
    private final DisposalRecordRepository disposalRecordRepository;

    public AssetServiceImpl(AssetRepository assetRepository,
                            MaintenanceRecordRepository maintenanceRecordRepository,
                            DisposalRecordRepository disposalRecordRepository) {
        this.assetRepository = assetRepository;
        this.maintenanceRecordRepository = maintenanceRecordRepository;
        this.disposalRecordRepository = disposalRecordRepository;
    }

    // Asset
    @Override
    public Asset createAsset(Asset asset) {
        return assetRepository.save(asset);
    }

    @Override
    public List<Asset> getAllAssets() {
        return assetRepository.findAll();
    }

    @Override
    public Asset getAssetById(Long id) {
        return assetRepository.findById(id).orElse(null);
    }

    @Override
    public Asset updateAsset(Long id, Asset asset) {
        Optional<Asset> existing = assetRepository.findById(id);
        if (existing.isPresent()) {
            Asset toUpdate = existing.get();
            toUpdate.setAssetTag(asset.getAssetTag());
            toUpdate.setAssetName(asset.getAssetName());
            toUpdate.setDescription(asset.getDescription());
            toUpdate.setAcquisitionDate(asset.getAcquisitionDate());
            toUpdate.setAcquisitionCost(asset.getAcquisitionCost());
            toUpdate.setCurrentValue(asset.getCurrentValue());
            toUpdate.setLocation(asset.getLocation());
            toUpdate.setStatus(asset.getStatus());
            return assetRepository.save(toUpdate);
        }
        return null;
    }

    @Override
    public void deleteAsset(Long id) {
        assetRepository.deleteById(id);
    }

    // MaintenanceRecord
    @Override
    public MaintenanceRecord createMaintenanceRecord(MaintenanceRecord record) {
        return maintenanceRecordRepository.save(record);
    }

    @Override
    public List<MaintenanceRecord> getAllMaintenanceRecords() {
        return maintenanceRecordRepository.findAll();
    }

    @Override
    public MaintenanceRecord getMaintenanceRecordById(Long id) {
        return maintenanceRecordRepository.findById(id).orElse(null);
    }

    @Override
    public MaintenanceRecord updateMaintenanceRecord(Long id, MaintenanceRecord record) {
        Optional<MaintenanceRecord> existing = maintenanceRecordRepository.findById(id);
        if (existing.isPresent()) {
            MaintenanceRecord toUpdate = existing.get();
            toUpdate.setAsset(record.getAsset());
            toUpdate.setMaintenanceDate(record.getMaintenanceDate());
            toUpdate.setDescription(record.getDescription());
            toUpdate.setPerformedBy(record.getPerformedBy());
            return maintenanceRecordRepository.save(toUpdate);
        }
        return null;
    }

    @Override
    public void deleteMaintenanceRecord(Long id) {
        maintenanceRecordRepository.deleteById(id);
    }

    // DisposalRecord
    @Override
    public DisposalRecord createDisposalRecord(DisposalRecord record) {
        return disposalRecordRepository.save(record);
    }

    @Override
    public List<DisposalRecord> getAllDisposalRecords() {
        return disposalRecordRepository.findAll();
    }

    @Override
    public DisposalRecord getDisposalRecordById(Long id) {
        return disposalRecordRepository.findById(id).orElse(null);
    }

    @Override
    public DisposalRecord updateDisposalRecord(Long id, DisposalRecord record) {
        Optional<DisposalRecord> existing = disposalRecordRepository.findById(id);
        if (existing.isPresent()) {
            DisposalRecord toUpdate = existing.get();
            toUpdate.setAsset(record.getAsset());
            toUpdate.setDisposalDate(record.getDisposalDate());
            toUpdate.setReason(record.getReason());
            toUpdate.setDisposedBy(record.getDisposedBy());
            return disposalRecordRepository.save(toUpdate);
        }
        return null;
    }

    @Override
    public void deleteDisposalRecord(Long id) {
        disposalRecordRepository.deleteById(id);
    }
}
