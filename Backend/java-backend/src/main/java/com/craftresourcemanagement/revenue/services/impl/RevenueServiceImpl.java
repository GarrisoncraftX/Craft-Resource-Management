package com.craftresourcemanagement.revenue.services.impl;

import com.craftresourcemanagement.revenue.entities.TaxAssessment;
import com.craftresourcemanagement.revenue.entities.RevenueCollection;
import com.craftresourcemanagement.revenue.repositories.TaxAssessmentRepository;
import com.craftresourcemanagement.revenue.repositories.RevenueCollectionRepository;
import com.craftresourcemanagement.revenue.services.RevenueService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RevenueServiceImpl implements RevenueService {

    private final TaxAssessmentRepository taxAssessmentRepository;
    private final RevenueCollectionRepository revenueCollectionRepository;

    public RevenueServiceImpl(TaxAssessmentRepository taxAssessmentRepository,
                              RevenueCollectionRepository revenueCollectionRepository) {
        this.taxAssessmentRepository = taxAssessmentRepository;
        this.revenueCollectionRepository = revenueCollectionRepository;
    }

    // TaxAssessment
    @Override
    public TaxAssessment createTaxAssessment(TaxAssessment taxAssessment) {
        return taxAssessmentRepository.save(taxAssessment);
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
            return taxAssessmentRepository.save(toUpdate);
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
        return revenueCollectionRepository.save(revenueCollection);
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
}
