package com.craftresourcemanagement.hr.services.impl;

import com.craftresourcemanagement.hr.entities.EmployeeTraining;
import com.craftresourcemanagement.hr.entities.PerformanceReview;
import com.craftresourcemanagement.hr.entities.User;
import com.craftresourcemanagement.hr.repositories.EmployeeTrainingRepository;
import com.craftresourcemanagement.hr.repositories.PerformanceReviewRepository;
import com.craftresourcemanagement.hr.repositories.UserRepository;
import com.craftresourcemanagement.hr.services.EmployeeService;
import com.craftresourcemanagement.utils.AuditClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import jakarta.persistence.EntityManager;
import jakarta.persistence.ParameterMode;
import jakarta.persistence.StoredProcedureQuery;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Map;


@Service
public class EmployeeServiceImpl implements EmployeeService {

    private static final Logger log = LoggerFactory.getLogger(EmployeeServiceImpl.class);
    private static final String SERVICE_NAME = "java-backend";
    
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final EntityManager entityManager;
    private final AuditClient auditClient;
    private final EmployeeTrainingRepository trainingRepository;
    private final PerformanceReviewRepository performanceReviewRepository;
    private final RestTemplate restTemplate;
    
    @Value("${nodejs.service.url:http://localhost:5001}")
    private String nodejsServiceUrl;

    public EmployeeServiceImpl(UserRepository userRepository, EntityManager entityManager, AuditClient auditClient,
                               EmployeeTrainingRepository trainingRepository, PerformanceReviewRepository performanceReviewRepository) {
        this.userRepository = userRepository;
        this.entityManager = entityManager;
        this.auditClient = auditClient;
        this.trainingRepository = trainingRepository;
        this.performanceReviewRepository = performanceReviewRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
        this.restTemplate = new RestTemplate();
    }

    @Override
    public User registerEmployee(User user) {
        if (user.getId() == null) {
            User newUser = provisionNewEmployee(user);
            auditClient.logActionAsync(
                newUser.getId(),
                "has been provisioned as a new employee",
                String.format("{\"module\":\"user_management\",\"operation\":\"CREATE\",\"employeeId\":\"%s\",\"email\":\"%s\"}",
                    newUser.getEmployeeId(), newUser.getEmail()),
                SERVICE_NAME,
                "EMPLOYEE",
                newUser.getId().toString()
            );
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
            
            // Preserve existing password if not updating
            Optional<User> existing = userRepository.findById(user.getId());
            if (existing.isPresent()) {
                String currentPasswordHash = existing.get().getPassword();
                log.info("[PASSWORD DEBUG] Current password hash in DB: {}", currentPasswordHash);
                log.info("[PASSWORD DEBUG] Incoming password field: {}", user.getPassword());
                
                // Only hash and update password if it's provided and not empty
                if (user.getPassword() != null && !user.getPassword().trim().isEmpty()) {
                    // Check if password is already hashed (bcrypt starts with $2a$ or $2b$)
                    if (user.getPassword().startsWith("$2a$") || user.getPassword().startsWith("$2b$")) {
                        log.info("[PASSWORD DEBUG] Password is already hashed, preserving it");
                        user.setPassword(currentPasswordHash);
                    } else {
                        log.info("[PASSWORD DEBUG] Hashing new password");
                        user.setPassword(passwordEncoder.encode(user.getPassword()));
                        user.setDefaultPasswordChanged(true);
                    }
                } else {
                    log.info("[PASSWORD DEBUG] No password provided, preserving existing hash");
                    user.setPassword(currentPasswordHash);
                    // Preserve defaultPasswordChanged status if not explicitly set
                    if (user.getDefaultPasswordChanged() == null) {
                        user.setDefaultPasswordChanged(existing.get().getDefaultPasswordChanged());
                    }
                }
            }

            if (user.getAccountNumber() != null && !user.getAccountNumber().isEmpty() &&
                user.getMomoNumber() != null && !user.getMomoNumber().isEmpty()) {
                user.setProfileCompleted(true);
            }

            User updatedUser = userRepository.save(user);
            auditClient.logActionAsync(
                updatedUser.getId(),
                "has updated their profile information",
                String.format("{\"module\":\"user_management\",\"operation\":\"UPDATE\",\"employeeId\":\"%s\",\"email\":\"%s\"}",
                    updatedUser.getEmployeeId(), updatedUser.getEmail()),
                SERVICE_NAME,
                "USER",
                updatedUser.getId().toString()
            );
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
    public List<User> getFilteredUsers(String filter, Integer departmentId, Integer roleId) {
        if ("all".equals(filter)) {
            return userRepository.findAll();
        } else if ("admin".equals(filter)) {
            return userRepository.findAll().stream()
                .filter(u -> u.getRoleId() != null && (u.getRoleId() == 1 || u.getRoleId() == 2 || u.getRoleId() == 3))
                .toList();
        } else if ("assets".equals(filter)) {
            return userRepository.findByDepartmentId(departmentId != null ? departmentId : 6);
        } else if ("deleted".equals(filter)) {
            return userRepository.findByIsActive(0);
        }
        return userRepository.findAll();
    }

    @Override
    public Map<String, Long> getPeopleCounts() {
        List<User> all = userRepository.findAll();
        return Map.of(
            "all", (long) all.size(),
            "admin", all.stream().filter(u -> u.getRoleId() != null && (u.getRoleId() == 1 || u.getRoleId() == 2 || u.getRoleId() == 3)).count(),
            "assets", all.stream().filter(u -> u.getDepartmentId() != null && u.getDepartmentId() == 6).count(),
            "deleted", all.stream().filter(u -> u.getIsActive() == 0).count()
        );
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

    @Override
    public User toggleUserStatus(Long id) {
        return userRepository.findById(id).map(user -> {
            // Synchronize both fields
            if (user.getIsActive() == 1) {
                user.setIsActive(0);
                user.setAccountStatus("INACTIVE");
            } else {
                user.setIsActive(1);
                user.setAccountStatus("ACTIVE");
            }
            User updated = userRepository.save(user);
            String statusAction = updated.getIsActive() == 1 ? "activated" : "deactivated";
            auditClient.logActionAsync(
                id,
                String.format("has %s user account", statusAction),
                String.format("{\"module\":\"user_management\",\"operation\":\"STATUS_TOGGLE\",\"employeeId\":\"%s\",\"newStatus\":\"%s\"}",
                    user.getEmployeeId(), statusAction),
                SERVICE_NAME,
                "USER",
                id.toString()
            );
            return updated;
        }).orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    @Override
    public List<User> getEmployeesWithBirthdayToday() {
        return userRepository.findByBirthdayToday(LocalDate.now());
    }
    
    @Override
    public List<User> getEmployeesWithAnniversaryToday() {
        return userRepository.findByAnniversaryToday(LocalDate.now());
    }
    
    @Override
    public List<User> getEmployeesWithProbationEndingOn(LocalDate date) {
        return userRepository.findByProbationEndDate(date);
    }
    
    @Override
    public List<User> getEmployeesWithContractExpiringOn(LocalDate date) {
        return userRepository.findByContractEndDate(date);
    }
    
    @Override
    public List<EmployeeTraining> getTrainingsEndingOn(LocalDate date) {
        return trainingRepository.findIncompleteTrainingsEndingOn(date);
    }
    
    @Override
    public List<User> getEmployeesWithLowLeaveBalance(int threshold) {
        try {
            String url = nodejsServiceUrl + "/api/leave/low-balance?threshold=" + threshold;
            ResponseEntity<Long[]> response = restTemplate.getForEntity(url, Long[].class);
            if (response.getBody() != null) {
                return userRepository.findAllById(List.of(response.getBody()));
            }
        } catch (Exception e) {
            log.error("Failed to fetch low leave balance employees: {}", e.getMessage());
        }
        return Collections.emptyList();
    }
    
    @Override
    public void autoSchedulePerformanceReviews() {
        LocalDate today = LocalDate.now();
        List<User> employees = userRepository.findAll();
        
        for (User emp : employees) {
            if (emp.getHireDate() != null) {
                LocalDate nextReview = emp.getHireDate().plusYears(1);
                while (nextReview.isBefore(today)) {
                    nextReview = nextReview.plusYears(1);
                }
                
                if (nextReview.getMonth() == today.getMonth() && nextReview.getYear() == today.getYear()) {
                    PerformanceReview review = new PerformanceReview();
                    review.setEmployeeId(emp.getId());
                    review.setReviewDate(nextReview);
                    review.setStatus("SCHEDULED");
                    review.setReviewerId(1L);
                    review.setRating(0.0);
                    performanceReviewRepository.save(review);
                    log.info("Scheduled performance review for employee {} on {}", emp.getEmployeeId(), nextReview);
                }
            }
        }
    }
}
