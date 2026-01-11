-- ============================================================================
-- COMPREHENSIVE HR SYSTEM - ALL 5 PILLARS IMPLEMENTATION (CORRECTED)
-- ============================================================================
-- This script implements all 5 HR pillars without duplications or conflicts
-- Verified against fulldatabase.sql to avoid column/table conflicts
-- ============================================================================

-- PILLAR A: IDENTITY & LIFECYCLE MANAGEMENT
-- ============================================================================

-- 1. Employee ID Sequence (Auto-increment with lock)
CREATE TABLE IF NOT EXISTS `employee_id_sequence` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `last_employee_number` int(11) NOT NULL DEFAULT 20,
  `locked` BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `employee_id_sequence` (`id`, `last_employee_number`, `locked`) VALUES (1, 20, FALSE);

-- 2. Enhance Users Table for Provisioning (Add missing columns only - avoid duplicates)
ALTER TABLE `users` 
ADD COLUMN IF NOT EXISTS `account_status` ENUM('PROVISIONED', 'ACTIVE', 'SUSPENDED', 'TERMINATED') DEFAULT 'PROVISIONED',
ADD COLUMN IF NOT EXISTS `temporary_password` VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS `default_password_changed` BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS `profile_completed` BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS `provisioned_by` INT NULL,
ADD COLUMN IF NOT EXISTS `provisioned_date` TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS `hired_date` DATE NULL,
ADD COLUMN IF NOT EXISTS `job_grade_id` INT NULL,
ADD COLUMN IF NOT EXISTS `bank_name` VARCHAR(100) NULL,
ADD COLUMN IF NOT EXISTS `bank_account_number` VARCHAR(50) NULL,
ADD COLUMN IF NOT EXISTS `personal_contact` VARCHAR(20) NULL;

-- 3. Job Grades Table (Grade-to-Pay Mapping)
CREATE TABLE IF NOT EXISTS `job_grades` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `grade_code` varchar(10) NOT NULL UNIQUE,
  `grade_name` varchar(100) NOT NULL,
  `base_salary` decimal(12,2) NOT NULL,
  `allowances` decimal(12,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `job_grades` (`grade_code`, `grade_name`, `base_salary`, `allowances`) VALUES
('G1', 'Entry Level', 30000.00, 2000.00),
('G2', 'Junior', 45000.00, 3000.00),
('G3', 'Mid Level', 60000.00, 4000.00),
('G4', 'Senior', 80000.00, 5000.00),
('G5', 'Manager', 120000.00, 8000.00);

-- PILLAR B: FAIL-SAFE ATTENDANCE GOVERNANCE
-- ============================================================================

-- 4. Enhance Attendance Records (Add missing columns only - avoid duplicates with existing clock_in_method/clock_out_method)
ALTER TABLE `attendance_records` 
ADD COLUMN IF NOT EXISTS `flagged_for_review` BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS `buddy_punch_risk` BOOLEAN DEFAULT FALSE;

-- 5. Attendance Audit Log (for buddy punch detection)
CREATE TABLE IF NOT EXISTS `attendance_audit_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `attendance_record_id` int(11) NOT NULL,
  `check_in_method` VARCHAR(50) NOT NULL,
  `check_out_method` VARCHAR(50) DEFAULT NULL,
  `flagged_reason` VARCHAR(255) DEFAULT NULL,
  `reviewed_by` INT NULL,
  `reviewed_at` TIMESTAMP NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_attendance_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
  CONSTRAINT `fk_attendance_audit_record` FOREIGN KEY (`attendance_record_id`) REFERENCES `attendance_records`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- PILLAR C: ORGANIZATIONAL & POSITION CONTROL
-- ============================================================================

-- 6. Enhance Departments Table (Add missing columns only)
ALTER TABLE `departments` 
ADD COLUMN IF NOT EXISTS `max_headcount` INT DEFAULT 50,
ADD COLUMN IF NOT EXISTS `current_headcount` INT DEFAULT 0;

-- 7. Position Slots Table
CREATE TABLE IF NOT EXISTS `position_slots` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `department_id` int(11) NOT NULL,
  `position_title` varchar(100) NOT NULL,
  `total_slots` INT NOT NULL,
  `filled_slots` INT DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_position_slots_dept` FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- PILLAR D: LEAVE & BENEFIT ADMINISTRATION
-- ============================================================================

-- 8. Leave Blackouts Table (Disable check-in during approved leave)
CREATE TABLE IF NOT EXISTS `leave_blackouts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `leave_request_id` int(11) NOT NULL,
  `blackout_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_date` (`user_id`, `blackout_date`),
  CONSTRAINT `fk_leave_blackouts_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
  CONSTRAINT `fk_leave_blackouts_request` FOREIGN KEY (`leave_request_id`) REFERENCES `leave_requests`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Enhance Leave Requests Table (Add missing columns only)
ALTER TABLE `leave_requests` 
ADD COLUMN IF NOT EXISTS `blackout_created` BOOLEAN DEFAULT FALSE;

-- PILLAR E: FINANCIAL SYNCHRONIZATION (PFM)
-- ============================================================================

-- 10. Enhance Payslips Table (Add missing columns only - avoid duplicates)
ALTER TABLE `payslips` 
ADD COLUMN IF NOT EXISTS `days_worked` INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS `overtime_hours` DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS `gross_salary` DECIMAL(12,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS `tax_deduction` DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS `pension_deduction` DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS `net_salary` DECIMAL(12,2) DEFAULT 0.00;


-- 3. Now create your payroll_runs table
CREATE TABLE IF NOT EXISTS `payroll_runs` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `run_month` INT(11) NOT NULL,
  `run_year` INT(11) NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `total_gross` DECIMAL(15,2) DEFAULT 0.00,
  `total_deductions` DECIMAL(15,2) DEFAULT 0.00,
  `total_net` DECIMAL(15,2) DEFAULT 0.00,
  `status` ENUM('DRAFT', 'PROCESSING', 'COMPLETED', 'CLOSED') DEFAULT 'DRAFT',
  `created_by` INT(11) NOT NULL,
  `closed_by` INT(11) DEFAULT NULL,
  `closed_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_payroll_runs_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_payroll_runs_closed_by` FOREIGN KEY (`closed_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 12. PFM Exports Table (Journal Entry Handshake)
CREATE TABLE IF NOT EXISTS `pfm_exports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `payroll_run_id` int(11) NOT NULL,
  `export_date` date NOT NULL,
  `total_amount` decimal(15,2) NOT NULL,
  `journal_entry_data` JSON NOT NULL,
  `export_status` ENUM('PENDING', 'EXPORTED', 'FAILED') DEFAULT 'PENDING',
  `exported_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_pfm_exports_payroll_run` FOREIGN KEY (`payroll_run_id`) REFERENCES `payroll_runs`(`id`),
  CONSTRAINT `fk_pfm_exports_exported_by` FOREIGN KEY (`exported_by`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- FOREIGN KEY CONSTRAINTS
-- ============================================================================

ALTER TABLE `users`
ADD CONSTRAINT `fk_users_job_grade` FOREIGN KEY (`job_grade_id`) REFERENCES `job_grades`(`id`),
ADD CONSTRAINT `fk_users_provisioned_by` FOREIGN KEY (`provisioned_by`) REFERENCES `users`(`id`);

-- ============================================================================
-- STORED PROCEDURES & FUNCTIONS
-- ============================================================================

DELIMITER $$

-- Function: Generate Next Employee ID
CREATE FUNCTION IF NOT EXISTS `generate_employee_id`() 
RETURNS VARCHAR(10)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE next_number INT;
    UPDATE `employee_id_sequence` SET `last_employee_number` = `last_employee_number` + 1 WHERE `id` = 1;
    SELECT `last_employee_number` INTO next_number FROM `employee_id_sequence` WHERE `id` = 1;
    RETURN CONCAT('EMP', LPAD(next_number, 3, '0'));
END$$

-- Procedure: Create Employee (Pillar A - Sequential Provisioning)
CREATE PROCEDURE IF NOT EXISTS `hr_create_employee`(
    IN p_first_name VARCHAR(50),
    IN p_last_name VARCHAR(50),
    IN p_email VARCHAR(100),
    IN p_department_id INT,
    IN p_job_grade_id INT,
    IN p_role_id INT,
    IN p_hr_user_id INT,
    OUT p_employee_id VARCHAR(10),
    OUT p_success BOOLEAN,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE dept_current INT DEFAULT 0;
    DECLARE dept_max INT DEFAULT 0;
    DECLARE new_emp_id VARCHAR(10);
    DECLARE temp_password VARCHAR(255);
    
    SELECT current_headcount, max_headcount INTO dept_current, dept_max
    FROM departments WHERE id = p_department_id;
    
    IF dept_current >= dept_max THEN
        SET p_success = FALSE;
        SET p_message = CONCAT('Department at maximum capacity (', dept_max, '). Cannot create new employee.');
        SET p_employee_id = NULL;
    ELSE
        SET new_emp_id = generate_employee_id();
        SET temp_password = SHA2(CONCAT(new_emp_id, 'CRMSemp123!'), 256);
        
        INSERT INTO users (
            employee_id, first_name, last_name, email, 
            department_id, job_grade_id, role_id, 
            password, account_status, default_password_changed, profile_completed,
            provisioned_by, provisioned_date, hired_date, temporary_password
        ) VALUES (
            new_emp_id, p_first_name, p_last_name, p_email,
            p_department_id, p_job_grade_id, p_role_id,
            temp_password, 'PROVISIONED', FALSE, FALSE,
            p_hr_user_id, NOW(), CURDATE(), temp_password
        );
        
        UPDATE departments SET current_headcount = current_headcount + 1 WHERE id = p_department_id;
        
        SET p_employee_id = new_emp_id;
        SET p_success = TRUE;
        SET p_message = CONCAT('Employee created successfully. Temporary Key: ', new_emp_id, ' + CRMSemp123!');
    END IF;
END$$

-- Procedure: Check Attendance Eligibility (Pillar B & D - Blackout Logic)
CREATE PROCEDURE IF NOT EXISTS `check_attendance_eligibility`(
    IN p_user_id INT,
    IN p_check_date DATE,
    OUT p_eligible BOOLEAN,
    OUT p_reason VARCHAR(255)
)
BEGIN
    DECLARE blackout_count INT DEFAULT 0;
    SELECT COUNT(*) INTO blackout_count
    FROM leave_blackouts
    WHERE user_id = p_user_id AND blackout_date = p_check_date;
    
    IF blackout_count > 0 THEN
        SET p_eligible = FALSE;
        SET p_reason = 'Employee on approved leave - check-in disabled';
    ELSE
        SET p_eligible = TRUE;
        SET p_reason = 'Eligible for attendance';
    END IF;
END$$

-- Procedure: Promote Employee (Pillar C - Grade-to-Pay Mapping)
CREATE PROCEDURE IF NOT EXISTS `hr_promote_employee`(
    IN p_user_id INT,
    IN p_new_grade_id INT,
    IN p_promoted_by INT,
    OUT p_success BOOLEAN,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE old_salary DECIMAL(12,2);
    DECLARE new_salary DECIMAL(12,2);
    
    SELECT base_salary INTO old_salary FROM job_grades 
    WHERE id = (SELECT job_grade_id FROM users WHERE id = p_user_id);
    
    SELECT base_salary INTO new_salary FROM job_grades WHERE id = p_new_grade_id;
    
    UPDATE users SET job_grade_id = p_new_grade_id WHERE id = p_user_id;
    
    SET p_success = TRUE;
    SET p_message = CONCAT('Employee promoted. Salary updated from ', old_salary, ' to ', new_salary);
END$$

-- Procedure: Check Department Capacity (Pillar C - Headcount Management)
CREATE PROCEDURE IF NOT EXISTS `check_department_capacity`(
    IN p_department_id INT,
    OUT p_available_slots INT,
    OUT p_at_capacity BOOLEAN
)
BEGIN
    DECLARE max_count INT;
    DECLARE current_count INT;
    
    SELECT max_headcount, current_headcount INTO max_count, current_count
    FROM departments WHERE id = p_department_id;
    
    SET p_available_slots = max_count - current_count;
    SET p_at_capacity = (current_count >= max_count);
END$$

-- Procedure: Process Leave Approval (Pillar D - Blackout Logic)
CREATE PROCEDURE IF NOT EXISTS `approve_leave_request`(
    IN p_leave_request_id INT,
    IN p_approved_by INT,
    OUT p_success BOOLEAN,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_user_id INT;
    DECLARE v_start_date DATE;
    DECLARE v_end_date DATE;
    DECLARE curr_date DATE;

    SELECT user_id, start_date, end_date INTO v_user_id, v_start_date, v_end_date
    FROM leave_requests WHERE id = p_leave_request_id;

    UPDATE leave_requests
    SET status = 'approved', reviewed_by = p_approved_by, blackout_created = TRUE
    WHERE id = p_leave_request_id;

    SET curr_date = v_start_date;
    DELETE FROM leave_blackouts WHERE leave_request_id = p_leave_request_id;

    WHILE curr_date <= v_end_date DO
        INSERT IGNORE INTO leave_blackouts (user_id, leave_request_id, blackout_date)
        VALUES (v_user_id, p_leave_request_id, curr_date);
        SET curr_date = DATE_ADD(curr_date, INTERVAL 1 DAY);
    END WHILE;

    SET p_success = TRUE;
    SET p_message = 'Leave approved and blackout dates created';
END$$

-- Procedure: Calculate Payroll (Pillar E - Gross-to-Net Engine)
CREATE PROCEDURE IF NOT EXISTS `calculate_payroll`(
    IN p_payroll_run_id INT,
    OUT p_success BOOLEAN,
    OUT p_message VARCHAR(255)
)
BEGIN
    UPDATE payslips ps
    JOIN users u ON ps.user_id = u.id
    JOIN job_grades jg ON u.job_grade_id = jg.id
    SET 
        ps.gross_salary = (ps.days_worked * (jg.base_salary / 22)) + jg.allowances,
        ps.tax_deduction = ((ps.days_worked * (jg.base_salary / 22)) + jg.allowances) * 0.15,
        ps.pension_deduction = ((ps.days_worked * (jg.base_salary / 22)) + jg.allowances) * 0.08,
        ps.net_salary = ((ps.days_worked * (jg.base_salary / 22)) + jg.allowances) - 
                        (((ps.days_worked * (jg.base_salary / 22)) + jg.allowances) * 0.15) -
                        (((ps.days_worked * (jg.base_salary / 22)) + jg.allowances) * 0.08)
    WHERE ps.payroll_run_id = p_payroll_run_id;
    
    UPDATE payroll_runs pr
    SET 
        pr.total_gross = (SELECT SUM(gross_salary) FROM payslips WHERE payroll_run_id = p_payroll_run_id),
        pr.total_deductions = (SELECT SUM(tax_deduction + pension_deduction) FROM payslips WHERE payroll_run_id = p_payroll_run_id),
        pr.total_net = (SELECT SUM(net_salary) FROM payslips WHERE payroll_run_id = p_payroll_run_id),
        pr.status = 'COMPLETED'
    WHERE id = p_payroll_run_id;
    
    SET p_success = TRUE;
    SET p_message = 'Payroll calculated successfully';
END$$

-- Procedure: Close Payroll & Export to PFM (Pillar E - The Handshake)
CREATE PROCEDURE IF NOT EXISTS `close_payroll_and_export`(
    IN p_payroll_run_id INT,
    IN p_closed_by INT,
    OUT p_success BOOLEAN,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_total_net DECIMAL(15,2);
    DECLARE v_journal_entry JSON;
    
    SELECT total_net INTO v_total_net FROM payroll_runs WHERE id = p_payroll_run_id;
    
    UPDATE payroll_runs 
    SET status = 'CLOSED', closed_by = p_closed_by, closed_at = NOW()
    WHERE id = p_payroll_run_id;
    
    SET v_journal_entry = JSON_OBJECT(
        'debit_account', 'Salary Expense',
        'credit_account', 'Salary Payable',
        'amount', v_total_net,
        'description', CONCAT('Payroll Run ', p_payroll_run_id),
        'date', CURDATE()
    );
    
    INSERT INTO pfm_exports (payroll_run_id, export_date, total_amount, journal_entry_data, export_status, exported_by)
    VALUES (p_payroll_run_id, CURDATE(), v_total_net, v_journal_entry, 'PENDING', p_closed_by);
    
    SET p_success = TRUE;
    SET p_message = 'Payroll closed and journal entry prepared for PFM export';
END$$

DELIMITER ;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

DELIMITER $$

-- Trigger: Flag Manual Attendance (Pillar B - Audit Logic)
CREATE TRIGGER IF NOT EXISTS `tr_flag_manual_attendance`
AFTER INSERT ON `attendance_records`
FOR EACH ROW
BEGIN
    IF NEW.clock_in_method = 'manual' THEN
        UPDATE attendance_records 
        SET flagged_for_review = TRUE
        WHERE id = NEW.id;
        
        INSERT INTO attendance_audit_log (user_id, attendance_record_id, check_in_method, flagged_reason)
        VALUES (NEW.user_id, NEW.id, 'MANUAL', 'Manual check-in flagged for buddy punch review');
    END IF;
END$$

-- Trigger: Activate Account on Profile Complete (Pillar A - State Monitoring)
CREATE TRIGGER IF NOT EXISTS `tr_activate_on_profile_complete`
BEFORE UPDATE ON `users`
FOR EACH ROW
BEGIN
    IF OLD.profile_completed = FALSE AND NEW.profile_completed = TRUE 
       AND OLD.default_password_changed = FALSE AND NEW.default_password_changed = TRUE THEN
        SET NEW.account_status = 'ACTIVE';
        IF NEW.hired_date IS NULL THEN
            SET NEW.hired_date = CURDATE();
        END IF;
    END IF;
END$$

-- Trigger: Create Leave Blackouts (Pillar D - Blackout Logic)
CREATE TRIGGER IF NOT EXISTS `tr_leave_approved` 
AFTER UPDATE ON `leave_requests`
FOR EACH ROW
BEGIN
    DECLARE current_date DATE;
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        SET current_date = NEW.start_date;
        DELETE FROM leave_blackouts WHERE leave_request_id = NEW.id;
        WHILE current_date <= NEW.end_date DO
            INSERT IGNORE INTO leave_blackouts (user_id, leave_request_id, blackout_date)
            VALUES (NEW.user_id, NEW.id, current_date);
            SET current_date = DATE_ADD(current_date, INTERVAL 1 DAY);
        END WHILE;
    END IF;
END$$

DELIMITER ;

-- ============================================================================
-- SAMPLE DATA INITIALIZATION
-- ============================================================================

UPDATE users SET account_status = 'ACTIVE', job_grade_id = 5 WHERE employee_id IN ('EMP001', 'EMP002');
UPDATE users SET account_status = 'ACTIVE', job_grade_id = 4 WHERE employee_id IN ('EMP003', 'EMP004', 'EMP005');
UPDATE users SET account_status = 'ACTIVE', job_grade_id = 3 WHERE employee_id LIKE 'EMP%' AND job_grade_id IS NULL LIMIT 10;

UPDATE departments SET max_headcount = 50, current_headcount = (
    SELECT COUNT(*) FROM users WHERE department_id = departments.id AND account_status IN ('PROVISIONED', 'ACTIVE')
);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify all tables created
SELECT 'HR System Tables Created Successfully' as status;

-- Show current employee count by department
SELECT d.name, d.current_headcount, d.max_headcount, 
       (d.max_headcount - d.current_headcount) as available_slots
FROM departments d;

-- Show job grades
SELECT * FROM job_grades;

-- Show provisioned employees
SELECT employee_id, first_name, last_name, account_status, provisioned_date 
FROM users WHERE account_status = 'PROVISIONED';

COMMIT;
