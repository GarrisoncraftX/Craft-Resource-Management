package com.craftresourcemanagement.hr.services.impl;

import com.craftresourcemanagement.hr.entities.User;
import com.craftresourcemanagement.hr.repositories.UserRepository;
import com.craftresourcemanagement.hr.services.EmployeeService;
import com.craftresourcemanagement.utils.AuditClient;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.ParameterMode;
import jakarta.persistence.StoredProcedureQuery;
import java.util.List;
import java.util.Optional;

@Service
public class EmployeeServiceImpl implements EmployeeService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final EntityManager entityManager;
    private final AuditClient auditClient;

    public EmployeeServiceImpl(UserRepository userRepository, EntityManager entityManager, AuditClient auditClient) {
        this.userRepository = userRepository;
        this.entityManager = entityManager;
        this.auditClient = auditClient;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    @Override
    public User registerEmployee(User user) {
        if (user.getId() == null) {
            User newUser = provisionNewEmployee(user);
            auditClient.logAction(newUser.getId(), "EMPLOYEE_PROVISIONED", 
                "Employee: " + newUser.getEmployeeId() + ", Email: " + newUser.getEmail());
            return newUser;
        } else {
            // Validate role_id exists before updating
            if (user.getRoleId() != null) {
                try {
                    String roleCheckQuery = "SELECT COUNT(*) FROM roles WHERE id = ?";
                    Long roleCount = (Long) entityManager.createNativeQuery(roleCheckQuery)
                        .setParameter(1, user.getRoleId())
                        .getSingleResult();
                    
                    if (roleCount == 0) {
                        throw new RuntimeException("Invalid role_id: " + user.getRoleId() + ". Role does not exist.");
                    }
                } catch (Exception e) {
                    throw new RuntimeException("Error validating role_id: " + e.getMessage());
                }
            }
            
            if (user.getPassword() != null && !user.getPassword().isEmpty()) {
                user.setPassword(passwordEncoder.encode(user.getPassword()));
                user.setDefaultPasswordChanged(true);
            } else {
                Optional<User> existing = userRepository.findById(user.getId());
                if (existing.isPresent()) {
                    user.setPassword(existing.get().getPassword());
                }
            }

            if (user.getAccountNumber() != null && !user.getAccountNumber().isEmpty() &&
                user.getMomoNumber() != null && !user.getMomoNumber().isEmpty()) {
                user.setProfileCompleted(true);
            }

            User updatedUser = userRepository.save(user);
            auditClient.logAction(updatedUser.getId(), "Employee Updated Their Profile Info", 
                "Employee: " + updatedUser.getEmployeeId());
            return updatedUser;
        }
    }

    /**
     * Pillar 1: Provisions a new employee using the hr_create_employee stored procedure
     */
    private User provisionNewEmployee(User user) {
        StoredProcedureQuery query = entityManager.createStoredProcedureQuery("hr_create_employee");

        // Input parameters
        query.registerStoredProcedureParameter("p_first_name", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_last_name", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_email", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_department_id", Integer.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_job_grade_id", Integer.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_role_id", Integer.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_hr_user_id", Integer.class, ParameterMode.IN);

        // Output parameters
        query.registerStoredProcedureParameter("p_employee_id", String.class, ParameterMode.OUT);
        query.registerStoredProcedureParameter("p_success", Boolean.class, ParameterMode.OUT);
        query.registerStoredProcedureParameter("p_message", String.class, ParameterMode.OUT);

        // Set input parameters
        query.setParameter("p_first_name", user.getFirstName());
        query.setParameter("p_last_name", user.getLastName());
        query.setParameter("p_email", user.getEmail());
        query.setParameter("p_department_id", user.getDepartmentId());
        query.setParameter("p_job_grade_id", user.getJobGradeId());
        query.setParameter("p_role_id", user.getRoleId());
        query.setParameter("p_hr_user_id", 1); // Assuming HR user ID is 1, should be passed from context

        // Execute the stored procedure
        query.execute();

        // Get output parameters
        Boolean success = (Boolean) query.getOutputParameterValue("p_success");
        String message = (String) query.getOutputParameterValue("p_message");
        String employeeId = (String) query.getOutputParameterValue("p_employee_id");

        if (!success) {
            throw new RuntimeException("Failed to provision employee: " + message);
        }

        // Fetch the newly created user from database
        Optional<User> createdUser = userRepository.findByEmployeeId(employeeId);
        if (createdUser.isPresent()) {
            return createdUser.get();
        } else {
            throw new RuntimeException("Employee created but not found in database");
        }
    }

    @Override
    public List<User> listAllEmployees() {
        return userRepository.findAll();
    }

    @Override
    public Optional<User> findByEmployeeId(String employeeId) {
        return userRepository.findByEmployeeId(employeeId);
    }

    @Override
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    public List<User> getProvisionedEmployees() {
        return userRepository.findByAccountStatus("PROVISIONED");
    }
}
