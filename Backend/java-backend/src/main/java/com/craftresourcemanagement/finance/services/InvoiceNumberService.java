package com.craftresourcemanagement.finance.services;

import com.craftresourcemanagement.finance.entities.InvoiceSequence;
import com.craftresourcemanagement.finance.repositories.InvoiceSequenceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@Transactional
public class InvoiceNumberService {

    private final InvoiceSequenceRepository invoiceSequenceRepository;

    public InvoiceNumberService(InvoiceSequenceRepository invoiceSequenceRepository) {
        this.invoiceSequenceRepository = invoiceSequenceRepository;
    }

    /**
     * Generates the next invoice number for Account Payable
     * Format: AP-YYYYMMDD-NNNN (e.g., AP-20240118-0001)
     */
    public String generateAccountPayableInvoiceNumber() {
        return generateInvoiceNumber("AP");
    }

    /**
     * Generates the next invoice number for Account Receivable
     * Format: AR-YYYYMMDD-NNNN (e.g., AR-20240118-0001)
     */
    public String generateAccountReceivableInvoiceNumber() {
        return generateInvoiceNumber("AR");
    }

    /**
     * Thread-safe method to generate invoice numbers
     */
    private String generateInvoiceNumber(String sequenceType) {
        // Get current date for the invoice number
        String dateString = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        
        // Get or create sequence with pessimistic lock
        InvoiceSequence sequence = invoiceSequenceRepository.findBySequenceTypeWithLock(sequenceType)
                .orElseGet(() -> createNewSequence(sequenceType));

        // Increment the sequence number
        sequence.setLastNumber(sequence.getLastNumber() + 1);
        invoiceSequenceRepository.save(sequence);

        // Format: PREFIX-YYYYMMDD-NNNN
        return String.format("%s-%s-%04d", 
                sequence.getPrefix(), 
                dateString, 
                sequence.getLastNumber());
    }

    /**
     * Creates a new sequence for the given type
     */
    private InvoiceSequence createNewSequence(String sequenceType) {
        String prefix = sequenceType.equals("AP") ? "AP" : "AR";
        InvoiceSequence newSequence = new InvoiceSequence(sequenceType, prefix);
        return invoiceSequenceRepository.save(newSequence);
    }

    /**
     * Reset sequence for a given type (useful for testing or year-end reset)
     */
    public void resetSequence(String sequenceType) {
        invoiceSequenceRepository.findBySequenceType(sequenceType)
                .ifPresent(sequence -> {
                    sequence.setLastNumber(0L);
                    invoiceSequenceRepository.save(sequence);
                });
    }

    /**
     * Get current sequence number for a given type
     */
    public Long getCurrentSequenceNumber(String sequenceType) {
        return invoiceSequenceRepository.findBySequenceType(sequenceType)
                .map(InvoiceSequence::getLastNumber)
                .orElse(0L);
    }
}
