package com.craftresourcemanagement.revenue.services;

import com.craftresourcemanagement.revenue.entities.TaxAssessment;
import com.craftresourcemanagement.revenue.entities.RevenueCollection;
import com.craftresourcemanagement.revenue.entities.BusinessPermit;

import java.util.List;

public interface RevenueService {

    // TaxAssessment
    TaxAssessment createTaxAssessment(TaxAssessment taxAssessment);
    List<TaxAssessment> getAllTaxAssessments();
    TaxAssessment getTaxAssessmentById(Long id);
    TaxAssessment updateTaxAssessment(Long id, TaxAssessment taxAssessment);
    void deleteTaxAssessment(Long id);

    // RevenueCollection
    RevenueCollection createRevenueCollection(RevenueCollection revenueCollection);
    List<RevenueCollection> getAllRevenueCollections();
    RevenueCollection getRevenueCollectionById(Long id);
    RevenueCollection updateRevenueCollection(Long id, RevenueCollection revenueCollection);
    void deleteRevenueCollection(Long id);

    // BusinessPermit
    BusinessPermit createBusinessPermit(BusinessPermit businessPermit);
    List<BusinessPermit> getAllBusinessPermits();
    BusinessPermit getBusinessPermitById(Long id);
    BusinessPermit updateBusinessPermit(Long id, BusinessPermit businessPermit);
    void deleteBusinessPermit(Long id);
}
