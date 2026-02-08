package com.craftresourcemanagement.hr.unit;

import com.craftresourcemanagement.hr.HRTestConfig;
import com.craftresourcemanagement.hr.controllers.DashboardController;
import com.craftresourcemanagement.hr.services.DashboardService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = DashboardController.class, 
    excludeAutoConfiguration = {SecurityAutoConfiguration.class,
        org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration.class,
        org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration.class},
    properties = {"spring.main.allow-bean-definition-overriding=true"})
@Import(HRTestConfig.class)
class DashboardControllerUnitTest {

    @Autowired private MockMvc mockMvc;
    @MockBean private DashboardService dashboardService;

    @Test
    void getDashboardKpis_Success() throws Exception {
        Map<String, Object> kpis = new HashMap<>();
        kpis.put("totalEmployees", 100);
        kpis.put("activeEmployees", 95);

        when(dashboardService.getDashboardKpis(1L)).thenReturn(kpis);

        mockMvc.perform(get("/hr/dashboard-kpis/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalEmployees").value(100));
    }
}
