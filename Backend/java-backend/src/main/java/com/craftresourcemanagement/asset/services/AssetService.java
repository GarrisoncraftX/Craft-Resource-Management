package com.craftresourcemanagement.asset.services;

import com.craftresourcemanagement.asset.entities.Asset;
import com.craftresourcemanagement.asset.entities.MaintenanceRecord;
import com.craftresourcemanagement.asset.entities.DisposalRecord;

import java.util.List;

public interface AssetService {

    // Asset
    Asset createAsset(Asset asset);
    List<Asset> getAllAssets();
    Asset getAssetById(Long id);
    Asset updateAsset(Long id, Asset asset);
    void deleteAsset(Long id);

    // MaintenanceRecord
    MaintenanceRecord createMaintenanceRecord(MaintenanceRecord record);
    List<MaintenanceRecord> getAllMaintenanceRecords();
    MaintenanceRecord getMaintenanceRecordById(Long id);
    MaintenanceRecord updateMaintenanceRecord(Long id, MaintenanceRecord record);
    void deleteMaintenanceRecord(Long id);

    // DisposalRecord
    DisposalRecord createDisposalRecord(DisposalRecord record);
    List<DisposalRecord> getAllDisposalRecords();
    DisposalRecord getDisposalRecordById(Long id);
    DisposalRecord updateDisposalRecord(Long id, DisposalRecord record);
    void deleteDisposalRecord(Long id);
}
