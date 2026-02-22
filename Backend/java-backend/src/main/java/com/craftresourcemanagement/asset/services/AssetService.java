package com.craftresourcemanagement.asset.services;

import com.craftresourcemanagement.asset.dto.AssetDTO;
import com.craftresourcemanagement.asset.entities.Asset;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import org.springframework.web.multipart.MultipartFile;

public interface AssetService {

    // Asset CRUD
    AssetDTO createAsset(Asset asset, Long userId);
    List<AssetDTO> getAllAssets(String status, String category);
    AssetDTO getAssetById(Long id);
    AssetDTO updateAsset(Long id, Asset asset, Long userId);
    void deleteAsset(Long id, Long userId);

    // Asset Image Upload
    AssetDTO uploadAssetImage(Long id, MultipartFile file) throws IOException;

    // Asset Checkout/Checkin
    AssetDTO checkoutAsset(Long id, Long assignedTo, String assignedType, String note, Long userId);
    AssetDTO checkinAsset(Long id, Map<String, Object> checkinData, Long userId);

    // Asset Stats
    Map<String, Long> getAssetCounts();
    Map<String, Object> getAssetStats();
    List<Map<String, Object>> getAssetsByCategory();
    List<Map<String, Object>> getAssetTrends();

    // Maintenance
    List<Map<String, Object>> getAllMaintenances();
    Map<String, Object> createMaintenance(Map<String, Object> record);
    Map<String, Object> updateMaintenance(Long id, Map<String, Object> record);
    void deleteMaintenance(Long id);
    Map<String, Object> getMaintenanceById(Long id);

    // Settings
    List<Map<String, Object>> getAllCategories();
    Map<String, Object> createCategory(Map<String, Object> category);
    Map<String, Object> updateCategory(Long id, Map<String, Object> category);
    void deleteCategory(Long id);

    List<Map<String, Object>> getAllManufacturers();
    Map<String, Object> createManufacturer(Map<String, Object> manufacturer);
    Map<String, Object> updateManufacturer(Long id, Map<String, Object> manufacturer);
    void deleteManufacturer(Long id);

    List<Map<String, Object>> getAllSuppliers();
    Map<String, Object> createSupplier(Map<String, Object> supplier);
    Map<String, Object> updateSupplier(Long id, Map<String, Object> supplier);
    void deleteSupplier(Long id);

    List<Map<String, Object>> getAllLocations();
    Map<String, Object> createLocation(Map<String, Object> location);
    Map<String, Object> updateLocation(Long id, Map<String, Object> location);
    void deleteLocation(Long id);

    List<Map<String, Object>> getAllModels();
    Map<String, Object> createModel(Map<String, Object> model);
    Map<String, Object> updateModel(Long id, Map<String, Object> model);
    void deleteModel(Long id);

    List<Map<String, Object>> getAllStatusLabels();
    Map<String, Object> createStatusLabel(Map<String, Object> statusLabel);
    Map<String, Object> updateStatusLabel(Long id, Map<String, Object> statusLabel);
    void deleteStatusLabel(Long id);

    List<Map<String, Object>> getAllDepreciations();
    Map<String, Object> createDepreciation(Map<String, Object> depreciation);
    Map<String, Object> updateDepreciation(Long id, Map<String, Object> depreciation);
    void deleteDepreciation(Long id);

    List<Map<String, Object>> getAllCompanies();
    Map<String, Object> createCompany(Map<String, Object> company);
    Map<String, Object> updateCompany(Long id, Map<String, Object> company);
    void deleteCompany(Long id);

    List<Map<String, Object>> getAllDepartments();
    Map<String, Object> createDepartment(Map<String, Object> department);
    Map<String, Object> updateDepartment(Long id, Map<String, Object> department);
    void deleteDepartment(Long id);

    // Reports
    List<Map<String, Object>> getDepreciationReport();
    List<Map<String, Object>> getMaintenanceReport();

    // Asset Audits
    Map<String, Object> createAssetAudit(Map<String, Object> auditData);
    Map<String, Object> updateAssetAudit(Long id, Map<String, Object> auditData);
    List<Map<String, Object>> getAllAssetAudits();
    Map<String, Object> getAssetAuditById(Long id);

    // Licenses
    List<Map<String, Object>> getAllLicenses();
}
