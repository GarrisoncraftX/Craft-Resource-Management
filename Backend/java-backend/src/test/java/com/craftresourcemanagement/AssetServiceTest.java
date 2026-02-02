package com.craftresourcemanagement;

import com.craftresourcemanagement.asset.entities.Asset;
import com.craftresourcemanagement.asset.repositories.AssetRepository;
import com.craftresourcemanagement.asset.services.impl.AssetServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AssetServiceTest {

    @Mock
    private AssetRepository assetRepository;

    @InjectMocks
    private AssetServiceImpl assetService;

    private Asset testAsset;

    @BeforeEach
    void setUp() {
        testAsset = new Asset();
        testAsset.setAssetTag("ASSET001");
        testAsset.setAssetName("Laptop");
        testAsset.setAcquisitionCost(new BigDecimal("1200.00"));
        testAsset.setStatus("active");
    }

    @Test
    void testCreateAsset_Success() {
        when(assetRepository.save(any(Asset.class))).thenReturn(testAsset);

        Asset result = assetService.createAsset(testAsset);

        assertNotNull(result);
        assertEquals("ASSET001", result.getAssetTag());
        verify(assetRepository, times(1)).save(any(Asset.class));
    }

    @Test
    void testGetAssetById_Success() {
        when(assetRepository.findById(1L)).thenReturn(Optional.of(testAsset));

        Asset result = assetService.getAssetById(1L);

        assertNotNull(result);
        assertEquals("Laptop", result.getAssetName());
    }

    @Test
    void testGetAllAssets_Success() {
        List<Asset> mockAssets = Arrays.asList(testAsset);
        when(assetRepository.findAll()).thenReturn(mockAssets);

        List<Asset> result = assetService.getAllAssets();

        assertEquals(1, result.size());
    }

    @Test
    void testUpdateAsset_Success() {
        when(assetRepository.findById(1L)).thenReturn(Optional.of(testAsset));
        when(assetRepository.save(any(Asset.class))).thenReturn(testAsset);

        Asset result = assetService.updateAsset(1L, testAsset);

        assertNotNull(result);
        verify(assetRepository, times(1)).save(any(Asset.class));
    }

    @Test
    void testDeleteAsset_Success() {
        when(assetRepository.findById(1L)).thenReturn(Optional.of(testAsset));
        doNothing().when(assetRepository).delete(any(Asset.class));

        assetService.deleteAsset(1L);

        verify(assetRepository, times(1)).delete(any(Asset.class));
    }


}
