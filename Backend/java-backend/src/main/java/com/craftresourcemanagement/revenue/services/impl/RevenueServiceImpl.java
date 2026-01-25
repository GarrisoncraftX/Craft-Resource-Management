package com.craftresourcemanagement.revenue.services.impl;

import com.craftresourcemanagement.revenue.entities.TaxAssessment;
import com.craftresourcemanagement.revenue.entities.RevenueCollection;
import com.craftresourcemanagement.revenue.entities.BusinessPermit;
import com.craftresourcemanagement.revenue.repositories.TaxAssessmentRepository;
import com.craftresourcemanagement.revenue.repositories.RevenueCollectionRepository;
import com.craftresourcemanagement.revenue.repositories.BusinessPermitRepository;
import com.craftresourcemanagement.revenue.services.RevenueService;
import com.craftresourcemanagement.utils.AuditClient;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RevenueServiceImpl implements RevenueService {

    private final TaxAssessmentRepository taxAssessmentRepository;
    private final RevenueCollectionRepository revenueCollectionRepository;
    private final BusinessPermitRepository businessPermitRepository;
    private final AuditClient auditClient;

    public RevenueServiceImpl(TaxAssessmentRepository taxAssessmentRepository,
                              RevenueCollectionRepository revenueCollectionRepository,
                              BusinessPermitRepository businessPermitRepository,
                              AuditClient auditClient) {
        this.taxAssessmentRepository = taxAssessmentRepository;
        this.revenueCollectionRepository = revenueCollectionRepository;
        this.businessPermitRepository = businessPermitRepository;
        this.auditClient = auditClient;
    }

    // TaxAssessment
    @Override
    public TaxAssessment createTaxAssessment(TaxAssessment taxAssessment) {
        TaxAssessment saved = taxAssessmentRepository.save(taxAssessment);
        auditClient.logAction(null, "CREATE_TAX_ASSESSMENT", "Taxpayer: " + saved.getTaxpayerId() + ", Amount: " + saved.getAssessedAmount());
        return saved;
    }

    @Override
    public List<TaxAssessment> getAllTaxAssessments() {
        return taxAssessmentRepository.findAll();
    }

    @Override
    public TaxAssessment getTaxAssessmentById(Long id) {
        return taxAssessmentRepository.findById(id).orElse(null);
    }

    @Override
    public TaxAssessment updateTaxAssessment(Long id, TaxAssessment taxAssessment) {
        Optional<TaxAssessment> existing = taxAssessmentRepository.findById(id);
        if (existing.isPresent()) {
            TaxAssessment toUpdate = existing.get();
            toUpdate.setTaxpayerId(taxAssessment.getTaxpayerId());
            toUpdate.setAssessmentDate(taxAssessment.getAssessmentDate());
            toUpdate.setAssessedAmount(taxAssessment.getAssessedAmount());
            toUpdate.setStatus(taxAssessment.getStatus());
            TaxAssessment updated = taxAssessmentRepository.save(toUpdate);
            auditClient.logAction(null, "UPDATE_TAX_ASSESSMENT", "Taxpayer: " + updated.getTaxpayerId() + ", Status: " + updated.getStatus());
            return updated;
        }
        return null;
    }

    @Override
    public void deleteTaxAssessment(Long id) {
        taxAssessmentRepository.deleteById(id);
    }

    // RevenueCollection
    @Override
    public RevenueCollection createRevenueCollection(RevenueCollection revenueCollection) {
        RevenueCollection saved = revenueCollectionRepository.save(revenueCollection);
        auditClient.logAction(null, "CREATE_REVENUE_COLLECTION", "Payer: " + saved.getPayerId() + ", Amount: " + saved.getAmountCollected());
        return saved;
    }

    @Override
    public List<RevenueCollection> getAllRevenueCollections() {
        return revenueCollectionRepository.findAll();
    }

    @Override
    public RevenueCollection getRevenueCollectionById(Long id) {
        return revenueCollectionRepository.findById(id).orElse(null);
    }

    @Override
    public RevenueCollection updateRevenueCollection(Long id, RevenueCollection revenueCollection) {
        Optional<RevenueCollection> existing = revenueCollectionRepository.findById(id);
        if (existing.isPresent()) {
            RevenueCollection toUpdate = existing.get();
            toUpdate.setPayerId(revenueCollection.getPayerId());
            toUpdate.setCollectionDate(revenueCollection.getCollectionDate());
            toUpdate.setAmountCollected(revenueCollection.getAmountCollected());
            toUpdate.setPaymentMethod(revenueCollection.getPaymentMethod());
            return revenueCollectionRepository.save(toUpdate);
        }
        return null;
    }

    @Override
    public void deleteRevenueCollection(Long id) {
        revenueCollectionRepository.deleteById(id);
    }

    // BusinessPermit
    @Override
    public BusinessPermit createBusinessPermit(BusinessPermit businessPermit) {
        BusinessPermit saved = businessPermitRepository.save(businessPermit);
        auditClient.logAction(null, "CREATE_BUSINESS_PERMIT", "Permit: " + saved.getPermitNumber() + ", Business: " + saved.getBusinessName());
        return saved;
    }

    @Override
    public List<BusinessPermit> getAllBusinessPermits() {
        return businessPermitRepository.findAll();
    }

    @Override
    public BusinessPermit getBusinessPermitById(Long id) {
        return businessPermitRepository.findById(id).orElse(null);
    }

    @Override
    public BusinessPermit updateBusinessPermit(Long id, BusinessPermit businessPermit) {
        Optional<BusinessPermit> existing = businessPermitRepository.findById(id);
        if (existing.isPresent()) {
            BusinessPermit toUpdate = existing.get();
            toUpdate.setPermitNumber(businessPermit.getPermitNumber());
            toUpdate.setBusinessName(businessPermit.getBusinessName());
            toUpdate.setBusinessType(businessPermit.getBusinessType());
            toUpdate.setOwnerName(businessPermit.getOwnerName());
            toUpdate.setAddress(businessPermit.getAddress());
            toUpdate.setContactNumber(businessPermit.getContactNumber());
            toUpdate.setIssueDate(businessPermit.getIssueDate());
            toUpdate.setExpiryDate(businessPermit.getExpiryDate());
            toUpdate.setFee(businessPermit.getFee());
            toUpdate.setStatus(businessPermit.getStatus());
            BusinessPermit updated = businessPermitRepository.save(toUpdate);
            auditClient.logAction(null, "UPDATE_BUSINESS_PERMIT", "Permit: " + updated.getPermitNumber() + ", Status: " + updated.getStatus());
            return updated;
        }
        return null;
    }

    @Override
    public void deleteBusinessPermit(Long id) {
        businessPermitRepository.deleteById(id);
    }
}
