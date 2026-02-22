package com.craftresourcemanagement.asset.services.impl;

import com.craftresourcemanagement.asset.dto.AssetDTO;
import com.craftresourcemanagement.asset.entities.*;
import com.craftresourcemanagement.asset.repositories.*;
import com.craftresourcemanagement.asset.services.AssetService;
import com.craftresourcemanagement.hr.services.CloudinaryService;
import com.craftresourcemanagement.hr.repositories.UserRepository;
import com.craftresourcemanagement.system.repositories.AuditLogRepository;
import com.craftresourcemanagement.system.entities.AuditLog;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AssetServiceImpl implements AssetService {

    private final AssetRepository assetRepository;
    private final AuditLogRepository auditLogRepository;
    private final AssetAuditRepository assetAuditRepository;
    private final CategoryRepository categoryRepository;
    private final ManufacturerRepository manufacturerRepository;
    private final SupplierRepository supplierRepository;
    private final LocationRepository locationRepository;
    private final AssetModelRepository assetModelRepository;
    private final StatusLabelRepository statusLabelRepository;
    private final DepreciationRepository depreciationRepository;
    private final CompanyRepository companyRepository;
    private final DepartmentRepository departmentRepository;
    private final CloudinaryService cloudinaryService;
    private final UserRepository userRepository;

    public AssetServiceImpl(AssetRepository assetRepository, AuditLogRepository auditLogRepository,
                           AssetAuditRepository assetAuditRepository,
                           CategoryRepository categoryRepository, ManufacturerRepository manufacturerRepository,
                           SupplierRepository supplierRepository, LocationRepository locationRepository,
                           AssetModelRepository assetModelRepository, StatusLabelRepository statusLabelRepository,
                           DepreciationRepository depreciationRepository, CompanyRepository companyRepository,
                           DepartmentRepository departmentRepository, CloudinaryService cloudinaryService,
                           UserRepository userRepository) {
        this.assetRepository = assetRepository;
        this.auditLogRepository = auditLogRepository;
        this.assetAuditRepository = assetAuditRepository;
        this.categoryRepository = categoryRepository;
        this.manufacturerRepository = manufacturerRepository;
        this.supplierRepository = supplierRepository;
        this.locationRepository = locationRepository;
        this.assetModelRepository = assetModelRepository;
        this.statusLabelRepository = statusLabelRepository;
        this.depreciationRepository = depreciationRepository;
        this.companyRepository = companyRepository;
        this.departmentRepository = departmentRepository;
        this.cloudinaryService = cloudinaryService;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public AssetDTO createAsset(Asset asset, Long userId) {
        // Auto-generate asset tag if not provided
        if (asset.getAssetTag() == null || asset.getAssetTag().trim().isEmpty()) {
            asset.setAssetTag(generateUniqueAssetTag());
        }
        Asset saved = assetRepository.save(asset);
        String userName = getUserName(userId);
        logAudit(userId, "Asset Created by " + userName, "Asset", saved.getId(), 
                String.format("%s created new asset '%s' with tag %s", userName, saved.getName(), saved.getAssetTag()));
        return convertToDTO(saved);
    }
    
    private String generateUniqueAssetTag() {
        String assetTag;
        Random random = new Random();
        do {
            int randomNumber = 1000000 + random.nextInt(9000000);
            assetTag = "CRMS" + randomNumber;
        } while (assetRepository.existsByAssetTag(assetTag));
        return assetTag;
    }

    @Override
    public List<AssetDTO> getAllAssets(String status, String category) {
        List<Asset> assets = assetRepository.findAll();
        return assets.stream().map(this::convertToDTO).toList();
    }

    @Override
    public AssetDTO getAssetById(Long id) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Asset not found"));
        return convertToDTO(asset);
    }

    @Override
    @Transactional
    public AssetDTO updateAsset(Long id, Asset asset, Long userId) {
        Asset existing = assetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Asset not found"));
        
        // Don't update assetTag - it's immutable after creation
        if (asset.getName() != null) existing.setName(asset.getName());
        if (asset.getSerial() != null) existing.setSerial(asset.getSerial());
        if (asset.getModelId() != null) existing.setModelId(asset.getModelId());
        if (asset.getStatusId() != null) existing.setStatusId(asset.getStatusId());
        if (asset.getCompanyId() != null) existing.setCompanyId(asset.getCompanyId());
        if (asset.getLocationId() != null) existing.setLocationId(asset.getLocationId());
        if (asset.getRtdLocationId() != null) existing.setRtdLocationId(asset.getRtdLocationId());
        if (asset.getSupplierId() != null) existing.setSupplierId(asset.getSupplierId());
        if (asset.getPurchaseDate() != null) existing.setPurchaseDate(asset.getPurchaseDate());
        if (asset.getPurchaseCost() != null) existing.setPurchaseCost(asset.getPurchaseCost());
        if (asset.getWarrantyMonths() != null) existing.setWarrantyMonths(asset.getWarrantyMonths());
        if (asset.getOrderNumber() != null) existing.setOrderNumber(asset.getOrderNumber());
        if (asset.getNotes() != null) existing.setNotes(asset.getNotes());
        if (asset.getExpectedCheckin() != null) existing.setExpectedCheckin(asset.getExpectedCheckin());
        if (asset.getNextAuditDate() != null) existing.setNextAuditDate(asset.getNextAuditDate());
        if (asset.getByod() != null) existing.setByod(asset.getByod());
        if (asset.getEolDate() != null) existing.setEolDate(asset.getEolDate());
        if (asset.getRequestable() != null) existing.setRequestable(asset.getRequestable());
        if (asset.getImage() != null) existing.setImage(asset.getImage());
        
        Asset updated = assetRepository.save(existing);
        String userName = getUserName(userId);
        logAudit(userId, "Asset Updated by " + userName, "Asset", updated.getId(), 
                String.format("%s updated asset '%s' (%s)", userName, updated.getName(), updated.getAssetTag()));
        return convertToDTO(updated);
    }

@Override
    @Transactional
    public void deleteAsset(Long id, Long userId) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Asset not found"));
        String userName = getUserName(userId);
        logAudit(userId, "Asset Deleted by " + userName, "Asset", id, 
                String.format("%s permanently deleted asset '%s' (%s)", userName, asset.getName(), asset.getAssetTag()));
        assetRepository.deleteById(id);
    }

    @Override
    @Transactional
    public AssetDTO uploadAssetImage(Long id, MultipartFile file) throws IOException {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Asset not found"));
        
        try {
            String imageUrl = cloudinaryService.uploadImage(file);
            asset.setImage(imageUrl);
            Asset updated = assetRepository.save(asset);
            logAudit(null, "Asset Image Updated", "Asset", id, 
                    String.format("Uploaded new image for asset '%s' (%s)", asset.getName(), asset.getAssetTag()));
            return convertToDTO(updated);
        } catch (IOException e) {
            throw new IOException("Failed to upload image: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public AssetDTO checkoutAsset(Long id, Long assignedTo, String assignedType, String note, Long userId) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Asset not found"));
        
        asset.setAssignedTo(assignedTo);
        asset.setAssignedType(assignedType);
        asset.setLastCheckout(LocalDateTime.now());
        
        Asset updated = assetRepository.save(asset);
        
        String userName = getUserName(userId);
        String assigneeName = getAssigneeName(assignedTo, assignedType);
        logAudit(userId, "Asset Checked Out by " + userName, "Asset", id, 
                String.format("%s checked out asset '%s' (%s) to %s%s", 
                        userName, asset.getName(), asset.getAssetTag(), assigneeName, 
                        note != null && !note.isEmpty() ? ". Note: " + note : ""));
        
        return convertToDTO(updated);
    }

    @Override
    @Transactional
    public AssetDTO checkinAsset(Long id, Map<String, Object> checkinData, Long userId) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Asset not found"));
        
        Long previousAssignee = asset.getAssignedTo();
        asset.setAssignedTo(null);
        asset.setAssignedType(null);
        asset.setExpectedCheckin(null);
        
        // Update status if provided
        if (checkinData.containsKey("statusId")) {
            Object statusIdObj = checkinData.get("statusId");
            if (statusIdObj != null) {
                asset.setStatusId(((Number) statusIdObj).longValue());
            }
        }
        
        // Update location if provided
        if (checkinData.containsKey("locationId")) {
            Object locationIdObj = checkinData.get("locationId");
            if (locationIdObj != null) {
                Long locationId = ((Number) locationIdObj).longValue();
                asset.setLocationId(locationId);
                
                // Update default location if requested
                if (Boolean.TRUE.equals(checkinData.get("updateDefaultLocation"))) {
                    asset.setRtdLocationId(locationId);
                }
            }
        }
        
        Asset updated = assetRepository.save(asset);
        
        // Extract note for audit log
        String note = checkinData.containsKey("notes") ? (String) checkinData.get("notes") : "";
        
        String userName = getUserName(userId);
        String previousAssigneeName = previousAssignee != null ? getUserName(previousAssignee) : "Unknown";
        logAudit(userId, "Asset Checked In by " + userName, "Asset", id, 
                String.format("%s checked in asset '%s' (%s) from %s%s", 
                        userName, asset.getName(), asset.getAssetTag(), previousAssigneeName,
                        note != null && !note.isEmpty() ? ". Note: " + note : ""));
        
        return convertToDTO(updated);
    }

    @Override
    public Map<String, Long> getAssetCounts() {
        List<Asset> all = assetRepository.findAll();
        List<StatusLabel> statuses = statusLabelRepository.findAll();
        
        Map<String, Long> statusCounts = statuses.stream()
            .collect(Collectors.toMap(
                s -> s.getStatusType().toLowerCase(),
                s -> all.stream().filter(a -> s.getId().equals(a.getStatusId())).count(),
                Long::sum
            ));
        
        long deployed = all.stream().filter(a -> a.getAssignedTo() != null).count();
        long readyToDeploy = all.stream().filter(a -> a.getAssignedTo() == null && 
            statusLabelRepository.findById(a.getStatusId())
                .map(s -> "deployable".equalsIgnoreCase(s.getStatusType()))
                .orElse(false)).count();
        long byod = all.stream().filter(a -> Boolean.TRUE.equals(a.getByod())).count();
        long requestable = all.stream().filter(a -> Boolean.TRUE.equals(a.getRequestable())).count();
        long dueForAudit = all.stream().filter(a -> a.getNextAuditDate() != null && 
            !a.getNextAuditDate().isAfter(LocalDate.now())).count();
        long dueForCheckin = all.stream().filter(a -> a.getExpectedCheckin() != null && 
            !a.getExpectedCheckin().isAfter(LocalDate.now())).count();
        
        return Map.of(
            "list-all", (long) all.size(),
            "deployed", deployed,
            "ready-to-deploy", readyToDeploy,
            "pending", statusCounts.getOrDefault("pending", 0L),
            "un-deployable", statusCounts.getOrDefault("undeployable", 0L),
            "byod", byod,
            "archived", statusCounts.getOrDefault("archived", 0L),
            "requestable", requestable,
            "due-for-audit", dueForAudit,
            "due-for-checkin", dueForCheckin
        );
    }

    @Override
    public Map<String, Object> getAssetStats() {
        List<Asset> all = assetRepository.findAll();
        List<StatusLabel> statuses = statusLabelRepository.findAll();
        
        long maintenanceAssets = statuses.stream()
            .filter(s -> "maintenance".equalsIgnoreCase(s.getStatusType()))
            .mapToLong(s -> all.stream().filter(a -> s.getId().equals(a.getStatusId())).count())
            .sum();
        
        long disposedAssets = statuses.stream()
            .filter(s -> "archived".equalsIgnoreCase(s.getStatusType()))
            .mapToLong(s -> all.stream().filter(a -> s.getId().equals(a.getStatusId())).count())
            .sum();
        
        BigDecimal totalValue = all.stream()
            .filter(a -> a.getPurchaseCost() != null)
            .map(Asset::getPurchaseCost)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalCurrentValue = all.stream()
            .map(this::calculateCurrentValue)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        double depreciationRate = totalValue.compareTo(BigDecimal.ZERO) > 0 
            ? totalValue.subtract(totalCurrentValue).divide(totalValue, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100)).doubleValue()
            : 0.0;
        
        return Map.of(
            "totalAssets", all.size(),
            "activeAssets", all.stream().filter(a -> a.getAssignedTo() != null).count(),
            "maintenanceAssets", maintenanceAssets,
            "disposedAssets", disposedAssets,
            "totalValue", totalValue,
            "depreciationRate", depreciationRate
        );
    }
    
    private BigDecimal calculateCurrentValue(Asset asset) {
        if (asset.getPurchaseDate() == null || asset.getPurchaseCost() == null || asset.getModelId() == null) {
            return asset.getPurchaseCost() != null ? asset.getPurchaseCost() : BigDecimal.ZERO;
        }
        
        return assetModelRepository.findById(asset.getModelId())
            .flatMap(model -> model.getDepreciationId() != null 
                ? depreciationRepository.findById(model.getDepreciationId()) 
                : Optional.empty())
            .map(depreciation -> {
                long monthsPassed = ChronoUnit.MONTHS.between(asset.getPurchaseDate(), LocalDate.now());
                int totalMonths = depreciation.getMonths();
                BigDecimal purchaseCost = asset.getPurchaseCost();
                BigDecimal floorValue = depreciation.getDepreciationMin();
                
                BigDecimal depreciableAmount = purchaseCost.subtract(floorValue);
                BigDecimal monthlyDepreciation = depreciableAmount.divide(BigDecimal.valueOf(totalMonths), 2, RoundingMode.HALF_UP);
                BigDecimal totalDepreciation = monthlyDepreciation.multiply(BigDecimal.valueOf(Math.min(monthsPassed, totalMonths)));
                
                return purchaseCost.subtract(totalDepreciation).max(floorValue);
            })
            .orElse(asset.getPurchaseCost());
    }

    @Override
    public List<Map<String, Object>> getAssetsByCategory() {
        return new ArrayList<>();
    }

    @Override
    public List<Map<String, Object>> getAssetTrends() {
        return new ArrayList<>();
    }

    @Override
    public List<Map<String, Object>> getAllMaintenanceRecords() {
        return new ArrayList<>();
    }

    @Override
    public Map<String, Object> createMaintenanceRecord(Map<String, Object> record) {
        return record;
    }

    @Override
    public List<Map<String, Object>> getMaintenanceCosts() {
        return new ArrayList<>();
    }

    @Override
    public List<Map<String, Object>> getAllDisposalRecords() {
        return new ArrayList<>();
    }

    @Override
    public Map<String, Object> createDisposalRecord(Map<String, Object> record) {
        return record;
    }

    @Override
    public List<Map<String, Object>> getAllCategories() {
        return categoryRepository.findAll().stream()
            .map(c -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", c.getId());
                map.put("name", c.getName());
                map.put("type", c.getCategoryType());
                map.put("image", c.getImage());
                map.put("acceptance", c.getRequireAcceptance());
                map.put("qty", assetRepository.findAll().stream().filter(a -> a.getModelId() != null).count());
                return map;
            }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Map<String, Object> createCategory(Map<String, Object> data) {
        Category category = new Category();
        category.setName((String) data.get("name"));
        category.setCategoryType((String) data.getOrDefault("type", "asset"));
        category.setImage((String) data.get("image"));
        category.setRequireAcceptance((Boolean) data.getOrDefault("acceptance", false));
        Category saved = categoryRepository.save(category);
        Map<String, Object> result = new HashMap<>();
        result.put("id", saved.getId());
        result.put("name", saved.getName());
        return result;
    }

    @Override
    @Transactional
    public Map<String, Object> updateCategory(Long id, Map<String, Object> data) {
        Category category = categoryRepository.findById(id).orElseThrow(() -> new RuntimeException("Category not found"));
        if (data.containsKey("name")) category.setName((String) data.get("name"));
        if (data.containsKey("type")) category.setCategoryType((String) data.get("type"));
        if (data.containsKey("image")) category.setImage((String) data.get("image"));
        if (data.containsKey("acceptance")) category.setRequireAcceptance((Boolean) data.get("acceptance"));
        Category saved = categoryRepository.save(category);
        Map<String, Object> result = new HashMap<>();
        result.put("id", saved.getId());
        result.put("name", saved.getName());
        return result;
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }

    @Override
    public List<Map<String, Object>> getAllManufacturers() {
        return manufacturerRepository.findAll().stream()
            .map(m -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", m.getId());
                map.put("name", m.getName());
                map.put("url", m.getUrl());
                map.put("supportUrl", m.getSupportUrl());
                map.put("supportPhone", m.getSupportPhone());
                map.put("supportEmail", m.getSupportEmail());
                map.put("image", m.getImage());
                map.put("assets", 0);
                return map;
            }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Map<String, Object> createManufacturer(Map<String, Object> data) {
        Manufacturer manufacturer = new Manufacturer();
        manufacturer.setName((String) data.get("name"));
        manufacturer.setUrl((String) data.get("url"));
        manufacturer.setSupportUrl((String) data.get("supportUrl"));
        manufacturer.setSupportPhone((String) data.get("supportPhone"));
        manufacturer.setSupportEmail((String) data.get("supportEmail"));
        Manufacturer saved = manufacturerRepository.save(manufacturer);
        Map<String, Object> result = new HashMap<>();
        result.put("id", saved.getId());
        result.put("name", saved.getName());
        return result;
    }

    @Override
    @Transactional
    public Map<String, Object> updateManufacturer(Long id, Map<String, Object> data) {
        Manufacturer manufacturer = manufacturerRepository.findById(id).orElseThrow(() -> new RuntimeException("Manufacturer not found"));
        if (data.containsKey("name")) manufacturer.setName((String) data.get("name"));
        if (data.containsKey("url")) manufacturer.setUrl((String) data.get("url"));
        if (data.containsKey("supportUrl")) manufacturer.setSupportUrl((String) data.get("supportUrl"));
        if (data.containsKey("supportPhone")) manufacturer.setSupportPhone((String) data.get("supportPhone"));
        if (data.containsKey("supportEmail")) manufacturer.setSupportEmail((String) data.get("supportEmail"));
        Manufacturer saved = manufacturerRepository.save(manufacturer);
        Map<String, Object> result = new HashMap<>();
        result.put("id", saved.getId());
        result.put("name", saved.getName());
        return result;
    }

    @Override
    @Transactional
    public void deleteManufacturer(Long id) {
        manufacturerRepository.deleteById(id);
    }

    @Override
    public List<Map<String, Object>> getAllSuppliers() {
        return supplierRepository.findAll().stream()
            .map(s -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", s.getId());
                map.put("name", s.getName());
                map.put("address", s.getAddress());
                map.put("city", s.getCity());
                map.put("state", s.getState());
                map.put("url", s.getUrl());
                map.put("assets", assetRepository.findAll().stream().filter(a -> s.getId().equals(a.getSupplierId())).count());
                return map;
            }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Map<String, Object> createSupplier(Map<String, Object> data) {
        Supplier supplier = new Supplier();
        supplier.setName((String) data.get("name"));
        supplier.setAddress((String) data.get("address"));
        supplier.setCity((String) data.get("city"));
        supplier.setState((String) data.get("state"));
        supplier.setUrl((String) data.get("url"));
        Supplier saved = supplierRepository.save(supplier);
        Map<String, Object> result = new HashMap<>();
        result.put("id", saved.getId());
        result.put("name", saved.getName());
        return result;
    }

    @Override
    @Transactional
    public Map<String, Object> updateSupplier(Long id, Map<String, Object> data) {
        Supplier supplier = supplierRepository.findById(id).orElseThrow(() -> new RuntimeException("Supplier not found"));
        if (data.containsKey("name")) supplier.setName((String) data.get("name"));
        if (data.containsKey("address")) supplier.setAddress((String) data.get("address"));
        if (data.containsKey("city")) supplier.setCity((String) data.get("city"));
        if (data.containsKey("state")) supplier.setState((String) data.get("state"));
        if (data.containsKey("url")) supplier.setUrl((String) data.get("url"));
        Supplier saved = supplierRepository.save(supplier);
        Map<String, Object> result = new HashMap<>();
        result.put("id", saved.getId());
        result.put("name", saved.getName());
        return result;
    }

    @Override
    @Transactional
    public void deleteSupplier(Long id) {
        supplierRepository.deleteById(id);
    }

    @Override
    public List<Map<String, Object>> getAllLocations() {
        return locationRepository.findAll().stream()
            .map(l -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", l.getId());
                map.put("name", l.getName());
                map.put("address", l.getAddress());
                map.put("city", l.getCity());
                map.put("state", l.getState());
                map.put("parent", l.getParentId());
                map.put("assets", assetRepository.findAll().stream().filter(a -> l.getId().equals(a.getLocationId())).count());
                return map;
            }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Map<String, Object> createLocation(Map<String, Object> data) {
        Location location = new Location();
        location.setName((String) data.get("name"));
        location.setAddress((String) data.get("address"));
        location.setCity((String) data.get("city"));
        location.setState((String) data.get("state"));
        Location saved = locationRepository.save(location);
        Map<String, Object> result = new HashMap<>();
        result.put("id", saved.getId());
        result.put("name", saved.getName());
        return result;
    }

    @Override
    @Transactional
    public Map<String, Object> updateLocation(Long id, Map<String, Object> data) {
        Location location = locationRepository.findById(id).orElseThrow(() -> new RuntimeException("Location not found"));
        if (data.containsKey("name")) location.setName((String) data.get("name"));
        if (data.containsKey("address")) location.setAddress((String) data.get("address"));
        if (data.containsKey("city")) location.setCity((String) data.get("city"));
        if (data.containsKey("state")) location.setState((String) data.get("state"));
        Location saved = locationRepository.save(location);
        Map<String, Object> result = new HashMap<>();
        result.put("id", saved.getId());
        result.put("name", saved.getName());
        return result;
    }

    @Override
    @Transactional
    public void deleteLocation(Long id) {
        locationRepository.deleteById(id);
    }

    @Override
    public List<Map<String, Object>> getAllModels() {
        return assetModelRepository.findAll().stream()
            .map(m -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", m.getId());
                map.put("name", m.getName());
                map.put("modelNo", m.getModelNumber());
                map.put("image", m.getImage());
                map.put("minQty", m.getMinAmt());
                map.put("assets", assetRepository.findAll().stream().filter(a -> m.getId().equals(a.getModelId())).count());
                return map;
            }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Map<String, Object> createModel(Map<String, Object> data) {
        AssetModel model = new AssetModel();
        model.setName((String) data.get("name"));
        model.setModelNumber((String) data.get("modelNo"));
        model.setCategoryId(data.containsKey("categoryId") ? ((Number) data.get("categoryId")).longValue() : null);
        AssetModel saved = assetModelRepository.save(model);
        Map<String, Object> result = new HashMap<>();
        result.put("id", saved.getId());
        result.put("name", saved.getName());
        return result;
    }

    @Override
    @Transactional
    public Map<String, Object> updateModel(Long id, Map<String, Object> data) {
        AssetModel model = assetModelRepository.findById(id).orElseThrow(() -> new RuntimeException("Model not found"));
        if (data.containsKey("name")) model.setName((String) data.get("name"));
        if (data.containsKey("modelNo")) model.setModelNumber((String) data.get("modelNo"));
        AssetModel saved = assetModelRepository.save(model);
        Map<String, Object> result = new HashMap<>();
        result.put("id", saved.getId());
        result.put("name", saved.getName());
        return result;
    }

    @Override
    @Transactional
    public void deleteModel(Long id) {
        assetModelRepository.deleteById(id);
    }

    @Override
    public List<Map<String, Object>> getAllStatusLabels() {
        return statusLabelRepository.findAll().stream()
            .map(s -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", s.getId());
                map.put("name", s.getName());
                map.put("statusType", s.getStatusType());
                map.put("assets", assetRepository.findAll().stream().filter(a -> s.getId().equals(a.getStatusId())).count());
                return map;
            }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Map<String, Object> createStatusLabel(Map<String, Object> data) {
        StatusLabel statusLabel = new StatusLabel();
        statusLabel.setName((String) data.get("name"));
        statusLabel.setStatusType((String) data.getOrDefault("statusType", "deployable"));
        StatusLabel saved = statusLabelRepository.save(statusLabel);
        Map<String, Object> result = new HashMap<>();
        result.put("id", saved.getId());
        result.put("name", saved.getName());
        return result;
    }

    @Override
    @Transactional
    public Map<String, Object> updateStatusLabel(Long id, Map<String, Object> data) {
        StatusLabel statusLabel = statusLabelRepository.findById(id).orElseThrow(() -> new RuntimeException("StatusLabel not found"));
        if (data.containsKey("name")) statusLabel.setName((String) data.get("name"));
        if (data.containsKey("statusType")) statusLabel.setStatusType((String) data.get("statusType"));
        StatusLabel saved = statusLabelRepository.save(statusLabel);
        Map<String, Object> result = new HashMap<>();
        result.put("id", saved.getId());
        result.put("name", saved.getName());
        return result;
    }

    @Override
    @Transactional
    public void deleteStatusLabel(Long id) {
        statusLabelRepository.deleteById(id);
    }

    @Override
    public List<Map<String, Object>> getAllDepreciations() {
        return depreciationRepository.findAll().stream()
            .map(d -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", d.getId());
                map.put("name", d.getName());
                map.put("term", d.getMonths() + " months");
                map.put("floorValue", d.getDepreciationMin());
                map.put("assets", assetModelRepository.findAll().stream().filter(m -> d.getId().equals(m.getDepreciationId())).mapToLong(m -> assetRepository.findAll().stream().filter(a -> m.getId().equals(a.getModelId())).count()).sum());
                map.put("assetModels", assetModelRepository.findAll().stream().filter(m -> d.getId().equals(m.getDepreciationId())).count());
                return map;
            }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Map<String, Object> createDepreciation(Map<String, Object> data) {
        Depreciation depreciation = new Depreciation();
        depreciation.setName((String) data.get("name"));
        depreciation.setMonths(((Number) data.get("months")).intValue());
        depreciation.setDepreciationMin(new BigDecimal(data.getOrDefault("floorValue", 0).toString()));
        Depreciation saved = depreciationRepository.save(depreciation);
        Map<String, Object> result = new HashMap<>();
        result.put("id", saved.getId());
        result.put("name", saved.getName());
        return result;
    }

    @Override
    @Transactional
    public Map<String, Object> updateDepreciation(Long id, Map<String, Object> data) {
        Depreciation depreciation = depreciationRepository.findById(id).orElseThrow(() -> new RuntimeException("Depreciation not found"));
        if (data.containsKey("name")) depreciation.setName((String) data.get("name"));
        if (data.containsKey("months")) depreciation.setMonths(((Number) data.get("months")).intValue());
        if (data.containsKey("floorValue")) depreciation.setDepreciationMin(new BigDecimal(data.get("floorValue").toString()));
        Depreciation saved = depreciationRepository.save(depreciation);
        Map<String, Object> result = new HashMap<>();
        result.put("id", saved.getId());
        result.put("name", saved.getName());
        return result;
    }

    @Override
    @Transactional
    public void deleteDepreciation(Long id) {
        depreciationRepository.deleteById(id);
    }

    @Override
    public List<Map<String, Object>> getAllCompanies() {
        return companyRepository.findAll().stream()
            .map(c -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", c.getId());
                map.put("name", c.getName());
                map.put("assets", assetRepository.findAll().stream().filter(a -> c.getId().equals(a.getCompanyId())).count());
                return map;
            }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Map<String, Object> createCompany(Map<String, Object> data) {
        Company company = new Company();
        company.setName((String) data.get("name"));
        company.setEmail((String) data.get("email"));
        Company saved = companyRepository.save(company);
        Map<String, Object> result = new HashMap<>();
        result.put("id", saved.getId());
        result.put("name", saved.getName());
        return result;
    }

    @Override
    @Transactional
    public Map<String, Object> updateCompany(Long id, Map<String, Object> data) {
        Company company = companyRepository.findById(id).orElseThrow(() -> new RuntimeException("Company not found"));
        if (data.containsKey("name")) company.setName((String) data.get("name"));
        if (data.containsKey("email")) company.setEmail((String) data.get("email"));
        Company saved = companyRepository.save(company);
        Map<String, Object> result = new HashMap<>();
        result.put("id", saved.getId());
        result.put("name", saved.getName());
        return result;
    }

    @Override
    @Transactional
    public void deleteCompany(Long id) {
        companyRepository.deleteById(id);
    }

    @Override
    public List<Map<String, Object>> getAllDepartments() {
        return departmentRepository.findAll().stream()
            .map(d -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", d.getId());
                map.put("name", d.getName());
                map.put("manager", d.getManagerId());
                map.put("location", d.getLocationId());
                return map;
            }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Map<String, Object> createDepartment(Map<String, Object> data) {
        Department department = new Department();
        department.setName((String) data.get("name"));
        Department saved = departmentRepository.save(department);
        Map<String, Object> result = new HashMap<>();
        result.put("id", saved.getId());
        result.put("name", saved.getName());
        return result;
    }

    @Override
    @Transactional
    public Map<String, Object> updateDepartment(Long id, Map<String, Object> data) {
        Department department = departmentRepository.findById(id).orElseThrow(() -> new RuntimeException("Department not found"));
        if (data.containsKey("name")) department.setName((String) data.get("name"));
        Department saved = departmentRepository.save(department);
        Map<String, Object> result = new HashMap<>();
        result.put("id", saved.getId());
        result.put("name", saved.getName());
        return result;
    }

    @Override
    @Transactional
    public void deleteDepartment(Long id) {
        departmentRepository.deleteById(id);
    }

    @Override
    public List<Map<String, Object>> getDepreciationReport() {
        List<Asset> assets = assetRepository.findAll();
        List<Map<String, Object>> report = new ArrayList<>();
        
        for (Asset asset : assets) {
            if (asset.getPurchaseDate() == null || asset.getPurchaseCost() == null || asset.getModelId() == null) {
                continue;
            }
            
            AssetModel model = assetModelRepository.findById(asset.getModelId()).orElse(null);
            if (model == null || model.getDepreciationId() == null) {
                continue;
            }
            
            Depreciation depreciation = depreciationRepository.findById(model.getDepreciationId()).orElse(null);
            if (depreciation == null) {
                continue;
            }
            
            // Calculate depreciation using straight-line method
            long monthsPassed = ChronoUnit.MONTHS.between(asset.getPurchaseDate(), LocalDate.now());
            int totalMonths = depreciation.getMonths();
            BigDecimal purchaseCost = asset.getPurchaseCost();
            BigDecimal floorValue = depreciation.getDepreciationMin();
            
            BigDecimal depreciableAmount = purchaseCost.subtract(floorValue);
            BigDecimal monthlyDepreciation = depreciableAmount.divide(BigDecimal.valueOf(totalMonths), 2, RoundingMode.HALF_UP);
            
            BigDecimal totalDepreciation = monthlyDepreciation.multiply(BigDecimal.valueOf(Math.min(monthsPassed, totalMonths)));
            BigDecimal currentValue = purchaseCost.subtract(totalDepreciation).max(floorValue);
            
            Map<String, Object> record = new HashMap<>();
            record.put("id", asset.getId());
            record.put("assetTag", asset.getAssetTag());
            record.put("model", model.getName());
            record.put("modelNo", model.getModelNumber());
            record.put("serial", asset.getSerial());
            record.put("depreciation", depreciation.getName());
            record.put("numberOfMonths", totalMonths);
            record.put("purchaseDate", asset.getPurchaseDate().toString());
            record.put("purchaseCost", purchaseCost);
            record.put("currentValue", currentValue);
            record.put("monthlyDepreciation", monthlyDepreciation);
            record.put("diff", totalDepreciation);
            
            report.add(record);
        }
        
        return report;
    }

    @Override
    public List<Map<String, Object>> getMaintenanceReport() {
        return new ArrayList<>();
    }

    @Override
    @Transactional
    public Map<String, Object> createAssetAudit(Map<String, Object> auditData) {
        AssetAudit audit = new AssetAudit();
        audit.setAssetId(((Number) auditData.get("assetId")).longValue());
        audit.setAuditedBy(auditData.containsKey("auditedBy") ? ((Number) auditData.get("auditedBy")).longValue() : null);
        audit.setLocationId(auditData.containsKey("locationId") ? ((Number) auditData.get("locationId")).longValue() : null);
        audit.setUpdateAssetLocation((Boolean) auditData.getOrDefault("updateAssetLocation", false));
        audit.setNextAuditDate(auditData.containsKey("nextAuditDate") ? LocalDate.parse(auditData.get("nextAuditDate").toString()) : null);
        audit.setNotes((String) auditData.get("notes"));
        audit.setStatus((String) auditData.getOrDefault("status", "draft"));
        audit.setImages(auditData.containsKey("images") ? auditData.get("images").toString() : null);
        
        AssetAudit saved = assetAuditRepository.save(audit);
        
        // Update asset if requested
        if (Boolean.TRUE.equals(audit.getUpdateAssetLocation()) && audit.getLocationId() != null) {
            assetRepository.findById(audit.getAssetId()).ifPresent(asset -> {
                asset.setLocationId(audit.getLocationId());
                assetRepository.save(asset);
            });
        }
        
        // Update last audit date on asset
        assetRepository.findById(audit.getAssetId()).ifPresent(asset -> {
            asset.setLastAuditDate(saved.getAuditDate());
            if (saved.getNextAuditDate() != null) {
                asset.setNextAuditDate(saved.getNextAuditDate());
            }
            assetRepository.save(asset);
        });
        
        String userName = getUserName(audit.getAuditedBy());
        assetRepository.findById(audit.getAssetId()).ifPresent(asset -> {
            logAudit(audit.getAuditedBy(), "Asset Audit Created by " + userName, "AssetAudit", saved.getId(), 
                    String.format("%s created audit record for asset '%s' (%s)", userName, asset.getName(), asset.getAssetTag()));
        });
        return convertAuditToMap(saved);
    }

    @Override
    @Transactional
    public Map<String, Object> updateAssetAudit(Long id, Map<String, Object> auditData) {
        AssetAudit audit = assetAuditRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Asset audit not found"));
        
        // Check if audit can be edited (only draft status or admin)
        if (!"draft".equals(audit.getStatus())) {
            throw new RuntimeException("Cannot edit audit with status: " + audit.getStatus());
        }
        
        if (auditData.containsKey("locationId")) {
            audit.setLocationId(((Number) auditData.get("locationId")).longValue());
        }
        if (auditData.containsKey("updateAssetLocation")) {
            audit.setUpdateAssetLocation((Boolean) auditData.get("updateAssetLocation"));
        }
        if (auditData.containsKey("nextAuditDate")) {
            audit.setNextAuditDate(LocalDate.parse(auditData.get("nextAuditDate").toString()));
        }
        if (auditData.containsKey("notes")) {
            audit.setNotes((String) auditData.get("notes"));
        }
        if (auditData.containsKey("status")) {
            audit.setStatus((String) auditData.get("status"));
        }
        if (auditData.containsKey("images")) {
            audit.setImages(auditData.get("images").toString());
        }
        
        AssetAudit updated = assetAuditRepository.save(audit);
        
        // Update asset if requested
        if (Boolean.TRUE.equals(updated.getUpdateAssetLocation()) && updated.getLocationId() != null) {
            assetRepository.findById(updated.getAssetId()).ifPresent(asset -> {
                asset.setLocationId(updated.getLocationId());
                assetRepository.save(asset);
            });
        }
        
        String userName = getUserName(audit.getAuditedBy());
        assetRepository.findById(audit.getAssetId()).ifPresent(asset -> {
            logAudit(audit.getAuditedBy(), "Asset Audit Updated by " + userName, "AssetAudit", id, 
                    String.format("%s updated audit record for asset '%s' (%s)", userName, asset.getName(), asset.getAssetTag()));
        });
        return convertAuditToMap(updated);
    }

    @Override
    public List<Map<String, Object>> getAllAssetAudits() {
        return assetAuditRepository.findAll().stream()
            .map(this::convertAuditToMap)
            .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> getAssetAuditById(Long id) {
        AssetAudit audit = assetAuditRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Asset audit not found"));
        return convertAuditToMap(audit);
    }

    private Map<String, Object> convertAuditToMap(AssetAudit audit) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", audit.getId());
        map.put("assetId", audit.getAssetId());
        map.put("auditedBy", audit.getAuditedBy());
        map.put("auditDate", audit.getAuditDate());
        map.put("locationId", audit.getLocationId());
        map.put("updateAssetLocation", audit.getUpdateAssetLocation());
        map.put("nextAuditDate", audit.getNextAuditDate());
        map.put("notes", audit.getNotes());
        map.put("status", audit.getStatus());
        map.put("images", audit.getImages());
        map.put("createdAt", audit.getCreatedAt());
        map.put("updatedAt", audit.getUpdatedAt());
        
        // Add asset details
        assetRepository.findById(audit.getAssetId()).ifPresent(asset -> {
            map.put("assetTag", asset.getAssetTag());
            map.put("assetName", asset.getName());
            if (asset.getModelId() != null) {
                assetModelRepository.findById(asset.getModelId()).ifPresent(model -> {
                    map.put("modelName", model.getName());
                });
            }
        });
        
        // Add location name
        if (audit.getLocationId() != null) {
            locationRepository.findById(audit.getLocationId()).ifPresent(location -> {
                map.put("locationName", location.getName());
            });
        }
        
        return map;
    }

    private AssetDTO convertToDTO(Asset asset) {
        AssetDTO dto = new AssetDTO();
        dto.setId(asset.getId());
        dto.setAssetTag(asset.getAssetTag());
        dto.setName(asset.getName());
        dto.setSerial(asset.getSerial());
        dto.setModelId(asset.getModelId());
        dto.setStatusId(asset.getStatusId());
        dto.setPurchaseDate(asset.getPurchaseDate());
        dto.setPurchaseCost(asset.getPurchaseCost());
        dto.setEolDate(asset.getEolDate());
        dto.setNotes(asset.getNotes());
        dto.setExpectedCheckin(asset.getExpectedCheckin());
        dto.setNextAuditDate(asset.getNextAuditDate());
        dto.setImage(asset.getImage());
        dto.setOrderNumber(asset.getOrderNumber());
        dto.setWarrantyMonths(asset.getWarrantyMonths());
        dto.setCompanyId(asset.getCompanyId());
        dto.setLocationId(asset.getLocationId());
        dto.setRtdLocationId(asset.getRtdLocationId());
        dto.setSupplierId(asset.getSupplierId());
        dto.setAssignedTo(asset.getAssignedTo());
        dto.setAssignedType(asset.getAssignedType());
        
        // Populate related entity names
        if (asset.getStatusId() != null) {
            statusLabelRepository.findById(asset.getStatusId())
                .ifPresent(status -> dto.setStatusName(status.getName()));
        }
        
        if (asset.getModelId() != null) {
            assetModelRepository.findById(asset.getModelId()).ifPresent(model -> {
                dto.setModelName(model.getName());
                dto.setModelNumber(model.getModelNumber());
                if (model.getCategoryId() != null) {
                    categoryRepository.findById(model.getCategoryId())
                        .ifPresent(category -> dto.setCategoryName(category.getName()));
                }
                if (model.getManufacturerId() != null) {
                    manufacturerRepository.findById(model.getManufacturerId())
                        .ifPresent(manufacturer -> dto.setManufacturerName(manufacturer.getName()));
                }
                
                // Calculate current value with depreciation
                if (asset.getPurchaseDate() != null && asset.getPurchaseCost() != null && model.getDepreciationId() != null) {
                    depreciationRepository.findById(model.getDepreciationId()).ifPresent(depreciation -> {
                        long monthsPassed = ChronoUnit.MONTHS.between(asset.getPurchaseDate(), LocalDate.now());
                        int totalMonths = depreciation.getMonths();
                        BigDecimal purchaseCost = asset.getPurchaseCost();
                        BigDecimal floorValue = depreciation.getDepreciationMin();
                        
                        BigDecimal depreciableAmount = purchaseCost.subtract(floorValue);
                        BigDecimal monthlyDepreciation = depreciableAmount.divide(BigDecimal.valueOf(totalMonths), 2, RoundingMode.HALF_UP);
                        BigDecimal totalDepreciation = monthlyDepreciation.multiply(BigDecimal.valueOf(Math.min(monthsPassed, totalMonths)));
                        BigDecimal currentValue = purchaseCost.subtract(totalDepreciation).max(floorValue);
                        
                        dto.setCurrentValue(currentValue);
                    });
                } else if (asset.getPurchaseCost() != null) {
                    // If no depreciation, current value equals purchase cost
                    dto.setCurrentValue(asset.getPurchaseCost());
                }
            });
        }
        
        if (asset.getCompanyId() != null) {
            companyRepository.findById(asset.getCompanyId())
                .ifPresent(company -> dto.setCompanyName(company.getName()));
        }
        
        if (asset.getLocationId() != null) {
            locationRepository.findById(asset.getLocationId())
                .ifPresent(location -> dto.setLocationName(location.getName()));
        }
        
        if (asset.getRtdLocationId() != null) {
            locationRepository.findById(asset.getRtdLocationId())
                .ifPresent(location -> dto.setRtdLocationName(location.getName()));
        }
        
        if (asset.getSupplierId() != null) {
            supplierRepository.findById(asset.getSupplierId())
                .ifPresent(supplier -> dto.setSupplierName(supplier.getName()));
        }
        
        // Populate assigned user name
        if (asset.getAssignedTo() != null && "user".equalsIgnoreCase(asset.getAssignedType())) {
            userRepository.findById(asset.getAssignedTo()).ifPresent(user -> {
                String fullName = (user.getFirstName() != null ? user.getFirstName() : "") + 
                                  " " + 
                                  (user.getLastName() != null ? user.getLastName() : "");
                dto.setAssignedToName(fullName.trim());
            });
        }
        
        return dto;
    }

    private String getUserName(Long userId) {
        if (userId == null) return "System";
        return userRepository.findById(userId)
                .map(user -> {
                    String firstName = user.getFirstName() != null ? user.getFirstName() : "";
                    String lastName = user.getLastName() != null ? user.getLastName() : "";
                    String fullName = (firstName + " " + lastName).trim();
                    return fullName.isEmpty() ? "User #" + userId : fullName;
                })
                .orElse("User #" + userId);
    }
    
    private String getAssigneeName(Long assignedTo, String assignedType) {
        if (assignedTo == null) return "Unknown";
        if ("user".equalsIgnoreCase(assignedType)) {
            return getUserName(assignedTo);
        } else if ("location".equalsIgnoreCase(assignedType)) {
            return locationRepository.findById(assignedTo)
                    .map(loc -> loc.getName() + " (Location)")
                    .orElse("Location #" + assignedTo);
        } else if ("asset".equalsIgnoreCase(assignedType)) {
            return assetRepository.findById(assignedTo)
                    .map(a -> a.getName() + " (Asset)")
                    .orElse("Asset #" + assignedTo);
        }
        return assignedType + " #" + assignedTo;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    private void logAudit(Long userId, String action, String itemType, Long itemId, String details) {
        try {
            AuditLog log = new AuditLog();
            log.setUserId(userId);
            log.setAction(action);
            log.setEntityType(itemType);
            log.setEntityId(itemId != null ? itemId.toString() : null);
            log.setDetails(details);
            log.setTimestamp(LocalDateTime.now());
            log.setServiceName("java-backend");
            log.setResult("success");
            log.setPerformedBy(userId != null ? userId.toString() : "system");
            auditLogRepository.save(log);
        } catch (Exception e) {
            // Silently fail - audits should never break operations
        }
    }
}
