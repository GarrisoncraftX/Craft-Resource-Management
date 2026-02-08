package com.craftresourcemanagement.hr.unit;

import com.craftresourcemanagement.hr.entities.EmployeeTraining;
import com.craftresourcemanagement.hr.entities.User;
import com.craftresourcemanagement.hr.repositories.EmployeeTrainingRepository;
import com.craftresourcemanagement.hr.repositories.PerformanceReviewRepository;
import com.craftresourcemanagement.hr.repositories.UserRepository;
import com.craftresourcemanagement.hr.services.impl.EmployeeServiceImpl;
import com.craftresourcemanagement.utils.AuditClient;
import jakarta.persistence.EntityManager;
import jakarta.persistence.StoredProcedureQuery;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceUnitTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private EntityManager entityManager;
    @Mock
    private AuditClient auditClient;
    @Mock
    private EmployeeTrainingRepository trainingRepository;
    @Mock
    private PerformanceReviewRepository performanceReviewRepository;
    @Mock
    private StoredProcedureQuery storedProcedureQuery;

    @InjectMocks
    private EmployeeServiceImpl employeeService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmployeeId("EMP001");
        testUser.setFirstName("John");
        testUser.setLastName("Doe");
        testUser.setEmail("john@test.com");
        testUser.setDepartmentId(1);
        testUser.setRoleId(5);
        testUser.setHireDate(LocalDate.now());
    }

    @Test
    void listAllEmployees_Success() {
        when(userRepository.findAll()).thenReturn(Arrays.asList(testUser));
        List<User> result = employeeService.listAllEmployees();
        assertEquals(1, result.size());
        verify(userRepository).findAll();
    }

    @Test
    void findById_Found() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        Optional<User> result = employeeService.findById(1L);
        assertTrue(result.isPresent());
        assertEquals("EMP001", result.get().getEmployeeId());
    }

    @Test
    void findById_NotFound() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());
        Optional<User> result = employeeService.findById(999L);
        assertFalse(result.isPresent());
    }

    @Test
    void findByEmployeeId_Success() {
        when(userRepository.findByEmployeeId("EMP001")).thenReturn(Optional.of(testUser));
        Optional<User> result = employeeService.findByEmployeeId("EMP001");
        assertTrue(result.isPresent());
    }

    @Test
    void getProvisionedEmployees_Success() {
        testUser.setAccountStatus("PROVISIONED");
        when(userRepository.findByAccountStatus("PROVISIONED")).thenReturn(Arrays.asList(testUser));
        List<User> result = employeeService.getProvisionedEmployees();
        assertEquals(1, result.size());
    }

    @Test
    void toggleUserStatus_Activate() {
        testUser.setIsActive(0);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        User result = employeeService.toggleUserStatus(1L);
        assertEquals(1, result.getIsActive());
    }

    @Test
    void toggleUserStatus_Deactivate() {
        testUser.setIsActive(1);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        User result = employeeService.toggleUserStatus(1L);
        assertEquals(0, result.getIsActive());
    }

    @Test
    void toggleUserStatus_NotFound() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> employeeService.toggleUserStatus(999L));
    }

    @Test
    void getEmployeesWithBirthdayToday_Success() {
        when(userRepository.findByBirthdayToday(any(LocalDate.class))).thenReturn(Arrays.asList(testUser));
        List<User> result = employeeService.getEmployeesWithBirthdayToday();
        assertEquals(1, result.size());
    }

    @Test
    void getEmployeesWithAnniversaryToday_Success() {
        when(userRepository.findByAnniversaryToday(any(LocalDate.class))).thenReturn(Arrays.asList(testUser));
        List<User> result = employeeService.getEmployeesWithAnniversaryToday();
        assertEquals(1, result.size());
    }

    @Test
    void getEmployeesWithProbationEndingOn_Success() {
        LocalDate date = LocalDate.now().plusDays(30);
        when(userRepository.findByProbationEndDate(date)).thenReturn(Arrays.asList(testUser));
        List<User> result = employeeService.getEmployeesWithProbationEndingOn(date);
        assertEquals(1, result.size());
    }

    @Test
    void getEmployeesWithContractExpiringOn_Success() {
        LocalDate date = LocalDate.now().plusDays(30);
        when(userRepository.findByContractEndDate(date)).thenReturn(Arrays.asList(testUser));
        List<User> result = employeeService.getEmployeesWithContractExpiringOn(date);
        assertEquals(1, result.size());
    }

    @Test
    void getTrainingsEndingOn_Success() {
        EmployeeTraining training = new EmployeeTraining();
        LocalDate date = LocalDate.now().plusDays(7);
        when(trainingRepository.findIncompleteTrainingsEndingOn(date)).thenReturn(Arrays.asList(training));
        List<EmployeeTraining> result = employeeService.getTrainingsEndingOn(date);
        assertEquals(1, result.size());
    }

    @Test
    void registerEmployee_Update_Success() {
        testUser.setId(1L);
        testUser.setPassword("$2a$10$hashedpassword");
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(entityManager.createNativeQuery(anyString())).thenReturn(mock(jakarta.persistence.Query.class));
        when(entityManager.createNativeQuery(anyString()).setParameter(anyInt(), any())).thenReturn(mock(jakarta.persistence.Query.class));
        when(entityManager.createNativeQuery(anyString()).setParameter(anyInt(), any()).getSingleResult()).thenReturn(1L);
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        
        User result = employeeService.registerEmployee(testUser);
        assertNotNull(result);
        verify(userRepository).save(any(User.class));
    }

    @Test
    void registerEmployee_NewEmployee_Success() {
        User newUser = new User();
        newUser.setFirstName("Jane");
        newUser.setLastName("Smith");
        newUser.setEmail("jane@test.com");
        newUser.setDepartmentId(1);
        newUser.setRoleId(5);
        
        // Mock the native query for role validation
        jakarta.persistence.Query roleQuery = mock(jakarta.persistence.Query.class);
        when(entityManager.createNativeQuery(contains("SELECT COUNT"))).thenReturn(roleQuery);
        when(roleQuery.setParameter(anyInt(), any())).thenReturn(roleQuery);
        when(roleQuery.getSingleResult()).thenReturn(1L);
        
        when(entityManager.createStoredProcedureQuery("hr_create_employee")).thenReturn(storedProcedureQuery);
        when(storedProcedureQuery.registerStoredProcedureParameter(anyString(), any(), any())).thenReturn(storedProcedureQuery);
        when(storedProcedureQuery.setParameter(anyString(), any())).thenReturn(storedProcedureQuery);
        when(storedProcedureQuery.execute()).thenReturn(true);
        when(storedProcedureQuery.getOutputParameterValue("p_success")).thenReturn(true);
        when(storedProcedureQuery.getOutputParameterValue("p_message")).thenReturn("Success");
        when(storedProcedureQuery.getOutputParameterValue("p_employee_id")).thenReturn("EMP002");
        when(storedProcedureQuery.getOutputParameterValue("p_user_id")).thenReturn(2L);
        
        newUser.setEmployeeId("EMP002");
        newUser.setId(2L);
        when(userRepository.findByEmployeeId("EMP002")).thenReturn(Optional.of(newUser));
        
        User result = employeeService.registerEmployee(newUser);
        assertNotNull(result);
    }
}
