package com.craftresourcemanagement.revenue.controllers;

import com.craftresourcemanagement.revenue.entities.TaxAssessment;
import com.craftresourcemanagement.revenue.entities.RevenueCollection;
import com.craftresourcemanagement.revenue.entities.BusinessPermit;
import com.craftresourcemanagement.revenue.services.RevenueService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/revenue")
public class RevenueController {

    private final RevenueService revenueService;

    public RevenueController(RevenueService revenueService) {
        this.revenueService = revenueService;
    }

    // TaxAssessment endpoints
    @PostMapping("/tax-assessments")
    public ResponseEntity<TaxAssessment> createTaxAssessment(@RequestBody TaxAssessment taxAssessment) {
        return ResponseEntity.ok(revenueService.createTaxAssessment(taxAssessment));
    }

    @GetMapping("/tax-assessments")
    public ResponseEntity<List<TaxAssessment>> getAllTaxAssessments() {
        return ResponseEntity.ok(revenueService.getAllTaxAssessments());
    }

    @GetMapping("/tax-assessments/{id}")
    public ResponseEntity<TaxAssessment> getTaxAssessmentById(@PathVariable Long id) {
        TaxAssessment taxAssessment = revenueService.getTaxAssessmentById(id);
        if (taxAssessment == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(taxAssessment);
    }

    @PutMapping("/tax-assessments/{id}")
    public ResponseEntity<TaxAssessment> updateTaxAssessment(@PathVariable Long id, @RequestBody TaxAssessment taxAssessment) {
        TaxAssessment updated = revenueService.updateTaxAssessment(id, taxAssessment);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/tax-assessments/{id}")
    public ResponseEntity<Void> deleteTaxAssessment(@PathVariable Long id) {
        revenueService.deleteTaxAssessment(id);
        return ResponseEntity.noContent().build();
    }

    // RevenueCollection endpoints
    @PostMapping("/revenue-collections")
    public ResponseEntity<RevenueCollection> createRevenueCollection(@RequestBody RevenueCollection revenueCollection) {
        return ResponseEntity.ok(revenueService.createRevenueCollection(revenueCollection));
    }

    @GetMapping("/revenue-collections")
    public ResponseEntity<List<RevenueCollection>> getAllRevenueCollections() {
        return ResponseEntity.ok(revenueService.getAllRevenueCollections());
    }

    @GetMapping("/revenue-collections/{id}")
    public ResponseEntity<RevenueCollection> getRevenueCollectionById(@PathVariable Long id) {
        RevenueCollection revenueCollection = revenueService.getRevenueCollectionById(id);
        if (revenueCollection == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(revenueCollection);
    }

    @PutMapping("/revenue-collections/{id}")
    public ResponseEntity<RevenueCollection> updateRevenueCollection(@PathVariable Long id, @RequestBody RevenueCollection revenueCollection) {
        RevenueCollection updated = revenueService.updateRevenueCollection(id, revenueCollection);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/revenue-collections/{id}")
    public ResponseEntity<Void> deleteRevenueCollection(@PathVariable Long id) {
        revenueService.deleteRevenueCollection(id);
        return ResponseEntity.noContent().build();
    }

    // BusinessPermit endpoints
    @PostMapping("/business-permits")
    public ResponseEntity<BusinessPermit> createBusinessPermit(@RequestBody BusinessPermit businessPermit) {
        return ResponseEntity.ok(revenueService.createBusinessPermit(businessPermit));
    }

    @GetMapping("/business-permits")
    public ResponseEntity<List<BusinessPermit>> getAllBusinessPermits() {
        return ResponseEntity.ok(revenueService.getAllBusinessPermits());
    }

    @GetMapping("/business-permits/{id}")
    public ResponseEntity<BusinessPermit> getBusinessPermitById(@PathVariable Long id) {
        BusinessPermit businessPermit = revenueService.getBusinessPermitById(id);
        if (businessPermit == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(businessPermit);
    }

    @PutMapping("/business-permits/{id}")
    public ResponseEntity<BusinessPermit> updateBusinessPermit(@PathVariable Long id, @RequestBody BusinessPermit businessPermit) {
        BusinessPermit updated = revenueService.updateBusinessPermit(id, businessPermit);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/business-permits/{id}")
    public ResponseEntity<Void> deleteBusinessPermit(@PathVariable Long id) {
        revenueService.deleteBusinessPermit(id);
        return ResponseEntity.noContent().build();
    }
}
