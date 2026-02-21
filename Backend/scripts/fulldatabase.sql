-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 20, 2026 at 07:09 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `craft_resource_management`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`garrisonsayor`@`localhost` PROCEDURE `archive_old_audit_logs` (IN `days_to_keep` INT)   BEGIN
    DECLARE archive_date DATETIME;
    SET archive_date = DATE_SUB(NOW(), INTERVAL days_to_keep DAY);
    
    -- Insert old logs into archive
    INSERT INTO audit_logs_archive 
    SELECT *, NOW() as archived_at 
    FROM audit_logs 
    WHERE timestamp < archive_date;
    
    -- Delete archived logs from main table
    DELETE FROM audit_logs 
    WHERE timestamp < archive_date;
    
    SELECT CONCAT('Archived logs older than ', days_to_keep, ' days') as message;
END$$

CREATE DEFINER=`garrisonsayor`@`localhost` PROCEDURE `check_attendance_eligibility` (IN `p_user_id` INT, IN `p_check_date` DATE, OUT `p_eligible` BOOLEAN, OUT `p_reason` VARCHAR(255))   BEGIN
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

CREATE DEFINER=`garrisonsayor`@`localhost` PROCEDURE `check_department_capacity` (IN `p_department_id` INT, OUT `p_available_slots` INT, OUT `p_at_capacity` BOOLEAN)   BEGIN
    DECLARE max_count INT;
    DECLARE current_count INT;
    
    SELECT max_headcount, current_headcount INTO max_count, current_count
    FROM departments WHERE id = p_department_id;
    
    SET p_available_slots = max_count - current_count;
    SET p_at_capacity = (current_count >= max_count);
END$$

CREATE DEFINER=`garrisonsayor`@`localhost` PROCEDURE `hr_create_employee` (IN `p_first_name` VARCHAR(50), IN `p_last_name` VARCHAR(50), IN `p_email` VARCHAR(100), IN `p_dob` DATE, IN `p_department_id` INT, IN `p_job_grade_id` INT, IN `p_role_id` INT, IN `p_hr_user_id` INT, OUT `p_employee_id` VARCHAR(20), OUT `p_success` BOOLEAN, OUT `p_message` VARCHAR(255))   BEGIN
    DECLARE dept_current INT DEFAULT 0;
    DECLARE dept_max INT DEFAULT 0;
    DECLARE new_emp_id VARCHAR(20);
    DECLARE temp_password VARCHAR(255);
    DECLARE email_exists INT DEFAULT 0;
    
    SELECT COUNT(*) INTO email_exists FROM users WHERE email = p_email;
    
    IF email_exists > 0 THEN
        SET p_success = FALSE;
        SET p_message = 'Email already exists. Please use a different email address.';
        SET p_employee_id = NULL;
    ELSE
        SELECT current_headcount, max_headcount INTO dept_current, dept_max
        FROM departments WHERE id = p_department_id;
        
        IF dept_current >= dept_max THEN
            SET p_success = FALSE;
            SET p_message = CONCAT('Department at maximum capacity (', dept_max, '). Cannot create new employee.');
            SET p_employee_id = NULL;
        ELSE
            SET new_emp_id = generate_employee_id(p_dob, CURDATE(), p_department_id);
            SET temp_password = '$2b$10$o/Y0kcYZqyZdhujd8S4uOuwftIaEfRNEdwKOCFDhSUT4bAGwpNDz2';
            
            INSERT INTO users (
                employee_id, first_name, last_name, email, date_of_birth,
                department_id, job_grade_id, role_id, 
                password, account_status, default_password_changed, profile_completed,
                provisioned_by, provisioned_date, temporary_password, hire_date, is_active
            ) VALUES (
                new_emp_id, p_first_name, p_last_name, p_email, p_dob,
                p_department_id, p_job_grade_id, p_role_id,
                temp_password, 'PROVISIONED', FALSE, FALSE,
                p_hr_user_id, NOW(), temp_password, CURDATE(), 1
            );
            
            UPDATE departments SET current_headcount = current_headcount + 1 WHERE id = p_department_id;
            
            SET p_employee_id = new_emp_id;
            SET p_success = TRUE;
            SET p_message = CONCAT('Employee created successfully. Employee ID: ', new_emp_id, '. Default password: UNILAK2026!');
        END IF;
    END IF;
END$$

CREATE DEFINER=`garrisonsayor`@`localhost` PROCEDURE `hr_promote_employee` (IN `p_user_id` INT, IN `p_new_grade_id` INT, IN `p_promoted_by` INT, OUT `p_success` BOOLEAN, OUT `p_message` VARCHAR(255))   BEGIN
    DECLARE old_salary DECIMAL(12,2);
    DECLARE new_salary DECIMAL(12,2);
    
    SELECT base_salary INTO old_salary FROM job_grades 
    WHERE id = (SELECT job_grade_id FROM users WHERE id = p_user_id);
    
    SELECT base_salary INTO new_salary FROM job_grades WHERE id = p_new_grade_id;
    
    UPDATE users SET job_grade_id = p_new_grade_id WHERE id = p_user_id;
    
    SET p_success = TRUE;
    SET p_message = CONCAT('Employee promoted. Salary updated from ', old_salary, ' to ', new_salary);
END$$

CREATE DEFINER=`garrisonsayor`@`localhost` PROCEDURE `sp_archive_audit_logs` (IN `days_old` INT)   BEGIN

  DECLARE archived_count INT DEFAULT 0;

  

  START TRANSACTION;

  

  INSERT INTO audit_logs_archive (

    id, user_id, action, timestamp, details, service_name,

    ip_address, request_id, session_id, entity_type, entity_id, result

  )

  SELECT 

    id, user_id, action, timestamp, details, service_name,

    ip_address, request_id, session_id, entity_type, entity_id, result

  FROM audit_logs

  WHERE timestamp < DATE_SUB(NOW(), INTERVAL days_old DAY);

  

  SET archived_count = ROW_COUNT();

  

  DELETE FROM audit_logs

  WHERE timestamp < DATE_SUB(NOW(), INTERVAL days_old DAY);

  

  INSERT INTO audit_logs (user_id, action, timestamp, details, service_name, result)

  VALUES (

    NULL,

    'MANUAL_ARCHIVE_AUDIT_LOGS',

    NOW(),

    JSON_OBJECT('archived_count', archived_count, 'days_old', days_old),

    'system',

    'success'

  );

  

  COMMIT;

  

  SELECT CONCAT('Archived ', archived_count, ' audit logs older than ', days_old, ' days') AS result;

END$$

--
-- Functions
--
CREATE DEFINER=`garrisonsayor`@`localhost` FUNCTION `generate_employee_id` (`p_dob` DATE, `p_hire_date` DATE, `p_dept_id` INT) RETURNS VARCHAR(20) CHARSET utf8mb4 COLLATE utf8mb4_general_ci DETERMINISTIC BEGIN
    RETURN CONCAT('CRMS', YEAR(p_dob), YEAR(p_hire_date), '00', p_dept_id);
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `access_rules`
--

CREATE TABLE `access_rules` (
  `id` bigint(20) NOT NULL,
  `door` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL,
  `schedule` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `account_payables`
--

CREATE TABLE `account_payables` (
  `id` bigint(20) NOT NULL,
  `amount` decimal(38,2) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `due_date` date NOT NULL,
  `vendor_name` varchar(255) NOT NULL,
  `ap_account_code` varchar(50) DEFAULT NULL COMMENT 'Links to Accounts Payable account in Chart of Accounts (Liability)',
  `category` varchar(255) DEFAULT NULL,
  `expense_account_code` varchar(50) DEFAULT NULL COMMENT 'Links to Expense account in Chart of Accounts',
  `invoice_number` varchar(50) DEFAULT NULL,
  `issue_date` date NOT NULL,
  `journal_entry_id` int(11) DEFAULT NULL COMMENT 'References the journal entry created when invoice is approved',
  `payment_terms` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `created_at` date DEFAULT NULL,
  `created_by` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `account_payables`
--

INSERT INTO `account_payables` (`id`, `amount`, `description`, `due_date`, `vendor_name`, `ap_account_code`, `category`, `expense_account_code`, `invoice_number`, `issue_date`, `journal_entry_id`, `payment_terms`, `status`, `created_at`, `created_by`) VALUES
(1, 45000.00, 'Handling gas', '2026-01-31', 'Francis Nyafor', '5802', 'Utilities', '5400', 'AP-20260120-0005', '2026-01-20', NULL, 'Due on Receipt', 'Paid', '2026-01-20', NULL),
(2, 25000.00, '3D banners', '2026-01-24', 'Loraine Nyafor', '2100', 'Marketing', '5600', 'AP-20260120-0006', '2026-01-20', NULL, 'Due on Receipt', 'Paid', '2026-01-20', NULL),
(3, 300.00, 'Tutoring for Discrete Maths', '2026-02-20', 'Omascar Kollie', '2200', 'Professional Services', '5800', 'AP-20260120-0007', '2026-01-20', NULL, 'Net 30', 'Approved', '2026-01-20', NULL),
(1, 45000.00, 'Handling gas', '2026-01-31', 'Francis Nyafor', '5802', 'Utilities', '5400', 'AP-20260120-0005', '2026-01-20', NULL, 'Due on Receipt', 'Paid', '2026-01-20', NULL),
(2, 25000.00, '3D banners', '2026-01-24', 'Loraine Nyafor', '2100', 'Marketing', '5600', 'AP-20260120-0006', '2026-01-20', NULL, 'Due on Receipt', 'Paid', '2026-01-20', NULL),
(3, 300.00, 'Tutoring for Discrete Maths', '2026-02-20', 'Omascar Kollie', '2200', 'Professional Services', '5800', 'AP-20260120-0007', '2026-01-20', NULL, 'Net 30', 'Approved', '2026-01-20', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `account_receivables`
--

CREATE TABLE `account_receivables` (
  `id` bigint(20) NOT NULL,
  `amount` decimal(38,2) NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `due_date` date NOT NULL,
  `amount_paid` decimal(38,2) NOT NULL,
  `ar_account_code` varchar(50) DEFAULT NULL COMMENT 'Links to Accounts Receivable account in Chart of Accounts (Asset)',
  `balance` decimal(38,2) NOT NULL,
  `customer_id` bigint(20) DEFAULT NULL,
  `invoice_number` varchar(50) DEFAULT NULL,
  `issue_date` date NOT NULL,
  `journal_entry_id` int(11) DEFAULT NULL COMMENT 'References the journal entry created when invoice is sent',
  `payment_terms` varchar(255) DEFAULT NULL,
  `revenue_account_code` varchar(50) DEFAULT NULL COMMENT 'Links to Revenue account in Chart of Accounts',
  `status` varchar(255) NOT NULL,
  `created_by` bigint(20) DEFAULT NULL,
  `created_at` date DEFAULT curdate()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `account_receivables`
--

INSERT INTO `account_receivables` (`id`, `amount`, `customer_name`, `description`, `due_date`, `amount_paid`, `ar_account_code`, `balance`, `customer_id`, `invoice_number`, `issue_date`, `journal_entry_id`, `payment_terms`, `revenue_account_code`, `status`, `created_by`, `created_at`) VALUES
(1, 50000.00, 'Loraine Nyafor', 'Logistics', '2026-01-24', 0.00, '1530', 50000.00, NULL, 'AR-20260120-0001', '2026-01-20', NULL, 'Net 30', '4100', 'Sent', NULL, '2026-01-20'),
(1, 50000.00, 'Loraine Nyafor', 'Logistics', '2026-01-24', 0.00, '1530', 50000.00, NULL, 'AR-20260120-0001', '2026-01-20', NULL, 'Net 30', '4100', 'Sent', NULL, '2026-01-20');

-- --------------------------------------------------------

--
-- Table structure for table `active_sessions`
--

CREATE TABLE `active_sessions` (
  `session_id` varchar(255) NOT NULL,
  `last_activity` datetime(6) DEFAULT NULL,
  `service` varchar(255) DEFAULT NULL,
  `start_time` datetime(6) DEFAULT NULL,
  `user_id` varchar(255) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `assets`
--

CREATE TABLE `assets` (
  `id` bigint(20) NOT NULL,
  `asset_tag` varchar(100) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `serial` varchar(255) DEFAULT NULL,
  `model_id` bigint(20) NOT NULL,
  `status_id` bigint(20) NOT NULL,
  `company_id` bigint(20) DEFAULT NULL,
  `location_id` bigint(20) DEFAULT NULL,
  `rtd_location_id` bigint(20) DEFAULT NULL COMMENT 'Default location',
  `supplier_id` bigint(20) DEFAULT NULL,
  `order_number` varchar(100) DEFAULT NULL,
  `purchase_date` date DEFAULT NULL,
  `purchase_cost` decimal(13,4) DEFAULT NULL,
  `warranty_months` int(11) DEFAULT NULL,
  `eol_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `assigned_to` bigint(20) DEFAULT NULL COMMENT 'User ID',
  `assigned_type` varchar(100) DEFAULT NULL COMMENT 'User, Location, Asset',
  `requestable` tinyint(1) DEFAULT 0,
  `last_checkout` timestamp NULL DEFAULT NULL,
  `expected_checkin` date DEFAULT NULL,
  `last_audit_date` timestamp NULL DEFAULT NULL,
  `next_audit_date` date DEFAULT NULL,
  `byod` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `assets`
--

INSERT INTO `assets` (`id`, `asset_tag`, `name`, `serial`, `model_id`, `status_id`, `company_id`, `location_id`, `rtd_location_id`, `supplier_id`, `order_number`, `purchase_date`, `purchase_cost`, `warranty_months`, `eol_date`, `notes`, `image`, `assigned_to`, `assigned_type`, `requestable`, `last_checkout`, `expected_checkin`, `last_audit_date`, `next_audit_date`, `byod`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'AST001', 'Dell Laptop OptiPlex 7090', 'SN123456', 1, 2, NULL, 2, 2, NULL, NULL, '2023-06-15', 1200.0000, NULL, NULL, 'IT Equipment', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, '2026-02-19 22:49:14', '2026-02-19 22:49:14', NULL),
(2, 'AST002', 'Conference Room Table', 'TBL-001', 2, 2, NULL, 4, 4, NULL, NULL, '2022-03-20', 800.0000, NULL, NULL, 'Furniture', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, '2026-02-19 22:49:14', '2026-02-19 22:49:14', NULL),
(3, 'AST003', 'Industrial Printer HP LaserJet', 'PRN-789', 5, 5, NULL, 2, 2, NULL, NULL, '2023-01-10', 1500.0000, NULL, NULL, 'Office Equipment', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, '2026-02-19 22:49:14', '2026-02-19 22:49:14', NULL),
(4, 'AST004', 'Server Rack Dell PowerEdge', 'SRV-456', 6, 2, NULL, 2, 2, NULL, NULL, '2023-08-20', 5000.0000, NULL, NULL, 'IT Infrastructure', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, '2026-02-19 22:49:14', '2026-02-19 22:49:14', NULL),
(5, 'AST005', 'Vehicle - Toyota Camry', 'VIN-XYZ123', 7, 2, NULL, 6, 6, NULL, NULL, '2022-11-10', 25000.0000, NULL, NULL, 'Transportation', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, '2026-02-19 22:49:14', '2026-02-19 22:49:14', NULL),
(6, '888255196', 'iPhone-mobile-7046-80cd-c1fe1b84d816', 'a0c7f7f84-2d84-8d67-6ecb9c3fbd16', 3, 2, NULL, 2, 2, NULL, NULL, '2023-05-10', 999.0000, NULL, NULL, '6GB RAM', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, '2026-02-19 22:49:14', '2026-02-19 22:49:14', NULL),
(7, '1654990322', 'iPhone-mobile-d5efd89b-34ca-8ec3-4888809901c74', 'cfe93abdf-0777-34ca-8ec3-4888809015c74', 3, 2, NULL, 1, 1, NULL, NULL, '2023-03-15', 899.0000, NULL, NULL, '4GB RAM', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, '2026-02-19 22:49:14', '2026-02-19 22:49:14', NULL),
(8, '1011481556', 'iPhone-mobile-dbc819dd-1498-360c-b27c-171be0236689', 'dbc819dd-1498-360c-b27c-1b6b26d0236689', 3, 2, NULL, 1, 1, NULL, NULL, '2023-04-20', 999.0000, NULL, NULL, '6GB RAM', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, '2026-02-19 22:49:14', '2026-02-19 22:49:14', NULL),
(9, 'MAC001', 'Macbook Air', 'MBA-SN-001', 4, 2, NULL, 2, 2, NULL, NULL, '2023-07-01', 1299.0000, NULL, NULL, 'Developer laptop', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, '2026-02-19 22:49:14', '2026-02-19 22:49:14', NULL),
(10, 'MAC002', 'Macbook Air', 'MBA-SN-002', 4, 2, NULL, 2, 2, NULL, NULL, '2023-07-01', 1299.0000, NULL, NULL, 'Designer laptop', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, '2026-02-19 22:49:14', '2026-02-19 22:49:14', NULL),
(11, 'UNILAK-KGL-LAP-0001', 'Staff Laptop – ICT', 'DL-5440-0001', 8, 1, 1, 13, 13, 1, 'PO-UNILAK-ICT-001', '2025-10-15', 1250000.0000, 12, '2028-10-15', 'Stored at Kigali ICT Store', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, '2026-02-20 17:48:14', '2026-02-20 17:48:14', NULL),
(12, 'UNILAK-KGL-LAP-0002', 'Staff Laptop – HR', 'TP-E14-0002', 10, 2, 1, 13, 13, 1, 'PO-UNILAK-HR-002', '2025-10-20', 1180000.0000, 12, '2028-10-20', 'Deployed to HR staff', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, '2026-02-20 17:48:14', '2026-02-20 17:48:14', NULL),
(13, 'UNILAK-KGL-DES-0001', 'Desktop – Reception', 'HP-400G9-0101', 9, 2, 1, 12, 12, 1, 'PO-UNILAK-ADM-003', '2025-11-01', 980000.0000, 12, '2028-11-01', 'Reception desktop', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, '2026-02-20 17:48:14', '2026-02-20 17:48:14', NULL),
(14, 'UNILAK-KGL-DSP-0001', 'Display – Finance', 'DS-U2415-0201', 13, 1, 1, 14, 14, 2, 'PO-UNILAK-FIN-004', '2025-11-18', 320000.0000, 12, '2026-11-18', 'Finance office display', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, '2026-02-20 17:48:14', '2026-02-20 17:48:14', NULL),
(15, 'UNILAK-KGL-MOB-0001', 'Mobile – Security Supervisor', 'IP12-0301', 11, 2, 1, 13, 13, 1, 'PO-UNILAK-SEC-005', '2025-12-02', 650000.0000, 12, '2027-12-02', 'Issued for security operations', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, '2026-02-20 17:48:14', '2026-02-20 17:48:14', NULL),
(16, 'UNILAK-KGL-TAB-0001', 'Tablet – Reception', 'SFGO-0401', 12, 3, 1, 12, 12, 1, 'PO-UNILAK-REC-006', '2025-12-10', 520000.0000, 12, '2027-12-10', 'Pending setup for visitor registration', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, '2026-02-20 17:48:14', '2026-02-20 17:48:14', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `asset_disposals`
--

CREATE TABLE `asset_disposals` (
  `id` bigint(20) NOT NULL,
  `asset_id` bigint(20) NOT NULL,
  `disposal_date` date NOT NULL,
  `disposal_method` enum('sale','donation','recycling','trash','auction') NOT NULL,
  `disposal_reason` text DEFAULT NULL,
  `proceeds` decimal(13,4) DEFAULT NULL,
  `approved_by` bigint(20) DEFAULT NULL,
  `disposed_by` bigint(20) DEFAULT NULL,
  `status` enum('pending','approved','completed','cancelled') DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `asset_maintenances`
--

CREATE TABLE `asset_maintenances` (
  `id` bigint(20) NOT NULL,
  `asset_id` bigint(20) NOT NULL,
  `supplier_id` bigint(20) DEFAULT NULL,
  `maintenance_type` enum('maintenance','repair','upgrade','inspection','calibration') NOT NULL,
  `title` varchar(255) NOT NULL,
  `start_date` date NOT NULL,
  `completion_date` date DEFAULT NULL,
  `asset_maintenance_time` int(11) DEFAULT NULL COMMENT 'Days',
  `cost` decimal(13,4) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `asset_models`
--

CREATE TABLE `asset_models` (
  `id` bigint(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `model_number` varchar(100) DEFAULT NULL,
  `category_id` bigint(20) NOT NULL,
  `manufacturer_id` bigint(20) DEFAULT NULL,
  `depreciation_id` bigint(20) DEFAULT NULL,
  `eol` int(11) DEFAULT NULL,
  `min_amt` int(11) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `requestable` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `asset_models`
--

INSERT INTO `asset_models` (`id`, `name`, `model_number`, `category_id`, `manufacturer_id`, `depreciation_id`, `eol`, `min_amt`, `image`, `notes`, `requestable`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'OptiPlex 7090', 'OPT7090', 2, 1, 1, NULL, NULL, NULL, NULL, 0, '2026-02-19 22:49:14', '2026-02-19 22:49:14', NULL),
(2, 'Ultrasharp U2415', 'U2415', 5, 1, 2, NULL, NULL, NULL, NULL, 0, '2026-02-19 22:49:14', '2026-02-19 22:49:14', NULL),
(3, 'iPhone 12', 'A2172', 3, 2, 1, NULL, NULL, NULL, NULL, 0, '2026-02-19 22:49:14', '2026-02-19 22:49:14', NULL),
(4, 'Macbook Air', '5575783075815347', 1, 2, 1, NULL, NULL, NULL, NULL, 0, '2026-02-19 22:49:14', '2026-02-19 22:49:14', NULL),
(5, 'HP LaserJet', 'LJ-PRO', 2, 3, 1, NULL, NULL, NULL, NULL, 0, '2026-02-19 22:49:14', '2026-02-19 22:49:14', NULL),
(6, 'PowerEdge Server', 'PE-R740', 2, 1, 1, NULL, NULL, NULL, NULL, 0, '2026-02-19 22:49:14', '2026-02-19 22:49:14', NULL),
(7, 'Toyota Camry', 'CAMRY-2024', 1, 6, 3, NULL, NULL, NULL, NULL, 0, '2026-02-19 22:49:14', '2026-02-19 22:49:14', NULL),
(8, 'Dell Latitude 5440', '5440', 1, 1, 1, 36, 1, NULL, 'UNILAK staff laptop', 0, '2026-02-20 17:48:14', '2026-02-20 17:48:14', NULL),
(9, 'HP ProDesk 400 G9', '400G9', 2, 3, 1, 36, 1, NULL, 'Admin/finance desktop', 0, '2026-02-20 17:48:14', '2026-02-20 17:48:14', NULL),
(10, 'Lenovo ThinkPad E14', 'E14', 1, 4, 1, 36, 1, NULL, 'Lecturer laptop', 0, '2026-02-20 17:48:14', '2026-02-20 17:48:14', NULL),
(11, 'iPhone 12', 'A2172', 3, 2, 4, 24, 1, NULL, 'Security/admin phone', 0, '2026-02-20 17:48:14', '2026-02-20 17:48:14', NULL),
(12, 'Microsoft Surface Go', 'SurfaceGo', 4, 7, 4, 24, 1, NULL, 'Reception/registry tablet', 0, '2026-02-20 17:48:14', '2026-02-20 17:48:14', NULL),
(13, 'Dell UltraSharp U2415', 'U2415', 5, 1, 2, 12, 1, NULL, 'Office display', 0, '2026-02-20 17:48:14', '2026-02-20 17:48:14', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `id` bigint(20) NOT NULL,
  `clock_in_time` datetime(6) NOT NULL,
  `clock_out_time` datetime(6) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `attendance_records`
--

CREATE TABLE `attendance_records` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `clock_in_time` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `clock_out_time` timestamp NULL DEFAULT NULL,
  `clock_in_method` enum('manual','card','qr_scan') DEFAULT 'manual',
  `clock_out_method` enum('manual','card','qr_scan') DEFAULT 'manual',
  `total_hours` decimal(4,2) DEFAULT 0.00,
  `overtime_hours` decimal(4,2) DEFAULT 0.00,
  `break_duration` int(11) DEFAULT 0,
  `location` varchar(100) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('present','late','absent','half_day') DEFAULT 'present',
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `flagged_for_review` tinyint(1) DEFAULT 0,
  `buddy_punch_risk` tinyint(1) DEFAULT 0,
  `audit_notes` text DEFAULT NULL,
  `reviewed_by` int(11) DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `attendance_records`
--

INSERT INTO `attendance_records` (`id`, `user_id`, `clock_in_time`, `clock_out_time`, `clock_in_method`, `clock_out_method`, `total_hours`, `overtime_hours`, `break_duration`, `location`, `ip_address`, `notes`, `status`, `approved_by`, `approved_at`, `created_at`, `updated_at`, `flagged_for_review`, `buddy_punch_risk`, `audit_notes`, `reviewed_by`, `reviewed_at`) VALUES
(1, 9, '2026-01-05 06:00:00', '2026-01-05 15:00:00', 'manual', 'manual', 9.00, 1.00, 60, 'Main Office', '192.168.1.100', 'Regular work day', 'present', NULL, NULL, '2025-07-07 13:16:01', '2026-01-13 14:20:47', 0, 0, NULL, NULL, NULL),
(2, 10, '2026-01-05 06:15:00', '2026-01-05 15:15:00', '', '', 9.00, 1.00, 60, 'Main Office', '192.168.1.101', 'Late arrival', 'late', NULL, NULL, '2025-07-07 13:16:01', '2026-01-13 14:20:47', 0, 0, NULL, NULL, NULL),
(3, 11, '2026-01-05 06:00:00', '2026-01-05 16:00:00', 'qr_scan', 'qr_scan', 10.00, 2.00, 60, 'Main Office', '192.168.1.102', 'Overtime work', 'present', NULL, NULL, '2025-07-07 13:16:01', '2026-01-13 14:20:47', 0, 0, NULL, NULL, NULL),
(4, 12, '2026-01-05 06:30:00', '2026-01-05 15:30:00', 'card', 'card', 9.00, 1.00, 60, 'Main Office', '192.168.1.103', 'Late arrival', 'late', NULL, NULL, '2025-07-07 13:16:01', '2026-01-13 14:20:47', 0, 0, NULL, NULL, NULL),
(5, 9, '2026-01-06 06:00:00', '2026-01-06 15:00:00', 'manual', 'manual', 9.00, 1.00, 60, 'Main Office', '192.168.1.100', 'Regular work day', 'present', NULL, NULL, '2025-07-07 13:16:01', '2026-01-13 14:20:47', 0, 0, NULL, NULL, NULL),
(6, 10, '2026-01-06 06:00:00', '2026-01-06 15:00:00', '', '', 9.00, 1.00, 60, 'Main Office', '192.168.1.101', 'Regular work day', 'present', NULL, NULL, '2025-07-07 13:16:01', '2026-01-13 14:20:47', 0, 0, NULL, NULL, NULL),
(7, 11, '2026-01-06 06:00:00', '2026-01-06 15:30:00', 'qr_scan', 'qr_scan', 9.50, 1.50, 60, 'Main Office', '192.168.1.102', 'Extra work', 'present', NULL, NULL, '2025-07-07 13:16:01', '2026-01-13 14:20:47', 0, 0, NULL, NULL, NULL),
(8, 12, '2026-01-06 06:00:00', '2026-01-06 15:00:00', 'card', 'card', 9.00, 1.00, 60, 'Main Office', '192.168.1.103', 'Regular work day', 'present', NULL, NULL, '2025-07-07 13:16:01', '2026-01-13 14:20:47', 0, 0, NULL, NULL, NULL),
(9, 2, '2026-01-07 06:00:00', '2026-01-07 15:00:00', 'qr_scan', 'qr_scan', 9.00, 1.00, 60, 'Main Office', '192.168.1.104', 'Regular work day', 'present', NULL, NULL, '2025-12-18 16:03:12', '2026-01-13 14:20:47', 0, 0, NULL, NULL, NULL),
(10, 3, '2026-01-07 06:00:00', '2026-01-07 15:00:00', 'qr_scan', 'qr_scan', 9.00, 1.00, 60, 'Main Office', '192.168.1.105', 'Regular work day', 'present', NULL, NULL, '2025-12-18 16:57:39', '2026-01-13 14:20:47', 0, 0, NULL, NULL, NULL),
(11, 1, '2026-01-07 06:00:00', '2026-01-07 15:00:00', 'qr_scan', 'qr_scan', 9.00, 1.00, 60, 'Main Office', '192.168.1.106', 'Regular work day', 'present', NULL, NULL, '2025-12-29 12:18:35', '2026-01-13 15:00:25', 0, 0, NULL, NULL, NULL),
(12, 1, '2026-01-07 06:00:00', '2026-01-07 15:00:00', 'qr_scan', 'qr_scan', 9.00, 1.00, 60, 'Main Office', '192.168.1.107', 'Regular work day', 'present', NULL, NULL, '2025-12-29 12:42:28', '2026-01-13 14:53:55', 0, 0, NULL, NULL, NULL),
(13, 1, '2026-01-19 13:44:53', '2026-01-19 13:44:53', 'qr_scan', 'manual', 0.00, 0.00, 0, NULL, NULL, NULL, 'present', NULL, NULL, '2026-01-17 18:56:48', '2026-01-19 13:44:53', 0, 0, NULL, NULL, NULL),
(14, 2, '2026-02-04 03:45:11', '2026-02-04 03:45:11', 'qr_scan', 'qr_scan', 0.00, 0.00, 0, NULL, NULL, NULL, 'present', NULL, NULL, '2026-02-04 03:03:05', '2026-02-04 03:45:11', 0, 0, NULL, NULL, NULL),
(15, 2, '2026-02-04 05:37:21', '2026-02-04 05:37:21', 'qr_scan', 'qr_scan', 0.00, 0.00, 0, NULL, NULL, NULL, 'present', NULL, NULL, '2026-02-04 05:35:50', '2026-02-04 05:37:21', 0, 0, NULL, NULL, NULL),
(16, 2, '2026-02-04 05:38:58', NULL, 'qr_scan', NULL, 0.00, 0.00, 0, NULL, NULL, NULL, 'present', NULL, NULL, '2026-02-04 05:38:58', '2026-02-04 05:38:58', 0, 0, NULL, NULL, NULL),
(1, 9, '2026-01-05 06:00:00', '2026-01-05 15:00:00', 'manual', 'manual', 9.00, 1.00, 60, 'Main Office', '192.168.1.100', 'Regular work day', 'present', NULL, NULL, '2025-07-07 13:16:01', '2026-01-13 14:20:47', 0, 0, NULL, NULL, NULL),
(2, 10, '2026-01-05 06:15:00', '2026-01-05 15:15:00', '', '', 9.00, 1.00, 60, 'Main Office', '192.168.1.101', 'Late arrival', 'late', NULL, NULL, '2025-07-07 13:16:01', '2026-01-13 14:20:47', 0, 0, NULL, NULL, NULL),
(3, 11, '2026-01-05 06:00:00', '2026-01-05 16:00:00', 'qr_scan', 'qr_scan', 10.00, 2.00, 60, 'Main Office', '192.168.1.102', 'Overtime work', 'present', NULL, NULL, '2025-07-07 13:16:01', '2026-01-13 14:20:47', 0, 0, NULL, NULL, NULL),
(4, 12, '2026-01-05 06:30:00', '2026-01-05 15:30:00', 'card', 'card', 9.00, 1.00, 60, 'Main Office', '192.168.1.103', 'Late arrival', 'late', NULL, NULL, '2025-07-07 13:16:01', '2026-01-13 14:20:47', 0, 0, NULL, NULL, NULL),
(5, 9, '2026-01-06 06:00:00', '2026-01-06 15:00:00', 'manual', 'manual', 9.00, 1.00, 60, 'Main Office', '192.168.1.100', 'Regular work day', 'present', NULL, NULL, '2025-07-07 13:16:01', '2026-01-13 14:20:47', 0, 0, NULL, NULL, NULL),
(6, 10, '2026-01-06 06:00:00', '2026-01-06 15:00:00', '', '', 9.00, 1.00, 60, 'Main Office', '192.168.1.101', 'Regular work day', 'present', NULL, NULL, '2025-07-07 13:16:01', '2026-01-13 14:20:47', 0, 0, NULL, NULL, NULL),
(7, 11, '2026-01-06 06:00:00', '2026-01-06 15:30:00', 'qr_scan', 'qr_scan', 9.50, 1.50, 60, 'Main Office', '192.168.1.102', 'Extra work', 'present', NULL, NULL, '2025-07-07 13:16:01', '2026-01-13 14:20:47', 0, 0, NULL, NULL, NULL),
(8, 12, '2026-01-06 06:00:00', '2026-01-06 15:00:00', 'card', 'card', 9.00, 1.00, 60, 'Main Office', '192.168.1.103', 'Regular work day', 'present', NULL, NULL, '2025-07-07 13:16:01', '2026-01-13 14:20:47', 0, 0, NULL, NULL, NULL),
(9, 2, '2026-01-07 06:00:00', '2026-01-07 15:00:00', 'qr_scan', 'qr_scan', 9.00, 1.00, 60, 'Main Office', '192.168.1.104', 'Regular work day', 'present', NULL, NULL, '2025-12-18 16:03:12', '2026-01-13 14:20:47', 0, 0, NULL, NULL, NULL),
(10, 3, '2026-01-07 06:00:00', '2026-01-07 15:00:00', 'qr_scan', 'qr_scan', 9.00, 1.00, 60, 'Main Office', '192.168.1.105', 'Regular work day', 'present', NULL, NULL, '2025-12-18 16:57:39', '2026-01-13 14:20:47', 0, 0, NULL, NULL, NULL),
(11, 1, '2026-01-07 06:00:00', '2026-01-07 15:00:00', 'qr_scan', 'qr_scan', 9.00, 1.00, 60, 'Main Office', '192.168.1.106', 'Regular work day', 'present', NULL, NULL, '2025-12-29 12:18:35', '2026-01-13 15:00:25', 0, 0, NULL, NULL, NULL),
(12, 1, '2026-01-07 06:00:00', '2026-01-07 15:00:00', 'qr_scan', 'qr_scan', 9.00, 1.00, 60, 'Main Office', '192.168.1.107', 'Regular work day', 'present', NULL, NULL, '2025-12-29 12:42:28', '2026-01-13 14:53:55', 0, 0, NULL, NULL, NULL),
(13, 1, '2026-01-19 13:44:53', '2026-01-19 13:44:53', 'qr_scan', 'manual', 0.00, 0.00, 0, NULL, NULL, NULL, 'present', NULL, NULL, '2026-01-17 18:56:48', '2026-01-19 13:44:53', 0, 0, NULL, NULL, NULL),
(14, 2, '2026-02-04 03:45:11', '2026-02-04 03:45:11', 'qr_scan', 'qr_scan', 0.00, 0.00, 0, NULL, NULL, NULL, 'present', NULL, NULL, '2026-02-04 03:03:05', '2026-02-04 03:45:11', 0, 0, NULL, NULL, NULL),
(15, 2, '2026-02-04 05:37:21', '2026-02-04 05:37:21', 'qr_scan', 'qr_scan', 0.00, 0.00, 0, NULL, NULL, NULL, 'present', NULL, NULL, '2026-02-04 05:35:50', '2026-02-04 05:37:21', 0, 0, NULL, NULL, NULL),
(16, 2, '2026-02-04 05:38:58', NULL, 'qr_scan', NULL, 0.00, 0.00, 0, NULL, NULL, NULL, 'present', NULL, NULL, '2026-02-04 05:38:58', '2026-02-04 05:38:58', 0, 0, NULL, NULL, NULL);

--
-- Triggers `attendance_records`
--
DELIMITER $$
CREATE TRIGGER `calculate_attendance_hours` BEFORE UPDATE ON `attendance_records` FOR EACH ROW BEGIN
    IF NEW.clock_out_time IS NOT NULL AND NEW.clock_in_time IS NOT NULL THEN
        SET NEW.total_hours = TIMESTAMPDIFF(MINUTE, NEW.clock_in_time, NEW.clock_out_time) / 60.0;
        
        
        IF NEW.total_hours > 8 THEN
            SET NEW.overtime_hours = NEW.total_hours - 8;
        ELSE
            SET NEW.overtime_hours = 0;
        END IF;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` bigint(20) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `entity_id` varchar(100) DEFAULT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `request_id` varchar(100) DEFAULT NULL,
  `result` varchar(20) DEFAULT NULL,
  `service_name` varchar(50) DEFAULT NULL,
  `session_id` varchar(100) DEFAULT NULL,
  `user_name` varchar(255) DEFAULT NULL,
  `performed_by` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `ip_address`, `timestamp`, `details`, `entity_id`, `entity_type`, `request_id`, `result`, `service_name`, `session_id`, `user_name`, `performed_by`) VALUES
(1, 1, 'Crafty Developer has signed in using password authentication', NULL, '2026-02-04 00:58:50', '{\"employeeId\":\"EMP001\",\"method\":\"password\"}', NULL, NULL, NULL, 'success', 'nodejs-backend', NULL, 'Crafty Developer', ''),
(2, 1, 'Dr. Enan Nyesheja has updated their profile information', NULL, '2026-02-04 03:01:20', '{\"module\":\"user_management\",\"operation\":\"UPDATE\",\"employeeId\":\"EMP001\",\"email\":\"garrisonsayor@gmail.com\"}', '1', 'USER', NULL, 'success', 'java-backend', NULL, 'Dr. Enan Nyesheja', ''),
(3, 1, 'Dr. Enan Nyesheja has signed in using password authentication', NULL, '2026-02-04 01:01:59', '{\"employeeId\":\"EMP001\",\"method\":\"password\"}', NULL, NULL, NULL, 'success', 'nodejs-backend', NULL, 'Dr. Enan Nyesheja', ''),
(4, 2, 'Garrison Sayor has signed in using password authentication', NULL, '2026-02-04 01:03:05', '{\"employeeId\":\"EMP002\",\"method\":\"password\"}', NULL, NULL, NULL, 'success', 'nodejs-backend', NULL, 'Garrison Sayor', ''),
(5, 2, 'Garrison Sayor III has updated their profile information', NULL, '2026-02-04 03:05:58', '{\"module\":\"user_management\",\"operation\":\"UPDATE\",\"employeeId\":\"EMP002\",\"email\":\"hr.head@craftresource.gov\"}', '2', 'USER', NULL, 'success', 'java-backend', NULL, 'Garrison Sayor III', ''),
(6, 1, 'Dr. Enan Nyesheja has signed in using password authentication', NULL, '2026-02-04 01:12:27', '{\"employeeId\":\"EMP001\",\"method\":\"password\"}', NULL, NULL, NULL, 'success', 'nodejs-backend', NULL, 'Dr. Enan Nyesheja', ''),
(7, 2, 'Garrison Sayor III has signed in using password authentication', NULL, '2026-02-04 01:17:57', '{\"employeeId\":\"EMP002\",\"method\":\"password\"}', NULL, NULL, NULL, 'success', 'nodejs-backend', NULL, 'Garrison Sayor III', ''),
(8, 2, 'Garrison Sayor III has signed in using password authentication', NULL, '2026-02-04 01:21:12', '{\"employeeId\":\"EMP002\",\"method\":\"password\"}', NULL, NULL, NULL, 'success', 'nodejs-backend', NULL, 'Garrison Sayor III', ''),
(9, 2, 'Garrison Sayor III has signed in using password authentication', NULL, '2026-02-04 01:25:16', '{\"employeeId\":\"EMP002\",\"method\":\"password\"}', NULL, NULL, NULL, 'success', 'nodejs-backend', NULL, 'Garrison Sayor III', ''),
(10, 2, 'Garrison Sayor III has updated their profile information', NULL, '2026-02-04 03:28:40', '{\"module\":\"user_management\",\"operation\":\"UPDATE\",\"employeeId\":\"EMP002\",\"email\":\"hr.head@craftresource.gov\"}', '2', 'USER', NULL, 'success', 'java-backend', NULL, 'Garrison Sayor III', ''),
(11, 2, 'Garrison Sayor III has updated their profile information', NULL, '2026-02-04 03:28:51', '{\"module\":\"user_management\",\"operation\":\"UPDATE\",\"employeeId\":\"EMP002\",\"email\":\"hr.head@craftresource.gov\"}', '2', 'USER', NULL, 'success', 'java-backend', NULL, 'Garrison Sayor III', ''),
(12, 2, 'Garrison Sayor III has updated their profile information', NULL, '2026-02-04 03:33:22', '{\"module\":\"user_management\",\"operation\":\"UPDATE\",\"employeeId\":\"EMP002\",\"email\":\"hr.head@craftresource.gov\"}', '2', 'USER', NULL, 'success', 'java-backend', NULL, 'Garrison Sayor III', ''),
(13, 2, 'Garrison Sayor III has updated their profile information', NULL, '2026-02-04 03:34:42', '{\"module\":\"user_management\",\"operation\":\"UPDATE\",\"employeeId\":\"EMP002\",\"email\":\"hr.head@craftresource.gov\"}', '2', 'USER', NULL, 'success', 'java-backend', NULL, 'Garrison Sayor III', ''),
(14, 2, 'Garrison Sayor III has signed in using password authentication', NULL, '2026-02-04 01:35:17', '{\"employeeId\":\"EMP002\",\"method\":\"password\"}', NULL, NULL, NULL, 'success', 'nodejs-backend', NULL, 'Garrison Sayor III', ''),
(15, 1, 'Dr. Enan Nyesheja has signed in using password authentication', NULL, '2026-02-04 01:36:25', '{\"employeeId\":\"EMP001\",\"method\":\"password\"}', NULL, NULL, NULL, 'success', 'nodejs-backend', NULL, 'Dr. Enan Nyesheja', ''),
(16, 1, 'Dr. Enan Nyesheja has signed in using password authentication', NULL, '2026-02-04 01:36:55', '{\"employeeId\":\"EMP001\",\"method\":\"password\"}', NULL, NULL, NULL, 'success', 'nodejs-backend', NULL, 'Dr. Enan Nyesheja', ''),
(17, 1, 'Dr. Enan Nyesheja has signed in using password authentication', NULL, '2026-02-04 01:38:05', '{\"employeeId\":\"EMP001\",\"method\":\"password\"}', NULL, NULL, NULL, 'success', 'nodejs-backend', NULL, 'Dr. Enan Nyesheja', ''),
(18, 2, 'Garrison Sayor III has signed in using password authentication', NULL, '2026-02-04 03:42:13', '{\"employeeId\":\"EMP002\",\"method\":\"password\"}', NULL, NULL, NULL, 'success', 'nodejs-backend', NULL, 'Garrison Sayor III', ''),
(19, 2, 'Garrison Sayor III has signed in using password authentication', NULL, '2026-02-04 03:45:11', '{\"employeeId\":\"EMP002\",\"method\":\"password\"}', NULL, NULL, NULL, 'success', 'nodejs-backend', NULL, 'Garrison Sayor III', ''),
(20, 2, 'Garrison Sayor III has signed in using password authentication', NULL, '2026-02-04 05:35:49', '{\"employeeId\":\"EMP002\",\"method\":\"password\"}', NULL, NULL, NULL, 'success', 'nodejs-backend', NULL, 'Garrison Sayor III', ''),
(21, 2, 'Garrison Sayor III has signed in using password authentication', NULL, '2026-02-04 05:37:21', '{\"employeeId\":\"EMP002\",\"method\":\"password\"}', NULL, NULL, NULL, 'success', 'nodejs-backend', NULL, 'Garrison Sayor III', ''),
(22, 2, 'Garrison Sayor III has signed in using password authentication', NULL, '2026-02-04 05:38:58', '{\"employeeId\":\"EMP002\",\"method\":\"password\"}', NULL, NULL, NULL, 'success', 'nodejs-backend', NULL, 'Garrison Sayor III', ''),
(1, 1, 'Crafty Developer has signed in using password authentication', NULL, '2026-02-04 00:58:50', '{\"employeeId\":\"EMP001\",\"method\":\"password\"}', NULL, NULL, NULL, 'success', 'nodejs-backend', NULL, 'Crafty Developer', ''),
(2, 1, 'Dr. Enan Nyesheja has updated their profile information', NULL, '2026-02-04 03:01:20', '{\"module\":\"user_management\",\"operation\":\"UPDATE\",\"employeeId\":\"EMP001\",\"email\":\"garrisonsayor@gmail.com\"}', '1', 'USER', NULL, 'success', 'java-backend', NULL, 'Dr. Enan Nyesheja', ''),
(3, 1, 'Dr. Enan Nyesheja has signed in using password authentication', NULL, '2026-02-04 01:01:59', '{\"employeeId\":\"EMP001\",\"method\":\"password\"}', NULL, NULL, NULL, 'success', 'nodejs-backend', NULL, 'Dr. Enan Nyesheja', ''),
(4, 2, 'Garrison Sayor has signed in using password authentication', NULL, '2026-02-04 01:03:05', '{\"employeeId\":\"EMP002\",\"method\":\"password\"}', NULL, NULL, NULL, 'success', 'nodejs-backend', NULL, 'Garrison Sayor', ''),
(5, 2, 'Garrison Sayor III has updated their profile information', NULL, '2026-02-04 03:05:58', '{\"module\":\"user_management\",\"operation\":\"UPDATE\",\"employeeId\":\"EMP002\",\"email\":\"hr.head@craftresource.gov\"}', '2', 'USER', NULL, 'success', 'java-backend', NULL, 'Garrison Sayor III', ''),
(6, 1, 'Dr. Enan Nyesheja has signed in using password authentication', NULL, '2026-02-04 01:12:27', '{\"employeeId\":\"EMP001\",\"method\":\"password\"}', NULL, NULL, NULL, 'success', 'nodejs-backend', NULL, 'Dr. Enan Nyesheja', ''),
(7, 2, 'Garrison Sayor III has signed in using password authentication', NULL, '2026-02-04 01:17:57', '{\"employeeId\":\"EMP002\",\"method\":\"password\"}', NULL, NULL, NULL, 'success', 'nodejs-backend', NULL, 'Garrison Sayor III', ''),
(8, 2, 'Garrison Sayor III has signed in using password authentication', NULL, '2026-02-04 01:21:12', '{\"employeeId\":\"EMP002\",\"method\":\"password\"}', NULL, NULL, NULL, 'success', 'nodejs-backend', NULL, 'Garrison Sayor III', ''),
(9, 2, 'Garrison Sayor III has signed in using password authentication', NULL, '2026-02-04 01:25:16', '{\"employeeId\":\"EMP002\",\"method\":\"password\"}', NULL, NULL, NULL, 'success', 'nodejs-backend', NULL, 'Garrison Sayor III', ''),
(10, 2, 'Garrison Sayor III has updated their profile information', NULL, '2026-02-04 03:28:40', '{\"module\":\"user_management\",\"operation\":\"UPDATE\",\"employeeId\":\"EMP002\",\"email\":\"hr.head@craftresource.gov\"}', '2', 'USER', NULL, 'success', 'java-backend', NULL, 'Garrison Sayor III', ''),
(11, 2, 'Garrison Sayor III has updated their profile information', NULL, '2026-02-04 03:28:51', '{\"module\":\"user_management\",\"operation\":\"UPDATE\",\"employeeId\":\"EMP002\",\"email\":\"hr.head@craftresource.gov\"}', '2', 'USER', NULL, 'success', 'java-backend', NULL, 'Garrison Sayor III', ''),
(12, 2, 'Garrison Sayor III has updated their profile information', NULL, '2026-02-04 03:33:22', '{\"module\":\"user_management\",\"operation\":\"UPDATE\",\"employeeId\":\"EMP002\",\"email\":\"hr.head@craftresource.gov\"}', '2', 'USER', NULL, 'success', 'java-backend', NULL, 'Garrison Sayor III', ''),
(13, 2, 'Garrison Sayor III has updated their profile information', NULL, '2026-02-04 03:34:42', '{\"module\":\"user_management\",\"operation\":\"UPDATE\",\"employeeId\":\"EMP002\",\"email\":\"hr.head@craftresource.gov\"}', '2', 'USER', NULL, 'success', 'java-backend', NULL, 'Garrison Sayor III', ''),
(14, 2, 'Garrison Sayor III has signed in using password authentication', NULL, '2026-02-04 01:35:17', '{\"employeeId\":\"EMP002\",\"method\":\"password\"}', NULL, NULL, NULL, 'success', 'nodejs-backend', NULL, 'Garrison Sayor III', ''),
(15, 1, 'Dr. Enan Nyesheja has signed in using password authentication', NULL, '2026-02-04 01:36:25', '{\"employeeId\":\"EMP001\",\"method\":\"password\"}', NULL, NULL, NULL, 'success', 'nodejs-backend', NULL, 'Dr. Enan Nyesheja', ''),
(16, 1, 'Dr. Enan Nyesheja has signed in using password authentication', NULL, '2026-02-04 01:36:55', '{\"employeeId\":\"EMP001\",\"method\":\"password\"}', NULL, NULL, NULL, 'success', 'nodejs-backend', NULL, 'Dr. Enan Nyesheja', ''),
(17, 1, 'Dr. Enan Nyesheja has signed in using password authentication', NULL, '2026-02-04 01:38:05', '{\"employeeId\":\"EMP001\",\"method\":\"password\"}', NULL, NULL, NULL, 'success', 'nodejs-backend', NULL, 'Dr. Enan Nyesheja', ''),
(18, 2, 'Garrison Sayor III has signed in using password authentication', NULL, '2026-02-04 03:42:13', '{\"employeeId\":\"EMP002\",\"method\":\"password\"}', NULL, NULL, NULL, 'success', 'nodejs-backend', NULL, 'Garrison Sayor III', ''),
(19, 2, 'Garrison Sayor III has signed in using password authentication', NULL, '2026-02-04 03:45:11', '{\"employeeId\":\"EMP002\",\"method\":\"password\"}', NULL, NULL, NULL, 'success', 'nodejs-backend', NULL, 'Garrison Sayor III', ''),
(20, 2, 'Garrison Sayor III has signed in using password authentication', NULL, '2026-02-04 05:35:49', '{\"employeeId\":\"EMP002\",\"method\":\"password\"}', NULL, NULL, NULL, 'success', 'nodejs-backend', NULL, 'Garrison Sayor III', ''),
(21, 2, 'Garrison Sayor III has signed in using password authentication', NULL, '2026-02-04 05:37:21', '{\"employeeId\":\"EMP002\",\"method\":\"password\"}', NULL, NULL, NULL, 'success', 'nodejs-backend', NULL, 'Garrison Sayor III', ''),
(22, 2, 'Garrison Sayor III has signed in using password authentication', NULL, '2026-02-04 05:38:58', '{\"employeeId\":\"EMP002\",\"method\":\"password\"}', NULL, NULL, NULL, 'success', 'nodejs-backend', NULL, 'Garrison Sayor III', '');

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs_archive`
--

CREATE TABLE `audit_logs_archive` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `timestamp` datetime NOT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `service_name` varchar(50) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `request_id` varchar(100) DEFAULT NULL,
  `session_id` varchar(100) DEFAULT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` varchar(100) DEFAULT NULL,
  `result` varchar(20) DEFAULT NULL,
  `archived_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `audit_logs_archive`
--

INSERT INTO `audit_logs_archive` (`id`, `user_id`, `action`, `timestamp`, `details`, `service_name`, `ip_address`, `request_id`, `session_id`, `entity_type`, `entity_id`, `result`, `archived_at`) VALUES
(1, 19, 'User Crafty Dev has updated their profile information', '2025-07-07 19:11:45', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-07 19:11:45\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(2, 19, 'User Crafty Dev has updated their profile information', '2025-07-07 19:20:22', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-07 19:20:22\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(3, 19, 'User Crafty Dev has updated their profile information', '2025-07-07 19:24:35', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-07 19:24:35\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(4, 19, 'User Crafty Dev has updated their profile information', '2025-07-07 19:30:02', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-07 19:30:02\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(5, 19, 'User Crafty Dev has updated their profile information', '2025-07-08 00:52:40', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-08 00:52:40\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(6, 19, 'User Crafty Dev has updated their profile information', '2025-07-08 00:53:32', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-08 00:53:32\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(7, 19, 'User Crafty Dev has updated their profile information', '2025-07-08 00:55:51', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-08 00:55:51\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(8, 19, 'User Crafty Dev has updated their profile information', '2025-07-08 01:09:23', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-08 01:09:23\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(9, 19, 'User Crafty Dev has updated their profile information', '2025-07-08 01:10:11', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-08 01:10:11\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(10, 19, 'User Crafty Dev has updated their profile information', '2025-07-08 01:39:42', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-08 01:39:42\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(11, 19, 'User Crafty Dev has updated their profile information', '2025-07-08 02:15:01', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-08 02:15:01\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(12, 19, 'User Crafty Dev has updated their profile information', '2025-07-08 02:15:39', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-08 02:15:39\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(13, 19, 'User Crafty Dev has updated their profile information', '2025-07-08 02:16:40', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-08 02:16:40\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(14, 19, 'User Crafty Dev has updated their profile information', '2025-07-08 02:21:17', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-08 02:21:17\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(15, 19, 'User Crafty Dev has updated their profile information', '2025-07-08 04:33:31', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-08 04:33:31\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(16, 19, 'User Crafty Dev has updated their profile information', '2025-07-08 10:12:59', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-08 10:12:59\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(17, 19, 'User Crafty Dev has updated their profile information', '2025-07-08 10:21:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-08 10:21:26\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(18, 19, 'User Crafty Dev has updated their profile information', '2025-07-08 10:24:11', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-08 10:24:11\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(19, 19, 'User Crafty Dev has updated their profile information', '2025-07-08 10:34:49', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-08 10:34:49\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(20, 19, 'User Crafty Dev has updated their profile information', '2025-07-08 11:05:51', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-08 11:05:51\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(21, 19, 'User Crafty Dev has updated their profile information', '2025-07-08 12:28:38', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-08 12:28:38\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(22, 19, 'User Crafty Dev has updated their profile information', '2025-07-09 00:35:17', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-09 00:35:17\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(23, 19, 'User Crafty Dev has updated their profile information', '2025-07-10 11:38:23', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-10 11:38:23\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(24, 19, 'User Crafty Dev has updated their profile information', '2025-07-11 00:12:55', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-11 00:12:55\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(25, 19, 'User Crafty Dev has updated their profile information', '2025-07-11 00:43:06', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-11 00:43:06\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(26, 19, 'User Crafty Dev has updated their profile information', '2025-07-11 00:50:55', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-11 00:50:55\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(27, 19, 'User Crafty Dev has updated their profile information', '2025-07-11 16:29:58', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-11 16:29:58\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(28, 19, 'User Crafty Dev has updated their profile information', '2025-07-14 21:40:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-14 21:40:19\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(29, 19, 'User Crafty Dev has updated their profile information', '2025-07-14 23:18:30', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-14 23:18:30\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(30, 19, 'User Crafty Dev has updated their profile information', '2025-07-15 01:30:34', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-15 01:30:34\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(31, 19, 'User Crafty Dev has updated their profile information', '2025-07-15 03:38:43', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-15 03:38:43\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(32, 19, 'User Crafty Dev has updated their profile information', '2025-07-15 04:50:25', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-15 04:50:25\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(33, 19, 'User Crafty Dev has updated their profile information', '2025-07-15 18:25:52', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-15 18:25:52\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(34, 20, 'User Issa Adams has updated their profile information', '2025-07-15 18:32:44', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-15 18:32:44\"}', 'java-backend', NULL, NULL, NULL, 'USER', '20', 'success', '2026-01-28 16:35:09'),
(35, 19, 'User Crafty Dev has updated their profile information', '2025-07-16 00:35:28', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-16 00:35:28\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(36, 19, 'User Crafty Dev has updated their profile information', '2025-07-16 01:37:29', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-16 01:37:29\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(37, 19, 'User Crafty Dev has updated their profile information', '2025-07-16 02:48:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-16 02:48:03\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(38, 19, 'User Crafty Dev has updated their profile information', '2025-07-16 12:14:02', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-16 12:14:02\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(39, 19, 'User Crafty Dev has updated their profile information', '2025-07-16 12:14:27', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-16 12:14:27\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(40, 19, 'User Crafty Dev has updated their profile information', '2025-07-16 12:37:42', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-16 12:37:42\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(41, 19, 'User Crafty Dev has updated their profile information', '2025-07-16 13:50:45', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-16 13:50:45\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(42, 19, 'User Crafty Dev has updated their profile information', '2025-07-16 13:59:50', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-16 13:59:50\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(43, 19, 'User Crafty Dev has updated their profile information', '2025-07-16 14:06:56', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-16 14:06:56\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(44, 19, 'User Crafty Dev has updated their profile information', '2025-07-16 14:24:40', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-16 14:24:40\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(45, 19, 'User Crafty Dev has updated their profile information', '2025-07-16 15:25:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-16 15:25:26\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(46, 19, 'User Crafty Dev has updated their profile information', '2025-07-16 16:49:33', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-16 16:49:33\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(47, 19, 'User Crafty Dev has updated their profile information', '2025-07-16 18:36:53', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-16 18:36:53\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(48, 19, 'User Crafty Dev has updated their profile information', '2025-07-24 15:51:51', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-24 15:51:51\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(49, 19, 'User Crafty Dev has updated their profile information', '2025-07-24 16:52:53', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-24 16:52:53\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(50, 19, 'User Crafty Dev has updated their profile information', '2025-07-24 17:15:05', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-24 17:15:05\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(51, 19, 'User Crafty Dev has updated their profile information', '2025-07-24 18:32:02', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-24 18:32:02\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(52, 19, 'User Crafty Dev has updated their profile information', '2025-07-24 19:47:41', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-24 19:47:41\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(53, 19, 'User Crafty Dev has updated their profile information', '2025-07-24 21:18:20', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-24 21:18:20\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(54, 19, 'User Crafty Dev has updated their profile information', '2025-07-24 22:22:04', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-24 22:22:04\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(55, 19, 'User Crafty Dev has updated their profile information', '2025-07-30 13:39:14', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-30 13:39:14\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(56, 19, 'User Crafty Dev has updated their profile information', '2025-07-30 17:01:48', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-30 17:01:48\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(57, 19, 'User Crafty Dev has updated their profile information', '2025-07-30 19:03:01', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-30 19:03:01\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(58, 19, 'User Crafty Dev has updated their profile information', '2025-08-01 15:34:06', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-08-01 15:34:06\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(59, 19, 'User Crafty Dev has updated their profile information', '2025-08-08 04:17:11', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-08-08 04:17:11\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(60, 19, 'User Crafty Dev has updated their profile information', '2025-08-08 05:07:09', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-08-08 05:07:09\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(61, 19, 'User Crafty Dev has updated their profile information', '2025-08-08 06:27:05', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-08-08 06:27:05\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(62, 19, 'User Crafty Dev has updated their profile information', '2025-09-01 22:03:59', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-01 22:03:59\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(63, 20, 'User Issa Adams has updated their profile information', '2025-09-01 22:08:43', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-01 22:08:43\"}', 'java-backend', NULL, NULL, NULL, 'USER', '20', 'success', '2026-01-28 16:35:09'),
(64, 20, 'User Issa Adams has updated their profile information', '2025-09-02 01:56:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-02 01:56:03\"}', 'java-backend', NULL, NULL, NULL, 'USER', '20', 'success', '2026-01-28 16:35:09'),
(65, 19, 'User Crafty Dev has updated their profile information', '2025-09-02 02:21:55', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-02 02:21:55\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(66, 20, 'User Issa Adams has updated their profile information', '2025-09-02 02:21:55', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-02 02:21:55\"}', 'java-backend', NULL, NULL, NULL, 'USER', '20', 'success', '2026-01-28 16:35:09'),
(67, 20, 'User Issa Adams has updated their profile information', '2025-09-02 02:57:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-02 02:57:03\"}', 'java-backend', NULL, NULL, NULL, 'USER', '20', 'success', '2026-01-28 16:35:09'),
(68, 20, 'User Issa Adams has updated their profile information', '2025-09-02 03:56:50', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-02 03:56:50\"}', 'java-backend', NULL, NULL, NULL, 'USER', '20', 'success', '2026-01-28 16:35:09'),
(69, 19, 'User Crafty Dev has updated their profile information', '2025-09-02 03:59:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-02 03:59:19\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(70, 19, 'User Crafty Dev has updated their profile information', '2025-09-02 03:59:45', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-02 03:59:45\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(71, 20, 'User Issa Adams has updated their profile information', '2025-09-02 03:59:59', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-02 03:59:59\"}', 'java-backend', NULL, NULL, NULL, 'USER', '20', 'success', '2026-01-28 16:35:09'),
(72, 20, 'User Issa Adams has updated their profile information', '2025-09-02 04:03:05', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-02 04:03:05\"}', 'java-backend', NULL, NULL, NULL, 'USER', '20', 'success', '2026-01-28 16:35:09'),
(73, 20, 'User Issa Adams has updated their profile information', '2025-09-02 04:06:00', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-02 04:06:00\"}', 'java-backend', NULL, NULL, NULL, 'USER', '20', 'success', '2026-01-28 16:35:09'),
(74, 20, 'User Issa Adams has updated their profile information', '2025-09-02 05:47:08', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-02 05:47:08\"}', 'java-backend', NULL, NULL, NULL, 'USER', '20', 'success', '2026-01-28 16:35:09'),
(75, 21, 'User Albertine Wilson has updated their profile information', '2025-09-10 21:00:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-10 21:00:03\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(76, NULL, 'UPDATE', '2025-09-10 23:04:16', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-10 23:04:16\"}', 'java-backend', NULL, NULL, NULL, 'USER', NULL, 'success', '2026-01-28 16:35:09'),
(77, 23, 'User Crayton Kamara has updated their profile information', '2025-09-10 23:43:02', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-10 23:43:02\"}', 'java-backend', NULL, NULL, NULL, 'USER', '23', 'success', '2026-01-28 16:35:09'),
(78, 21, 'User Albertine Wilson has updated their profile information', '2025-09-11 00:02:47', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-11 00:02:47\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(79, 21, 'User Albertine Wilson has updated their profile information', '2025-09-11 00:06:21', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-11 00:06:21\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(80, 21, 'User Albertine Wilson has updated their profile information', '2025-09-11 00:06:21', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-11 00:06:21\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(81, 19, 'User Crafty Dev has updated their profile information', '2025-09-20 10:15:57', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-20 10:15:57\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(82, 20, 'User Issa Adams has updated their profile information', '2025-09-20 10:26:27', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-20 10:26:27\"}', 'java-backend', NULL, NULL, NULL, 'USER', '20', 'success', '2026-01-28 16:35:09'),
(83, 20, 'User Issa Adams has updated their profile information', '2025-09-20 10:26:36', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-20 10:26:36\"}', 'java-backend', NULL, NULL, NULL, 'USER', '20', 'success', '2026-01-28 16:35:09'),
(84, 21, 'User Albertine Wilson has updated their profile information', '2025-09-20 10:52:18', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-20 10:52:18\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(85, 21, 'User Albertine Wilson has updated their profile information', '2025-09-20 10:52:27', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-20 10:52:27\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(86, 21, 'User Albertine Wilson has updated their profile information', '2025-09-20 10:53:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-20 10:53:19\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(87, 21, 'User Albertine Wilson has updated their profile information', '2025-09-20 11:06:41', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-20 11:06:41\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(88, 19, 'User Crafty Dev has updated their profile information', '2025-09-20 11:06:59', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-20 11:06:59\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(89, 21, 'User Albertine Wilson has updated their profile information', '2025-09-20 11:14:46', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-20 11:14:46\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(90, 21, 'User Albertine Wilson has updated their profile information', '2025-09-20 12:14:07', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-20 12:14:07\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(91, 21, 'User Albertine Wilson has updated their profile information', '2025-09-22 18:07:14', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-22 18:07:14\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(92, 21, 'User Albertine Wilson has updated their profile information', '2025-09-22 18:07:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-22 18:07:24\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(93, 21, 'User Albertine Wilson has updated their profile information', '2025-09-22 19:11:05', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-22 19:11:05\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(94, 21, 'User Albertine Wilson has updated their profile information', '2025-09-24 13:58:37', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-24 13:58:37\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(95, 21, 'User Albertine Wilson has updated their profile information', '2025-09-24 15:17:07', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-24 15:17:07\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(96, 21, 'User Albertine Wilson has updated their profile information', '2025-10-05 19:51:22', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-05 19:51:22\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(97, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 00:15:08', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 00:15:08\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(98, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 02:02:11', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 02:02:11\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(99, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 12:45:47', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 12:45:47\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(100, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 14:01:32', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 14:01:32\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(101, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 15:48:48', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 15:48:48\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(102, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 16:00:13', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 16:00:13\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(103, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 16:25:14', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 16:25:14\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(104, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 16:46:31', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 16:46:31\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(105, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 16:46:38', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 16:46:38\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(106, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 18:56:53', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 18:56:53\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(107, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 18:56:56', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 18:56:56\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(108, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 18:57:33', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 18:57:33\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(109, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 18:57:35', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 18:57:35\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(110, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 18:57:36', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 18:57:36\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(111, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 19:07:34', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 19:07:34\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(112, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 19:07:36', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 19:07:36\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(113, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 19:07:37', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 19:07:37\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(114, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 19:07:38', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 19:07:38\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(115, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 19:08:50', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 19:08:50\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(116, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 19:13:35', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 19:13:35\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(117, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 19:15:59', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 19:15:59\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(118, 20, 'User Issa Adams has updated their profile information', '2025-10-06 19:17:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 19:17:19\"}', 'java-backend', NULL, NULL, NULL, 'USER', '20', 'success', '2026-01-28 16:35:09'),
(119, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 19:17:32', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 19:17:32\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(120, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 19:17:41', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 19:17:41\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(121, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 19:18:31', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 19:18:31\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(122, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 19:18:48', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 19:18:48\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(123, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 19:19:25', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 19:19:25\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(124, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 19:19:52', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 19:19:52\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(125, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 19:22:00', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 19:22:00\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(126, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 19:22:12', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 19:22:12\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(127, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 20:35:59', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 20:35:59\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(128, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 21:46:31', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 21:46:31\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(129, 21, 'User Albertine Wilson has updated their profile information', '2025-10-07 13:28:27', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-07 13:28:27\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(130, 21, 'User Albertine Wilson has updated their profile information', '2025-10-07 16:03:28', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-07 16:03:28\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(131, 21, 'User Albertine Wilson has updated their profile information', '2025-10-07 17:13:30', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-07 17:13:30\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(132, 21, 'User Albertine Wilson has updated their profile information', '2025-10-08 08:48:47', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-08 08:48:47\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(133, 21, 'User Albertine Wilson has updated their profile information', '2025-10-08 09:09:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-08 09:09:24\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(134, 21, 'User Albertine Wilson has updated their profile information', '2025-10-08 09:09:55', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-08 09:09:55\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(135, 21, 'User Albertine Wilson has updated their profile information', '2025-10-09 18:19:45', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-09 18:19:45\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(136, 21, 'User Albertine Wilson has updated their profile information', '2025-10-09 18:19:49', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-09 18:19:49\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(137, 21, 'User Albertine Wilson has updated their profile information', '2025-10-09 18:20:10', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-09 18:20:10\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(138, 21, 'User Albertine Wilson has updated their profile information', '2025-10-09 18:22:42', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-09 18:22:42\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(139, 21, 'User Albertine Wilson has updated their profile information', '2025-10-09 18:22:50', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-09 18:22:50\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(140, 21, 'User Albertine Wilson has updated their profile information', '2025-10-09 18:23:01', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-09 18:23:01\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(141, 21, 'User Albertine Wilson has updated their profile information', '2025-10-09 18:24:28', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-09 18:24:28\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(142, 21, 'User Albertine Wilson has updated their profile information', '2025-10-09 18:24:36', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-09 18:24:36\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(143, 21, 'User Albertine Wilson has updated their profile information', '2025-10-09 18:24:52', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-09 18:24:52\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(144, 21, 'User Albertine Wilson has updated their profile information', '2025-10-09 18:25:36', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-09 18:25:36\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(145, 21, 'User Albertine Wilson has updated their profile information', '2025-10-09 18:25:52', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-09 18:25:52\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(146, 21, 'User Albertine Wilson has updated their profile information', '2025-10-09 18:26:04', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-09 18:26:04\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(147, 21, 'User Albertine Wilson has updated their profile information', '2025-10-09 18:26:11', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-09 18:26:11\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(148, 21, 'User Albertine Wilson has updated their profile information', '2025-10-09 18:26:33', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-09 18:26:33\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(149, 21, 'User Albertine Wilson has updated their profile information', '2025-10-09 18:27:01', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-09 18:27:01\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(150, 21, 'User Albertine Wilson has updated their profile information', '2025-10-09 18:27:33', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-09 18:27:33\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(151, 21, 'User Albertine Wilson has updated their profile information', '2025-10-10 16:55:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-10 16:55:19\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(152, 21, 'User Albertine Wilson has updated their profile information', '2025-10-19 21:43:51', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-19 21:43:51\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(153, 21, 'User Albertine Wilson has updated their profile information', '2025-10-19 21:55:08', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-19 21:55:08\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(154, 21, 'User Albertine Wilson has updated their profile information', '2025-10-23 02:35:34', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-23 02:35:34\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(155, 21, 'User Albertine Wilson has updated their profile information', '2025-10-23 03:40:09', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-23 03:40:09\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(156, 21, 'User Albertine Wilson has updated their profile information', '2025-11-12 20:37:48', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-12 20:37:48\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(157, 21, 'User Albertine Wilson has updated their profile information', '2025-11-12 21:38:07', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-12 21:38:07\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(158, 21, 'User Albertine Wilson has updated their profile information', '2025-11-12 23:04:04', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-12 23:04:04\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(159, 21, 'User Albertine Wilson has updated their profile information', '2025-11-13 14:04:20', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-13 14:04:20\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(160, 21, 'User Albertine Wilson has updated their profile information', '2025-11-15 00:35:47', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-15 00:35:47\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(161, 21, 'User Albertine Wilson has updated their profile information', '2025-11-18 13:09:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-18 13:09:24\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(162, 21, 'User Albertine Wilson has updated their profile information', '2025-11-18 13:53:22', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-18 13:53:22\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(163, 21, 'User Albertine Wilson has updated their profile information', '2025-11-19 09:04:08', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-19 09:04:08\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(164, 21, 'User Albertine Wilson has updated their profile information', '2025-11-19 10:18:39', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-19 10:18:39\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(165, 21, 'User Albertine Wilson has updated their profile information', '2025-11-19 11:55:29', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-19 11:55:29\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(166, 21, 'User Albertine Wilson has updated their profile information', '2025-11-20 13:41:54', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-20 13:41:54\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(167, 21, 'User Albertine Wilson has updated their profile information', '2025-11-20 14:42:50', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-20 14:42:50\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(168, 21, 'User Albertine Wilson has updated their profile information', '2025-11-20 18:08:32', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-20 18:08:32\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(169, 1, 'User Crafty Dev has updated their profile information', '2025-11-29 07:55:04', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 07:55:04\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(170, 2, 'User Garrison Sayor has updated their profile information', '2025-11-29 07:55:28', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 07:55:28\"}', 'java-backend', NULL, NULL, NULL, 'USER', '2', 'success', '2026-01-28 16:35:09'),
(171, 3, 'User Christopher Leabon has updated their profile information', '2025-11-29 07:57:42', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 07:57:42\"}', 'java-backend', NULL, NULL, NULL, 'USER', '3', 'success', '2026-01-28 16:35:09'),
(172, 4, 'User George Kona has updated their profile information', '2025-11-29 07:57:53', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 07:57:53\"}', 'java-backend', NULL, NULL, NULL, 'USER', '4', 'success', '2026-01-28 16:35:09'),
(173, 5, 'User Thomas Sneh has updated their profile information', '2025-11-29 07:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 07:58:03\"}', 'java-backend', NULL, NULL, NULL, 'USER', '5', 'success', '2026-01-28 16:35:09'),
(174, 6, 'User Jennifer Davis has updated their profile information', '2025-11-29 07:58:09', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 07:58:09\"}', 'java-backend', NULL, NULL, NULL, 'USER', '6', 'success', '2026-01-28 16:35:09'),
(175, 7, 'User Robert Wilson has updated their profile information', '2025-11-29 07:58:14', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 07:58:14\"}', 'java-backend', NULL, NULL, NULL, 'USER', '7', 'success', '2026-01-28 16:35:09'),
(176, 8, 'User Amanda Brown has updated their profile information', '2025-11-29 07:58:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 07:58:19\"}', 'java-backend', NULL, NULL, NULL, 'USER', '8', 'success', '2026-01-28 16:35:09'),
(177, 9, 'User John Doe has updated their profile information', '2025-11-29 07:58:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 07:58:24\"}', 'java-backend', NULL, NULL, NULL, 'USER', '9', 'success', '2026-01-28 16:35:09'),
(178, 10, 'User Jane Smith has updated their profile information', '2025-11-29 07:58:30', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 07:58:30\"}', 'java-backend', NULL, NULL, NULL, 'USER', '10', 'success', '2026-01-28 16:35:09'),
(179, 11, 'User Mark Jones has updated their profile information', '2025-11-29 07:58:36', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 07:58:36\"}', 'java-backend', NULL, NULL, NULL, 'USER', '11', 'success', '2026-01-28 16:35:09');
INSERT INTO `audit_logs_archive` (`id`, `user_id`, `action`, `timestamp`, `details`, `service_name`, `ip_address`, `request_id`, `session_id`, `entity_type`, `entity_id`, `result`, `archived_at`) VALUES
(180, 12, 'User Emily White has updated their profile information', '2025-11-29 07:58:41', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 07:58:41\"}', 'java-backend', NULL, NULL, NULL, 'USER', '12', 'success', '2026-01-28 16:35:09'),
(181, 13, 'User Alex Green has updated their profile information', '2025-11-29 07:58:46', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 07:58:46\"}', 'java-backend', NULL, NULL, NULL, 'USER', '13', 'success', '2026-01-28 16:35:09'),
(182, 14, 'User Maria Garcia has updated their profile information', '2025-11-29 07:58:51', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 07:58:51\"}', 'java-backend', NULL, NULL, NULL, 'USER', '14', 'success', '2026-01-28 16:35:09'),
(183, 15, 'User Chris Taylor has updated their profile information', '2025-11-29 07:59:07', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 07:59:07\"}', 'java-backend', NULL, NULL, NULL, 'USER', '15', 'success', '2026-01-28 16:35:09'),
(184, 19, 'User Crafty Dev has updated their profile information', '2025-11-29 07:59:12', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 07:59:12\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(185, 20, 'User Issa Adams has updated their profile information', '2025-11-29 07:59:18', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 07:59:18\"}', 'java-backend', NULL, NULL, NULL, 'USER', '20', 'success', '2026-01-28 16:35:09'),
(186, 2, 'User Garrison Sayor has updated their profile information', '2025-11-29 08:09:09', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 08:09:09\"}', 'java-backend', NULL, NULL, NULL, 'USER', '2', 'success', '2026-01-28 16:35:09'),
(187, 1, 'User Crafty Dev has updated their profile information', '2025-11-29 08:10:18', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 08:10:18\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(188, 1, 'User Crafty Dev has updated their profile information', '2025-11-30 14:04:32', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-30 14:04:32\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(189, 1, 'User Crafty Dev has updated their profile information', '2025-11-30 14:04:58', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-30 14:04:58\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(190, 1, 'User Crafty Dev has updated their profile information', '2025-11-30 14:05:05', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-30 14:05:05\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(191, 1, 'User Crafty Dev has updated their profile information', '2025-11-30 14:07:56', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-30 14:07:56\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(192, 1, 'User Crafty Dev has updated their profile information', '2025-11-30 14:13:01', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-30 14:13:01\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(193, 1, 'User Crafty Dev has updated their profile information', '2025-11-30 14:13:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-30 14:13:24\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(194, 1, 'User Crafty Dev has updated their profile information', '2025-11-30 14:15:06', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-30 14:15:06\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(195, 1, 'User Crafty Dev has updated their profile information', '2025-12-01 09:42:28', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-01 09:42:28\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(196, 1, 'User Crafty Dev has updated their profile information', '2025-12-01 15:59:39', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-01 15:59:39\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(197, 1, 'User Crafty Dev has updated their profile information', '2025-12-01 16:21:18', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-01 16:21:18\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(198, 1, 'User Crafty Dev has updated their profile information', '2025-12-01 22:27:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-01 22:27:19\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(199, 1, 'User Crafty Dev has updated their profile information', '2025-12-01 22:40:41', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-01 22:40:41\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(200, 1, 'User Crafty Dev has updated their profile information', '2025-12-01 23:18:23', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-01 23:18:23\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(201, 1, 'User Crafty Dev has updated their profile information', '2025-12-02 13:35:52', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-02 13:35:52\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(202, 1, 'User Crafty Dev has updated their profile information', '2025-12-05 07:41:49', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-05 07:41:49\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(203, 1, 'User Crafty Dev has updated their profile information', '2025-12-05 08:19:06', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-05 08:19:06\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(204, 1, 'User Crafty Dev has updated their profile information', '2025-12-05 10:25:21', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-05 10:25:21\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(205, 1, 'User Crafty Dev has updated their profile information', '2025-12-07 19:51:44', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-07 19:51:44\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(206, 1, 'User Crafty Dev has updated their profile information', '2025-12-09 18:47:45', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-09 18:47:45\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(207, 1, 'User Crafty Dev has updated their profile information', '2025-12-09 18:53:51', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-09 18:53:51\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(208, 1, 'User Crafty Dev has updated their profile information', '2025-12-10 19:21:52', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-10 19:21:52\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(209, 2, 'User Garrison Sayor has updated their profile information', '2025-12-10 21:33:17', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-10 21:33:17\"}', 'java-backend', NULL, NULL, NULL, 'USER', '2', 'success', '2026-01-28 16:35:09'),
(210, 1, 'User Crafty Dev has updated their profile information', '2025-12-18 11:29:13', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 11:29:13\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(211, 1, 'User Crafty Dev has updated their profile information', '2025-12-18 13:06:47', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 13:06:47\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(212, 1, 'User Crafty Dev has updated their profile information', '2025-12-18 13:27:00', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 13:27:00\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(213, 1, 'User Crafty Dev has updated their profile information', '2025-12-18 13:29:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 13:29:26\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(214, 1, 'User Crafty Dev has updated their profile information', '2025-12-18 13:39:01', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 13:39:01\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(215, 1, 'User Crafty Dev has updated their profile information', '2025-12-18 13:53:48', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 13:53:48\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(216, 1, 'User Crafty Dev has updated their profile information', '2025-12-18 14:14:52', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 14:14:52\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(217, 1, 'User Crafty Dev has updated their profile information', '2025-12-18 14:55:01', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 14:55:01\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(218, 1, 'User Crafty Dev has updated their profile information', '2025-12-18 16:48:21', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 16:48:21\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(219, 1, 'User Crafty Dev has updated their profile information', '2025-12-18 17:24:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 17:24:24\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(220, 1, 'User Crafty Dev has updated their profile information', '2025-12-18 17:27:33', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 17:27:33\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(221, 19, 'User Crafty Dev has updated their profile information', '2025-12-18 17:43:46', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 17:43:46\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(222, 2, 'User Garrison Sayor has updated their profile information', '2025-12-18 17:59:01', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 17:59:01\"}', 'java-backend', NULL, NULL, NULL, 'USER', '2', 'success', '2026-01-28 16:35:09'),
(223, 2, 'User Garrison Sayor has updated their profile information', '2025-12-18 18:00:48', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 18:00:48\"}', 'java-backend', NULL, NULL, NULL, 'USER', '2', 'success', '2026-01-28 16:35:09'),
(224, 2, 'User Garrison Sayor has updated their profile information', '2025-12-18 18:03:12', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 18:03:12\"}', 'java-backend', NULL, NULL, NULL, 'USER', '2', 'success', '2026-01-28 16:35:09'),
(225, 3, 'User Christopher Leabon has updated their profile information', '2025-12-18 18:57:39', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 18:57:39\"}', 'java-backend', NULL, NULL, NULL, 'USER', '3', 'success', '2026-01-28 16:35:09'),
(226, 2, 'User Garrison Sayor has updated their profile information', '2025-12-18 18:58:52', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 18:58:52\"}', 'java-backend', NULL, NULL, NULL, 'USER', '2', 'success', '2026-01-28 16:35:09'),
(227, 1, 'User Crafty Dev has updated their profile information', '2025-12-18 19:20:32', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 19:20:32\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(228, 1, 'User Crafty Dev has updated their profile information', '2025-12-18 19:21:32', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 19:21:32\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(229, 2, 'User Garrison Sayor has updated their profile information', '2025-12-18 19:23:34', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 19:23:34\"}', 'java-backend', NULL, NULL, NULL, 'USER', '2', 'success', '2026-01-28 16:35:09'),
(230, 1, 'User Crafty Dev has updated their profile information', '2025-12-29 13:22:20', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-29 13:22:20\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(231, 3, 'User Christopher Leabon has updated their profile information', '2025-12-29 13:59:25', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-29 13:59:25\"}', 'java-backend', NULL, NULL, NULL, 'USER', '3', 'success', '2026-01-28 16:35:09'),
(232, 1, 'User Crafty Dev has updated their profile information', '2025-12-29 14:18:35', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-29 14:18:35\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(233, 2, 'User Garrison Sayor has updated their profile information', '2025-12-29 14:25:22', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-29 14:25:22\"}', 'java-backend', NULL, NULL, NULL, 'USER', '2', 'success', '2026-01-28 16:35:09'),
(234, 1, 'User Crafty Dev has updated their profile information', '2025-12-29 14:42:27', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-29 14:42:27\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(235, 1, 'User Crafty Dev has updated their profile information', '2025-12-29 15:06:50', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-29 15:06:50\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(236, 1, 'User Crafty Dev has updated their profile information', '2025-12-29 15:13:05', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-29 15:13:05\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(237, 1, 'User Crafty Dev has updated their profile information', '2025-12-29 15:47:49', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-29 15:47:49\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(238, 2, 'User Garrison Sayor has updated their profile information', '2025-12-29 15:50:41', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-29 15:50:41\"}', 'java-backend', NULL, NULL, NULL, 'USER', '2', 'success', '2026-01-28 16:35:09'),
(239, 1, 'User Crafty Dev has updated their profile information', '2026-01-08 05:49:20', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-08 05:49:20\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(240, 1, 'User Crafty Dev has updated their profile information', '2026-01-11 15:15:47', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-11 15:15:47\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(241, 23, 'User Crayton Kamara has updated their profile information', '2026-01-11 21:06:01', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-11 21:06:01\"}', 'java-backend', NULL, NULL, NULL, 'USER', '23', 'success', '2026-01-28 16:35:09'),
(242, 23, 'User Crayton Kamara has updated their profile information', '2026-01-11 21:14:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-11 21:14:26\"}', 'java-backend', NULL, NULL, NULL, 'USER', '23', 'success', '2026-01-28 16:35:09'),
(243, 23, 'User Crayton Kamara has updated their profile information', '2026-01-11 21:28:05', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-11 21:28:05\"}', 'java-backend', NULL, NULL, NULL, 'USER', '23', 'success', '2026-01-28 16:35:09'),
(244, 23, 'User Crayton Kamara has updated their profile information', '2026-01-11 21:53:15', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-11 21:53:15\"}', 'java-backend', NULL, NULL, NULL, 'USER', '23', 'success', '2026-01-28 16:35:09'),
(245, 23, 'User Crayton Kamara has updated their profile information', '2026-01-11 22:29:13', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-11 22:29:13\"}', 'java-backend', NULL, NULL, NULL, 'USER', '23', 'success', '2026-01-28 16:35:09'),
(246, 23, 'User Crayton Kamara has updated their profile information', '2026-01-11 22:38:38', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-11 22:38:38\"}', 'java-backend', NULL, NULL, NULL, 'USER', '23', 'success', '2026-01-28 16:35:09'),
(247, 23, 'User Crayton Kamara has updated their profile information', '2026-01-11 22:49:17', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-11 22:49:17\"}', 'java-backend', NULL, NULL, NULL, 'USER', '23', 'success', '2026-01-28 16:35:09'),
(248, 1, 'User Crafty Dev has updated their profile information', '2026-01-12 00:13:32', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-12 00:13:32\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(249, 1, 'User Crafty Dev has updated their profile information', '2026-01-13 02:51:06', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-13 02:51:06\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(250, 1, 'User Crafty Dev has updated their profile information', '2026-01-13 15:42:17', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-13 15:42:17\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(251, 1, 'User Crafty Dev has updated their profile information', '2026-01-13 21:58:44', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-13 21:58:44\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(252, 1, 'User Crafty Dev has updated their profile information', '2026-01-13 21:59:39', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-13 21:59:39\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(253, 1, 'User Crafty Dev has updated their profile information', '2026-01-13 22:00:06', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-13 22:00:06\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(254, 1, 'User Crafty Dev has updated their profile information', '2026-01-13 22:04:10', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-13 22:04:10\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(255, 1, 'User Crafty Dev has updated their profile information', '2026-01-13 22:04:41', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-13 22:04:41\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(256, 1, 'User Crafty Dev has updated their profile information', '2026-01-13 22:10:55', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-13 22:10:55\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(257, 1, 'User Crafty Dev has updated their profile information', '2026-01-13 22:12:45', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-13 22:12:45\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(258, 1, 'EMPLOYEE_UPDATED', '2026-01-13 22:12:45', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-13 22:12:45\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(259, 1, 'User Crafty Dev has updated their profile information', '2026-01-13 22:12:53', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-13 22:12:53\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(260, 1, 'EMPLOYEE_UPDATED', '2026-01-13 22:12:53', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-13 22:12:53\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(261, 1, 'User Crafty Dev has updated their profile information', '2026-01-16 17:05:02', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-16 17:05:02\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(262, 1, 'User Crafty Dev has updated their profile information', '2026-01-16 17:09:08', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-16 17:09:08\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(263, 1, 'User Crafty Dev has updated their profile information', '2026-01-16 17:12:27', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-16 17:12:27\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(264, 1, 'User Crafty Dev has updated their profile information', '2026-01-16 17:20:39', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-16 17:20:39\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(265, 1, 'User Crafty Dev has updated their profile information', '2026-01-16 17:27:21', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-16 17:27:21\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(266, 1, 'User Crafty Dev has updated their profile information', '2026-01-16 17:29:02', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-16 17:29:02\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(267, 1, 'User Crafty Dev has updated their profile information', '2026-01-16 17:29:16', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-16 17:29:16\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(268, 1, 'User Crafty Dev has updated their profile information', '2026-01-16 17:29:32', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-16 17:29:32\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(269, 1, 'User Crafty Dev has updated their profile information', '2026-01-16 17:30:04', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-16 17:30:04\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(270, 1, 'Employee Updated Their Profile Info', '2026-01-16 17:30:04', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-16 17:30:04\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(271, 1, 'User Crafty Dev has updated their profile information', '2026-01-16 17:30:40', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-16 17:30:40\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(272, 1, 'User Crafty Dev has updated their profile information', '2026-01-17 20:44:00', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-17 20:44:00\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(273, 1, 'User Crafty Dev has updated their profile information', '2026-01-17 20:44:43', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-17 20:44:43\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(274, 1, 'User Crafty Dev has updated their profile information', '2026-01-17 20:56:48', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-17 20:56:48\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(275, 1, 'User Crafty Dev has updated their profile information', '2026-01-17 21:01:17', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-17 21:01:17\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(276, NULL, 'UPDATE_BUDGET', '2026-01-18 13:06:04', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 13:06:04\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(277, NULL, 'UPDATE_BUDGET', '2026-01-18 13:11:43', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 13:11:43\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(278, NULL, 'UPDATE_BUDGET', '2026-01-18 13:18:36', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 13:18:36\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(279, NULL, 'UPDATE_BUDGET', '2026-01-18 13:18:49', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 13:18:49\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(280, NULL, 'UPDATE_BUDGET', '2026-01-18 13:19:22', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 13:19:22\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(281, NULL, 'UPDATE_BUDGET', '2026-01-18 13:19:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 13:19:24\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(282, 1, 'User Crafty Dev has updated their profile information', '2026-01-18 13:24:36', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 13:24:36\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(283, 1, 'User Crafty Dev has updated their profile information', '2026-01-18 13:40:33', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 13:40:33\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(284, 1, 'CREATE_BUDGET', '2026-01-18 13:55:45', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 13:55:45\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(285, 1, 'CREATE_BUDGET', '2026-01-18 13:55:45', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 13:55:45\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(286, 1, 'CREATE_BUDGET', '2026-01-18 13:55:45', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 13:55:45\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(287, 1, 'CREATE_BUDGET', '2026-01-18 13:55:45', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 13:55:45\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(288, 1, 'CREATE_BUDGET', '2026-01-18 13:56:32', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 13:56:32\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(289, 1, 'CREATE_BUDGET', '2026-01-18 13:56:32', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 13:56:32\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(290, 1, 'CREATE_BUDGET', '2026-01-18 13:56:32', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 13:56:32\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(291, 1, 'CREATE_BUDGET', '2026-01-18 13:56:32', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 13:56:32\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(292, 1, 'CREATE_BUDGET', '2026-01-18 14:21:52', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 14:21:52\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(293, NULL, 'UPDATE_BUDGET', '2026-01-18 14:23:37', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 14:23:37\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(294, NULL, 'CREATE_BUDGET_REQUEST', '2026-01-18 15:20:34', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 15:20:34\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(295, 1, 'CREATE_BUDGET', '2026-01-18 15:21:00', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 15:21:00\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(296, 1, 'User Crafty Dev has updated their profile information', '2026-01-19 15:42:14', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-19 15:42:14\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(297, 1, 'User Crafty Dev has updated their profile information', '2026-01-19 22:46:22', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-19 22:46:22\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(298, 1, 'Employee Updated Their Profile Info', '2026-01-19 22:46:22', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-19 22:46:22\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(299, 1, 'User Crafty Dev has updated their profile information', '2026-01-19 22:46:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-19 22:46:24\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(300, 1, 'Employee Updated Their Profile Info', '2026-01-19 22:46:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-19 22:46:24\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(301, NULL, 'CREATE_ACCOUNT_PAYABLE', '2026-01-20 09:55:41', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 09:55:41\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(302, NULL, 'CREATE_ACCOUNT_RECEIVABLE', '2026-01-20 10:05:38', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 10:05:38\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(303, NULL, 'UPDATE_ACCOUNT_RECEIVABLE', '2026-01-20 10:11:35', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 10:11:35\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(304, NULL, 'UPDATE_ACCOUNT_PAYABLE', '2026-01-20 10:12:31', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 10:12:31\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(305, NULL, 'UPDATE_ACCOUNT_PAYABLE', '2026-01-20 10:15:05', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 10:15:05\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(306, 1, 'User Crafty Dev has updated their profile information', '2026-01-20 15:34:50', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:34:50\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(307, 1, 'User Crafty Dev has updated their profile information', '2026-01-20 15:35:55', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:35:55\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(308, 1, 'User Crafty Dev has updated their profile information', '2026-01-20 15:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(309, 2, 'User Garrison Sayor has updated their profile information', '2026-01-20 15:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', NULL, NULL, NULL, NULL, 'USER', '2', 'success', '2026-01-28 16:35:09'),
(310, 3, 'User Christopher Leabon has updated their profile information', '2026-01-20 15:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', NULL, NULL, NULL, NULL, 'USER', '3', 'success', '2026-01-28 16:35:09'),
(311, 4, 'User George Kona has updated their profile information', '2026-01-20 15:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', NULL, NULL, NULL, NULL, 'USER', '4', 'success', '2026-01-28 16:35:09'),
(312, 5, 'User Thomas Sneh has updated their profile information', '2026-01-20 15:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', NULL, NULL, NULL, NULL, 'USER', '5', 'success', '2026-01-28 16:35:09'),
(313, 6, 'User Jennifer Davis has updated their profile information', '2026-01-20 15:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', NULL, NULL, NULL, NULL, 'USER', '6', 'success', '2026-01-28 16:35:09'),
(314, 7, 'User Robert Wilson has updated their profile information', '2026-01-20 15:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', NULL, NULL, NULL, NULL, 'USER', '7', 'success', '2026-01-28 16:35:09'),
(315, 8, 'User Amanda Brown has updated their profile information', '2026-01-20 15:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', NULL, NULL, NULL, NULL, 'USER', '8', 'success', '2026-01-28 16:35:09'),
(316, 9, 'User John Doe has updated their profile information', '2026-01-20 15:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', NULL, NULL, NULL, NULL, 'USER', '9', 'success', '2026-01-28 16:35:09'),
(317, 10, 'User Jane Smith has updated their profile information', '2026-01-20 15:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', NULL, NULL, NULL, NULL, 'USER', '10', 'success', '2026-01-28 16:35:09'),
(318, 11, 'User Mark Jones has updated their profile information', '2026-01-20 15:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', NULL, NULL, NULL, NULL, 'USER', '11', 'success', '2026-01-28 16:35:09'),
(319, 12, 'User Emily White has updated their profile information', '2026-01-20 15:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', NULL, NULL, NULL, NULL, 'USER', '12', 'success', '2026-01-28 16:35:09'),
(320, 13, 'User Alex Green has updated their profile information', '2026-01-20 15:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', NULL, NULL, NULL, NULL, 'USER', '13', 'success', '2026-01-28 16:35:09'),
(321, 14, 'User Maria Garcia has updated their profile information', '2026-01-20 15:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', NULL, NULL, NULL, NULL, 'USER', '14', 'success', '2026-01-28 16:35:09'),
(322, 15, 'User Chris Taylor has updated their profile information', '2026-01-20 15:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', NULL, NULL, NULL, NULL, 'USER', '15', 'success', '2026-01-28 16:35:09'),
(323, 19, 'User Crafty Dev has updated their profile information', '2026-01-20 15:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', NULL, NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(324, 20, 'User Issa Adams has updated their profile information', '2026-01-20 15:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', NULL, NULL, NULL, NULL, 'USER', '20', 'success', '2026-01-28 16:35:09'),
(325, 21, 'User Albertine Wilson has updated their profile information', '2026-01-20 15:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', NULL, NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(326, 23, 'User Crayton Kamara has updated their profile information', '2026-01-20 15:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', NULL, NULL, NULL, NULL, 'USER', '23', 'success', '2026-01-28 16:35:09'),
(327, 1, 'User Crafty Dev has updated their profile information', '2026-01-20 15:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(328, 2, 'User Garrison Sayor has updated their profile information', '2026-01-20 15:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', NULL, NULL, NULL, NULL, 'USER', '2', 'success', '2026-01-28 16:35:09'),
(329, 3, 'User Christopher Leabon has updated their profile information', '2026-01-20 15:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', NULL, NULL, NULL, NULL, 'USER', '3', 'success', '2026-01-28 16:35:09'),
(330, 4, 'User George Kona has updated their profile information', '2026-01-20 15:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', NULL, NULL, NULL, NULL, 'USER', '4', 'success', '2026-01-28 16:35:09'),
(331, 5, 'User Thomas Sneh has updated their profile information', '2026-01-20 15:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', NULL, NULL, NULL, NULL, 'USER', '5', 'success', '2026-01-28 16:35:09'),
(332, 6, 'User Jennifer Davis has updated their profile information', '2026-01-20 15:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', NULL, NULL, NULL, NULL, 'USER', '6', 'success', '2026-01-28 16:35:09'),
(333, 7, 'User Robert Wilson has updated their profile information', '2026-01-20 15:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', NULL, NULL, NULL, NULL, 'USER', '7', 'success', '2026-01-28 16:35:09'),
(334, 8, 'User Amanda Brown has updated their profile information', '2026-01-20 15:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', NULL, NULL, NULL, NULL, 'USER', '8', 'success', '2026-01-28 16:35:09'),
(335, 9, 'User John Doe has updated their profile information', '2026-01-20 15:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', NULL, NULL, NULL, NULL, 'USER', '9', 'success', '2026-01-28 16:35:09'),
(336, 10, 'User Jane Smith has updated their profile information', '2026-01-20 15:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', NULL, NULL, NULL, NULL, 'USER', '10', 'success', '2026-01-28 16:35:09'),
(337, 11, 'User Mark Jones has updated their profile information', '2026-01-20 15:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', NULL, NULL, NULL, NULL, 'USER', '11', 'success', '2026-01-28 16:35:09'),
(338, 12, 'User Emily White has updated their profile information', '2026-01-20 15:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', NULL, NULL, NULL, NULL, 'USER', '12', 'success', '2026-01-28 16:35:09'),
(339, 13, 'User Alex Green has updated their profile information', '2026-01-20 15:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', NULL, NULL, NULL, NULL, 'USER', '13', 'success', '2026-01-28 16:35:09'),
(340, 14, 'User Maria Garcia has updated their profile information', '2026-01-20 15:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', NULL, NULL, NULL, NULL, 'USER', '14', 'success', '2026-01-28 16:35:09'),
(341, 15, 'User Chris Taylor has updated their profile information', '2026-01-20 15:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', NULL, NULL, NULL, NULL, 'USER', '15', 'success', '2026-01-28 16:35:09'),
(342, 19, 'User Crafty Dev has updated their profile information', '2026-01-20 15:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', NULL, NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(343, 20, 'User Issa Adams has updated their profile information', '2026-01-20 15:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', NULL, NULL, NULL, NULL, 'USER', '20', 'success', '2026-01-28 16:35:09'),
(344, 21, 'User Albertine Wilson has updated their profile information', '2026-01-20 15:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', NULL, NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(345, 1, 'User Crafty Dev has updated their profile information', '2026-01-20 15:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(346, 2, 'User Garrison Sayor has updated their profile information', '2026-01-20 15:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', NULL, NULL, NULL, NULL, 'USER', '2', 'success', '2026-01-28 16:35:09'),
(347, 3, 'User Christopher Leabon has updated their profile information', '2026-01-20 15:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', NULL, NULL, NULL, NULL, 'USER', '3', 'success', '2026-01-28 16:35:09'),
(348, 4, 'User George Kona has updated their profile information', '2026-01-20 15:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', NULL, NULL, NULL, NULL, 'USER', '4', 'success', '2026-01-28 16:35:09'),
(349, 5, 'User Thomas Sneh has updated their profile information', '2026-01-20 15:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', NULL, NULL, NULL, NULL, 'USER', '5', 'success', '2026-01-28 16:35:09'),
(350, 6, 'User Jennifer Davis has updated their profile information', '2026-01-20 15:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', NULL, NULL, NULL, NULL, 'USER', '6', 'success', '2026-01-28 16:35:09'),
(351, 7, 'User Robert Wilson has updated their profile information', '2026-01-20 15:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', NULL, NULL, NULL, NULL, 'USER', '7', 'success', '2026-01-28 16:35:09'),
(352, 8, 'User Amanda Brown has updated their profile information', '2026-01-20 15:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', NULL, NULL, NULL, NULL, 'USER', '8', 'success', '2026-01-28 16:35:09'),
(353, 9, 'User John Doe has updated their profile information', '2026-01-20 15:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', NULL, NULL, NULL, NULL, 'USER', '9', 'success', '2026-01-28 16:35:09'),
(354, 10, 'User Jane Smith has updated their profile information', '2026-01-20 15:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', NULL, NULL, NULL, NULL, 'USER', '10', 'success', '2026-01-28 16:35:09'),
(355, 11, 'User Mark Jones has updated their profile information', '2026-01-20 15:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', NULL, NULL, NULL, NULL, 'USER', '11', 'success', '2026-01-28 16:35:09'),
(356, 12, 'User Emily White has updated their profile information', '2026-01-20 15:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', NULL, NULL, NULL, NULL, 'USER', '12', 'success', '2026-01-28 16:35:09'),
(357, 13, 'User Alex Green has updated their profile information', '2026-01-20 15:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', NULL, NULL, NULL, NULL, 'USER', '13', 'success', '2026-01-28 16:35:09'),
(358, 14, 'User Maria Garcia has updated their profile information', '2026-01-20 15:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', NULL, NULL, NULL, NULL, 'USER', '14', 'success', '2026-01-28 16:35:09'),
(359, 15, 'User Chris Taylor has updated their profile information', '2026-01-20 15:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', NULL, NULL, NULL, NULL, 'USER', '15', 'success', '2026-01-28 16:35:09'),
(360, 19, 'User Crafty Dev has updated their profile information', '2026-01-20 15:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', NULL, NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(361, 20, 'User Issa Adams has updated their profile information', '2026-01-20 15:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', NULL, NULL, NULL, NULL, 'USER', '20', 'success', '2026-01-28 16:35:09'),
(362, 21, 'User Albertine Wilson has updated their profile information', '2026-01-20 15:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', NULL, NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(363, 23, 'User Crayton Kamara has updated their profile information', '2026-01-20 15:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', NULL, NULL, NULL, NULL, 'USER', '23', 'success', '2026-01-28 16:35:09'),
(364, 1, 'User Crafty Dev has updated their profile information', '2026-01-20 15:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(365, 2, 'User Garrison Sayor has updated their profile information', '2026-01-20 15:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', NULL, NULL, NULL, NULL, 'USER', '2', 'success', '2026-01-28 16:35:09'),
(366, 3, 'User Christopher Leabon has updated their profile information', '2026-01-20 15:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', NULL, NULL, NULL, NULL, 'USER', '3', 'success', '2026-01-28 16:35:09'),
(367, 4, 'User George Kona has updated their profile information', '2026-01-20 15:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', NULL, NULL, NULL, NULL, 'USER', '4', 'success', '2026-01-28 16:35:09');
INSERT INTO `audit_logs_archive` (`id`, `user_id`, `action`, `timestamp`, `details`, `service_name`, `ip_address`, `request_id`, `session_id`, `entity_type`, `entity_id`, `result`, `archived_at`) VALUES
(368, 5, 'User Thomas Sneh has updated their profile information', '2026-01-20 15:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', NULL, NULL, NULL, NULL, 'USER', '5', 'success', '2026-01-28 16:35:09'),
(369, 6, 'User Jennifer Davis has updated their profile information', '2026-01-20 15:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', NULL, NULL, NULL, NULL, 'USER', '6', 'success', '2026-01-28 16:35:09'),
(370, 7, 'User Robert Wilson has updated their profile information', '2026-01-20 15:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', NULL, NULL, NULL, NULL, 'USER', '7', 'success', '2026-01-28 16:35:09'),
(371, 8, 'User Amanda Brown has updated their profile information', '2026-01-20 15:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', NULL, NULL, NULL, NULL, 'USER', '8', 'success', '2026-01-28 16:35:09'),
(372, 9, 'User John Doe has updated their profile information', '2026-01-20 15:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', NULL, NULL, NULL, NULL, 'USER', '9', 'success', '2026-01-28 16:35:09'),
(373, 10, 'User Jane Smith has updated their profile information', '2026-01-20 15:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', NULL, NULL, NULL, NULL, 'USER', '10', 'success', '2026-01-28 16:35:09'),
(374, 11, 'User Mark Jones has updated their profile information', '2026-01-20 15:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', NULL, NULL, NULL, NULL, 'USER', '11', 'success', '2026-01-28 16:35:09'),
(375, 12, 'User Emily White has updated their profile information', '2026-01-20 15:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', NULL, NULL, NULL, NULL, 'USER', '12', 'success', '2026-01-28 16:35:09'),
(376, 13, 'User Alex Green has updated their profile information', '2026-01-20 15:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', NULL, NULL, NULL, NULL, 'USER', '13', 'success', '2026-01-28 16:35:09'),
(377, 14, 'User Maria Garcia has updated their profile information', '2026-01-20 15:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', NULL, NULL, NULL, NULL, 'USER', '14', 'success', '2026-01-28 16:35:09'),
(378, 15, 'User Chris Taylor has updated their profile information', '2026-01-20 15:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', NULL, NULL, NULL, NULL, 'USER', '15', 'success', '2026-01-28 16:35:09'),
(379, 19, 'User Crafty Dev has updated their profile information', '2026-01-20 15:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', NULL, NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(380, 20, 'User Issa Adams has updated their profile information', '2026-01-20 15:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', NULL, NULL, NULL, NULL, 'USER', '20', 'success', '2026-01-28 16:35:09'),
(381, 21, 'User Albertine Wilson has updated their profile information', '2026-01-20 15:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', NULL, NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(382, 23, 'User Crayton Kamara has updated their profile information', '2026-01-20 15:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', NULL, NULL, NULL, NULL, 'USER', '23', 'success', '2026-01-28 16:35:09'),
(383, 1, 'User Crafty Dev has updated their profile information', '2026-01-20 15:59:40', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:59:40\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(384, NULL, 'CREATE_ACCOUNT_PAYABLE', '2026-01-20 16:02:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 16:02:24\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(385, NULL, 'UPDATE_ACCOUNT_PAYABLE', '2026-01-20 16:02:40', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 16:02:40\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(386, NULL, 'UPDATE_ACCOUNT_PAYABLE', '2026-01-20 16:10:25', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 16:10:25\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(387, NULL, 'UPDATE_ACCOUNT_PAYABLE', '2026-01-20 16:12:50', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 16:12:50\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(388, NULL, 'UPDATE_ACCOUNT_PAYABLE', '2026-01-20 16:15:42', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 16:15:42\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(389, NULL, 'UPDATE_ACCOUNT_PAYABLE', '2026-01-20 16:20:43', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 16:20:43\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(390, NULL, 'UPDATE_ACCOUNT_PAYABLE', '2026-01-20 16:21:28', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 16:21:28\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(391, NULL, 'CREATE_ACCOUNT_PAYABLE', '2026-01-20 16:34:44', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 16:34:44\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(392, NULL, 'UPDATE_ACCOUNT_PAYABLE', '2026-01-20 16:36:52', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 16:36:52\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(393, NULL, 'UPDATE_ACCOUNT_PAYABLE', '2026-01-20 16:43:54', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 16:43:54\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(1, 19, 'User Crafty Dev has updated their profile information', '2025-07-07 19:11:45', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-07 19:11:45\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(2, 19, 'User Crafty Dev has updated their profile information', '2025-07-07 19:20:22', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-07 19:20:22\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(3, 19, 'User Crafty Dev has updated their profile information', '2025-07-07 19:24:35', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-07 19:24:35\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(4, 19, 'User Crafty Dev has updated their profile information', '2025-07-07 19:30:02', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-07 19:30:02\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(5, 19, 'User Crafty Dev has updated their profile information', '2025-07-08 00:52:40', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-08 00:52:40\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(6, 19, 'User Crafty Dev has updated their profile information', '2025-07-08 00:53:32', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-08 00:53:32\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(7, 19, 'User Crafty Dev has updated their profile information', '2025-07-08 00:55:51', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-08 00:55:51\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(8, 19, 'User Crafty Dev has updated their profile information', '2025-07-08 01:09:23', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-08 01:09:23\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(9, 19, 'User Crafty Dev has updated their profile information', '2025-07-08 01:10:11', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-08 01:10:11\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(10, 19, 'User Crafty Dev has updated their profile information', '2025-07-08 01:39:42', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-08 01:39:42\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(11, 19, 'User Crafty Dev has updated their profile information', '2025-07-08 02:15:01', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-08 02:15:01\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(12, 19, 'User Crafty Dev has updated their profile information', '2025-07-08 02:15:39', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-08 02:15:39\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(13, 19, 'User Crafty Dev has updated their profile information', '2025-07-08 02:16:40', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-08 02:16:40\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(14, 19, 'User Crafty Dev has updated their profile information', '2025-07-08 02:21:17', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-08 02:21:17\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(15, 19, 'User Crafty Dev has updated their profile information', '2025-07-08 04:33:31', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-08 04:33:31\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(16, 19, 'User Crafty Dev has updated their profile information', '2025-07-08 10:12:59', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-08 10:12:59\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(17, 19, 'User Crafty Dev has updated their profile information', '2025-07-08 10:21:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-08 10:21:26\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(18, 19, 'User Crafty Dev has updated their profile information', '2025-07-08 10:24:11', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-08 10:24:11\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(19, 19, 'User Crafty Dev has updated their profile information', '2025-07-08 10:34:49', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-08 10:34:49\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(20, 19, 'User Crafty Dev has updated their profile information', '2025-07-08 11:05:51', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-08 11:05:51\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(21, 19, 'User Crafty Dev has updated their profile information', '2025-07-08 12:28:38', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-08 12:28:38\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(22, 19, 'User Crafty Dev has updated their profile information', '2025-07-09 00:35:17', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-09 00:35:17\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(23, 19, 'User Crafty Dev has updated their profile information', '2025-07-10 11:38:23', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-10 11:38:23\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(24, 19, 'User Crafty Dev has updated their profile information', '2025-07-11 00:12:55', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-11 00:12:55\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(25, 19, 'User Crafty Dev has updated their profile information', '2025-07-11 00:43:06', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-11 00:43:06\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(26, 19, 'User Crafty Dev has updated their profile information', '2025-07-11 00:50:55', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-11 00:50:55\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(27, 19, 'User Crafty Dev has updated their profile information', '2025-07-11 16:29:58', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-11 16:29:58\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(28, 19, 'User Crafty Dev has updated their profile information', '2025-07-14 21:40:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-14 21:40:19\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(29, 19, 'User Crafty Dev has updated their profile information', '2025-07-14 23:18:30', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-14 23:18:30\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(30, 19, 'User Crafty Dev has updated their profile information', '2025-07-15 01:30:34', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-15 01:30:34\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(31, 19, 'User Crafty Dev has updated their profile information', '2025-07-15 03:38:43', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-15 03:38:43\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(32, 19, 'User Crafty Dev has updated their profile information', '2025-07-15 04:50:25', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-15 04:50:25\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(33, 19, 'User Crafty Dev has updated their profile information', '2025-07-15 18:25:52', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-15 18:25:52\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(34, 20, 'User Issa Adams has updated their profile information', '2025-07-15 18:32:44', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-15 18:32:44\"}', 'java-backend', NULL, NULL, NULL, 'USER', '20', 'success', '2026-01-28 16:35:09'),
(35, 19, 'User Crafty Dev has updated their profile information', '2025-07-16 00:35:28', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-16 00:35:28\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(36, 19, 'User Crafty Dev has updated their profile information', '2025-07-16 01:37:29', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-16 01:37:29\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(37, 19, 'User Crafty Dev has updated their profile information', '2025-07-16 02:48:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-16 02:48:03\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(38, 19, 'User Crafty Dev has updated their profile information', '2025-07-16 12:14:02', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-16 12:14:02\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(39, 19, 'User Crafty Dev has updated their profile information', '2025-07-16 12:14:27', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-16 12:14:27\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(40, 19, 'User Crafty Dev has updated their profile information', '2025-07-16 12:37:42', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-16 12:37:42\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(41, 19, 'User Crafty Dev has updated their profile information', '2025-07-16 13:50:45', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-16 13:50:45\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(42, 19, 'User Crafty Dev has updated their profile information', '2025-07-16 13:59:50', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-16 13:59:50\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(43, 19, 'User Crafty Dev has updated their profile information', '2025-07-16 14:06:56', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-16 14:06:56\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(44, 19, 'User Crafty Dev has updated their profile information', '2025-07-16 14:24:40', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-16 14:24:40\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(45, 19, 'User Crafty Dev has updated their profile information', '2025-07-16 15:25:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-16 15:25:26\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(46, 19, 'User Crafty Dev has updated their profile information', '2025-07-16 16:49:33', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-16 16:49:33\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(47, 19, 'User Crafty Dev has updated their profile information', '2025-07-16 18:36:53', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-16 18:36:53\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(48, 19, 'User Crafty Dev has updated their profile information', '2025-07-24 15:51:51', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-24 15:51:51\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(49, 19, 'User Crafty Dev has updated their profile information', '2025-07-24 16:52:53', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-24 16:52:53\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(50, 19, 'User Crafty Dev has updated their profile information', '2025-07-24 17:15:05', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-24 17:15:05\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(51, 19, 'User Crafty Dev has updated their profile information', '2025-07-24 18:32:02', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-24 18:32:02\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(52, 19, 'User Crafty Dev has updated their profile information', '2025-07-24 19:47:41', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-24 19:47:41\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(53, 19, 'User Crafty Dev has updated their profile information', '2025-07-24 21:18:20', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-24 21:18:20\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(54, 19, 'User Crafty Dev has updated their profile information', '2025-07-24 22:22:04', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-24 22:22:04\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(55, 19, 'User Crafty Dev has updated their profile information', '2025-07-30 13:39:14', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-30 13:39:14\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(56, 19, 'User Crafty Dev has updated their profile information', '2025-07-30 17:01:48', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-30 17:01:48\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(57, 19, 'User Crafty Dev has updated their profile information', '2025-07-30 19:03:01', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-30 19:03:01\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(58, 19, 'User Crafty Dev has updated their profile information', '2025-08-01 15:34:06', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-08-01 15:34:06\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(59, 19, 'User Crafty Dev has updated their profile information', '2025-08-08 04:17:11', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-08-08 04:17:11\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(60, 19, 'User Crafty Dev has updated their profile information', '2025-08-08 05:07:09', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-08-08 05:07:09\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(61, 19, 'User Crafty Dev has updated their profile information', '2025-08-08 06:27:05', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-08-08 06:27:05\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(62, 19, 'User Crafty Dev has updated their profile information', '2025-09-01 22:03:59', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-01 22:03:59\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(63, 20, 'User Issa Adams has updated their profile information', '2025-09-01 22:08:43', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-01 22:08:43\"}', 'java-backend', NULL, NULL, NULL, 'USER', '20', 'success', '2026-01-28 16:35:09'),
(64, 20, 'User Issa Adams has updated their profile information', '2025-09-02 01:56:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-02 01:56:03\"}', 'java-backend', NULL, NULL, NULL, 'USER', '20', 'success', '2026-01-28 16:35:09'),
(65, 19, 'User Crafty Dev has updated their profile information', '2025-09-02 02:21:55', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-02 02:21:55\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(66, 20, 'User Issa Adams has updated their profile information', '2025-09-02 02:21:55', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-02 02:21:55\"}', 'java-backend', NULL, NULL, NULL, 'USER', '20', 'success', '2026-01-28 16:35:09'),
(67, 20, 'User Issa Adams has updated their profile information', '2025-09-02 02:57:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-02 02:57:03\"}', 'java-backend', NULL, NULL, NULL, 'USER', '20', 'success', '2026-01-28 16:35:09'),
(68, 20, 'User Issa Adams has updated their profile information', '2025-09-02 03:56:50', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-02 03:56:50\"}', 'java-backend', NULL, NULL, NULL, 'USER', '20', 'success', '2026-01-28 16:35:09'),
(69, 19, 'User Crafty Dev has updated their profile information', '2025-09-02 03:59:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-02 03:59:19\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(70, 19, 'User Crafty Dev has updated their profile information', '2025-09-02 03:59:45', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-02 03:59:45\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(71, 20, 'User Issa Adams has updated their profile information', '2025-09-02 03:59:59', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-02 03:59:59\"}', 'java-backend', NULL, NULL, NULL, 'USER', '20', 'success', '2026-01-28 16:35:09'),
(72, 20, 'User Issa Adams has updated their profile information', '2025-09-02 04:03:05', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-02 04:03:05\"}', 'java-backend', NULL, NULL, NULL, 'USER', '20', 'success', '2026-01-28 16:35:09'),
(73, 20, 'User Issa Adams has updated their profile information', '2025-09-02 04:06:00', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-02 04:06:00\"}', 'java-backend', NULL, NULL, NULL, 'USER', '20', 'success', '2026-01-28 16:35:09'),
(74, 20, 'User Issa Adams has updated their profile information', '2025-09-02 05:47:08', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-02 05:47:08\"}', 'java-backend', NULL, NULL, NULL, 'USER', '20', 'success', '2026-01-28 16:35:09'),
(75, 21, 'User Albertine Wilson has updated their profile information', '2025-09-10 21:00:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-10 21:00:03\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(76, NULL, 'UPDATE', '2025-09-10 23:04:16', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-10 23:04:16\"}', 'java-backend', NULL, NULL, NULL, 'USER', NULL, 'success', '2026-01-28 16:35:09'),
(77, 23, 'User Crayton Kamara has updated their profile information', '2025-09-10 23:43:02', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-10 23:43:02\"}', 'java-backend', NULL, NULL, NULL, 'USER', '23', 'success', '2026-01-28 16:35:09'),
(78, 21, 'User Albertine Wilson has updated their profile information', '2025-09-11 00:02:47', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-11 00:02:47\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(79, 21, 'User Albertine Wilson has updated their profile information', '2025-09-11 00:06:21', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-11 00:06:21\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(80, 21, 'User Albertine Wilson has updated their profile information', '2025-09-11 00:06:21', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-11 00:06:21\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(81, 19, 'User Crafty Dev has updated their profile information', '2025-09-20 10:15:57', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-20 10:15:57\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(82, 20, 'User Issa Adams has updated their profile information', '2025-09-20 10:26:27', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-20 10:26:27\"}', 'java-backend', NULL, NULL, NULL, 'USER', '20', 'success', '2026-01-28 16:35:09'),
(83, 20, 'User Issa Adams has updated their profile information', '2025-09-20 10:26:36', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-20 10:26:36\"}', 'java-backend', NULL, NULL, NULL, 'USER', '20', 'success', '2026-01-28 16:35:09'),
(84, 21, 'User Albertine Wilson has updated their profile information', '2025-09-20 10:52:18', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-20 10:52:18\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(85, 21, 'User Albertine Wilson has updated their profile information', '2025-09-20 10:52:27', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-20 10:52:27\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(86, 21, 'User Albertine Wilson has updated their profile information', '2025-09-20 10:53:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-20 10:53:19\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(87, 21, 'User Albertine Wilson has updated their profile information', '2025-09-20 11:06:41', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-20 11:06:41\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(88, 19, 'User Crafty Dev has updated their profile information', '2025-09-20 11:06:59', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-20 11:06:59\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(89, 21, 'User Albertine Wilson has updated their profile information', '2025-09-20 11:14:46', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-20 11:14:46\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(90, 21, 'User Albertine Wilson has updated their profile information', '2025-09-20 12:14:07', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-20 12:14:07\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(91, 21, 'User Albertine Wilson has updated their profile information', '2025-09-22 18:07:14', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-22 18:07:14\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(92, 21, 'User Albertine Wilson has updated their profile information', '2025-09-22 18:07:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-22 18:07:24\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(93, 21, 'User Albertine Wilson has updated their profile information', '2025-09-22 19:11:05', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-22 19:11:05\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(94, 21, 'User Albertine Wilson has updated their profile information', '2025-09-24 13:58:37', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-24 13:58:37\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(95, 21, 'User Albertine Wilson has updated their profile information', '2025-09-24 15:17:07', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-24 15:17:07\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(96, 21, 'User Albertine Wilson has updated their profile information', '2025-10-05 19:51:22', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-05 19:51:22\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(97, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 00:15:08', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 00:15:08\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(98, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 02:02:11', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 02:02:11\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(99, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 12:45:47', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 12:45:47\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(100, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 14:01:32', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 14:01:32\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(101, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 15:48:48', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 15:48:48\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(102, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 16:00:13', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 16:00:13\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(103, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 16:25:14', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 16:25:14\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(104, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 16:46:31', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 16:46:31\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(105, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 16:46:38', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 16:46:38\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(106, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 18:56:53', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 18:56:53\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(107, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 18:56:56', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 18:56:56\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(108, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 18:57:33', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 18:57:33\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(109, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 18:57:35', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 18:57:35\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(110, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 18:57:36', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 18:57:36\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(111, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 19:07:34', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 19:07:34\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(112, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 19:07:36', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 19:07:36\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(113, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 19:07:37', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 19:07:37\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(114, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 19:07:38', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 19:07:38\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(115, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 19:08:50', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 19:08:50\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(116, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 19:13:35', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 19:13:35\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(117, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 19:15:59', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 19:15:59\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(118, 20, 'User Issa Adams has updated their profile information', '2025-10-06 19:17:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 19:17:19\"}', 'java-backend', NULL, NULL, NULL, 'USER', '20', 'success', '2026-01-28 16:35:09'),
(119, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 19:17:32', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 19:17:32\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(120, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 19:17:41', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 19:17:41\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(121, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 19:18:31', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 19:18:31\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(122, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 19:18:48', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 19:18:48\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(123, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 19:19:25', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 19:19:25\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(124, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 19:19:52', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 19:19:52\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(125, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 19:22:00', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 19:22:00\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(126, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 19:22:12', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 19:22:12\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(127, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 20:35:59', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 20:35:59\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(128, 21, 'User Albertine Wilson has updated their profile information', '2025-10-06 21:46:31', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 21:46:31\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(129, 21, 'User Albertine Wilson has updated their profile information', '2025-10-07 13:28:27', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-07 13:28:27\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(130, 21, 'User Albertine Wilson has updated their profile information', '2025-10-07 16:03:28', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-07 16:03:28\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(131, 21, 'User Albertine Wilson has updated their profile information', '2025-10-07 17:13:30', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-07 17:13:30\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(132, 21, 'User Albertine Wilson has updated their profile information', '2025-10-08 08:48:47', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-08 08:48:47\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(133, 21, 'User Albertine Wilson has updated their profile information', '2025-10-08 09:09:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-08 09:09:24\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(134, 21, 'User Albertine Wilson has updated their profile information', '2025-10-08 09:09:55', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-08 09:09:55\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(135, 21, 'User Albertine Wilson has updated their profile information', '2025-10-09 18:19:45', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-09 18:19:45\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(136, 21, 'User Albertine Wilson has updated their profile information', '2025-10-09 18:19:49', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-09 18:19:49\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(137, 21, 'User Albertine Wilson has updated their profile information', '2025-10-09 18:20:10', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-09 18:20:10\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(138, 21, 'User Albertine Wilson has updated their profile information', '2025-10-09 18:22:42', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-09 18:22:42\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(139, 21, 'User Albertine Wilson has updated their profile information', '2025-10-09 18:22:50', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-09 18:22:50\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(140, 21, 'User Albertine Wilson has updated their profile information', '2025-10-09 18:23:01', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-09 18:23:01\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(141, 21, 'User Albertine Wilson has updated their profile information', '2025-10-09 18:24:28', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-09 18:24:28\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(142, 21, 'User Albertine Wilson has updated their profile information', '2025-10-09 18:24:36', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-09 18:24:36\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(143, 21, 'User Albertine Wilson has updated their profile information', '2025-10-09 18:24:52', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-09 18:24:52\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(144, 21, 'User Albertine Wilson has updated their profile information', '2025-10-09 18:25:36', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-09 18:25:36\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(145, 21, 'User Albertine Wilson has updated their profile information', '2025-10-09 18:25:52', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-09 18:25:52\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(146, 21, 'User Albertine Wilson has updated their profile information', '2025-10-09 18:26:04', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-09 18:26:04\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(147, 21, 'User Albertine Wilson has updated their profile information', '2025-10-09 18:26:11', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-09 18:26:11\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(148, 21, 'User Albertine Wilson has updated their profile information', '2025-10-09 18:26:33', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-09 18:26:33\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(149, 21, 'User Albertine Wilson has updated their profile information', '2025-10-09 18:27:01', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-09 18:27:01\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(150, 21, 'User Albertine Wilson has updated their profile information', '2025-10-09 18:27:33', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-09 18:27:33\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(151, 21, 'User Albertine Wilson has updated their profile information', '2025-10-10 16:55:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-10 16:55:19\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(152, 21, 'User Albertine Wilson has updated their profile information', '2025-10-19 21:43:51', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-19 21:43:51\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(153, 21, 'User Albertine Wilson has updated their profile information', '2025-10-19 21:55:08', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-19 21:55:08\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(154, 21, 'User Albertine Wilson has updated their profile information', '2025-10-23 02:35:34', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-23 02:35:34\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(155, 21, 'User Albertine Wilson has updated their profile information', '2025-10-23 03:40:09', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-23 03:40:09\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09');
INSERT INTO `audit_logs_archive` (`id`, `user_id`, `action`, `timestamp`, `details`, `service_name`, `ip_address`, `request_id`, `session_id`, `entity_type`, `entity_id`, `result`, `archived_at`) VALUES
(156, 21, 'User Albertine Wilson has updated their profile information', '2025-11-12 20:37:48', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-12 20:37:48\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(157, 21, 'User Albertine Wilson has updated their profile information', '2025-11-12 21:38:07', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-12 21:38:07\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(158, 21, 'User Albertine Wilson has updated their profile information', '2025-11-12 23:04:04', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-12 23:04:04\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(159, 21, 'User Albertine Wilson has updated their profile information', '2025-11-13 14:04:20', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-13 14:04:20\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(160, 21, 'User Albertine Wilson has updated their profile information', '2025-11-15 00:35:47', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-15 00:35:47\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(161, 21, 'User Albertine Wilson has updated their profile information', '2025-11-18 13:09:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-18 13:09:24\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(162, 21, 'User Albertine Wilson has updated their profile information', '2025-11-18 13:53:22', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-18 13:53:22\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(163, 21, 'User Albertine Wilson has updated their profile information', '2025-11-19 09:04:08', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-19 09:04:08\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(164, 21, 'User Albertine Wilson has updated their profile information', '2025-11-19 10:18:39', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-19 10:18:39\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(165, 21, 'User Albertine Wilson has updated their profile information', '2025-11-19 11:55:29', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-19 11:55:29\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(166, 21, 'User Albertine Wilson has updated their profile information', '2025-11-20 13:41:54', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-20 13:41:54\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(167, 21, 'User Albertine Wilson has updated their profile information', '2025-11-20 14:42:50', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-20 14:42:50\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(168, 21, 'User Albertine Wilson has updated their profile information', '2025-11-20 18:08:32', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-20 18:08:32\"}', 'java-backend', NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(169, 1, 'User Crafty Dev has updated their profile information', '2025-11-29 07:55:04', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 07:55:04\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(170, 2, 'User Garrison Sayor has updated their profile information', '2025-11-29 07:55:28', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 07:55:28\"}', 'java-backend', NULL, NULL, NULL, 'USER', '2', 'success', '2026-01-28 16:35:09'),
(171, 3, 'User Christopher Leabon has updated their profile information', '2025-11-29 07:57:42', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 07:57:42\"}', 'java-backend', NULL, NULL, NULL, 'USER', '3', 'success', '2026-01-28 16:35:09'),
(172, 4, 'User George Kona has updated their profile information', '2025-11-29 07:57:53', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 07:57:53\"}', 'java-backend', NULL, NULL, NULL, 'USER', '4', 'success', '2026-01-28 16:35:09'),
(173, 5, 'User Thomas Sneh has updated their profile information', '2025-11-29 07:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 07:58:03\"}', 'java-backend', NULL, NULL, NULL, 'USER', '5', 'success', '2026-01-28 16:35:09'),
(174, 6, 'User Jennifer Davis has updated their profile information', '2025-11-29 07:58:09', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 07:58:09\"}', 'java-backend', NULL, NULL, NULL, 'USER', '6', 'success', '2026-01-28 16:35:09'),
(175, 7, 'User Robert Wilson has updated their profile information', '2025-11-29 07:58:14', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 07:58:14\"}', 'java-backend', NULL, NULL, NULL, 'USER', '7', 'success', '2026-01-28 16:35:09'),
(176, 8, 'User Amanda Brown has updated their profile information', '2025-11-29 07:58:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 07:58:19\"}', 'java-backend', NULL, NULL, NULL, 'USER', '8', 'success', '2026-01-28 16:35:09'),
(177, 9, 'User John Doe has updated their profile information', '2025-11-29 07:58:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 07:58:24\"}', 'java-backend', NULL, NULL, NULL, 'USER', '9', 'success', '2026-01-28 16:35:09'),
(178, 10, 'User Jane Smith has updated their profile information', '2025-11-29 07:58:30', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 07:58:30\"}', 'java-backend', NULL, NULL, NULL, 'USER', '10', 'success', '2026-01-28 16:35:09'),
(179, 11, 'User Mark Jones has updated their profile information', '2025-11-29 07:58:36', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 07:58:36\"}', 'java-backend', NULL, NULL, NULL, 'USER', '11', 'success', '2026-01-28 16:35:09'),
(180, 12, 'User Emily White has updated their profile information', '2025-11-29 07:58:41', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 07:58:41\"}', 'java-backend', NULL, NULL, NULL, 'USER', '12', 'success', '2026-01-28 16:35:09'),
(181, 13, 'User Alex Green has updated their profile information', '2025-11-29 07:58:46', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 07:58:46\"}', 'java-backend', NULL, NULL, NULL, 'USER', '13', 'success', '2026-01-28 16:35:09'),
(182, 14, 'User Maria Garcia has updated their profile information', '2025-11-29 07:58:51', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 07:58:51\"}', 'java-backend', NULL, NULL, NULL, 'USER', '14', 'success', '2026-01-28 16:35:09'),
(183, 15, 'User Chris Taylor has updated their profile information', '2025-11-29 07:59:07', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 07:59:07\"}', 'java-backend', NULL, NULL, NULL, 'USER', '15', 'success', '2026-01-28 16:35:09'),
(184, 19, 'User Crafty Dev has updated their profile information', '2025-11-29 07:59:12', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 07:59:12\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(185, 20, 'User Issa Adams has updated their profile information', '2025-11-29 07:59:18', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 07:59:18\"}', 'java-backend', NULL, NULL, NULL, 'USER', '20', 'success', '2026-01-28 16:35:09'),
(186, 2, 'User Garrison Sayor has updated their profile information', '2025-11-29 08:09:09', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 08:09:09\"}', 'java-backend', NULL, NULL, NULL, 'USER', '2', 'success', '2026-01-28 16:35:09'),
(187, 1, 'User Crafty Dev has updated their profile information', '2025-11-29 08:10:18', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 08:10:18\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(188, 1, 'User Crafty Dev has updated their profile information', '2025-11-30 14:04:32', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-30 14:04:32\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(189, 1, 'User Crafty Dev has updated their profile information', '2025-11-30 14:04:58', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-30 14:04:58\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(190, 1, 'User Crafty Dev has updated their profile information', '2025-11-30 14:05:05', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-30 14:05:05\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(191, 1, 'User Crafty Dev has updated their profile information', '2025-11-30 14:07:56', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-30 14:07:56\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(192, 1, 'User Crafty Dev has updated their profile information', '2025-11-30 14:13:01', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-30 14:13:01\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(193, 1, 'User Crafty Dev has updated their profile information', '2025-11-30 14:13:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-30 14:13:24\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(194, 1, 'User Crafty Dev has updated their profile information', '2025-11-30 14:15:06', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-30 14:15:06\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(195, 1, 'User Crafty Dev has updated their profile information', '2025-12-01 09:42:28', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-01 09:42:28\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(196, 1, 'User Crafty Dev has updated their profile information', '2025-12-01 15:59:39', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-01 15:59:39\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(197, 1, 'User Crafty Dev has updated their profile information', '2025-12-01 16:21:18', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-01 16:21:18\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(198, 1, 'User Crafty Dev has updated their profile information', '2025-12-01 22:27:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-01 22:27:19\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(199, 1, 'User Crafty Dev has updated their profile information', '2025-12-01 22:40:41', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-01 22:40:41\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(200, 1, 'User Crafty Dev has updated their profile information', '2025-12-01 23:18:23', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-01 23:18:23\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(201, 1, 'User Crafty Dev has updated their profile information', '2025-12-02 13:35:52', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-02 13:35:52\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(202, 1, 'User Crafty Dev has updated their profile information', '2025-12-05 07:41:49', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-05 07:41:49\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(203, 1, 'User Crafty Dev has updated their profile information', '2025-12-05 08:19:06', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-05 08:19:06\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(204, 1, 'User Crafty Dev has updated their profile information', '2025-12-05 10:25:21', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-05 10:25:21\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(205, 1, 'User Crafty Dev has updated their profile information', '2025-12-07 19:51:44', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-07 19:51:44\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(206, 1, 'User Crafty Dev has updated their profile information', '2025-12-09 18:47:45', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-09 18:47:45\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(207, 1, 'User Crafty Dev has updated their profile information', '2025-12-09 18:53:51', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-09 18:53:51\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(208, 1, 'User Crafty Dev has updated their profile information', '2025-12-10 19:21:52', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-10 19:21:52\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(209, 2, 'User Garrison Sayor has updated their profile information', '2025-12-10 21:33:17', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-10 21:33:17\"}', 'java-backend', NULL, NULL, NULL, 'USER', '2', 'success', '2026-01-28 16:35:09'),
(210, 1, 'User Crafty Dev has updated their profile information', '2025-12-18 11:29:13', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 11:29:13\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(211, 1, 'User Crafty Dev has updated their profile information', '2025-12-18 13:06:47', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 13:06:47\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(212, 1, 'User Crafty Dev has updated their profile information', '2025-12-18 13:27:00', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 13:27:00\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(213, 1, 'User Crafty Dev has updated their profile information', '2025-12-18 13:29:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 13:29:26\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(214, 1, 'User Crafty Dev has updated their profile information', '2025-12-18 13:39:01', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 13:39:01\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(215, 1, 'User Crafty Dev has updated their profile information', '2025-12-18 13:53:48', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 13:53:48\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(216, 1, 'User Crafty Dev has updated their profile information', '2025-12-18 14:14:52', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 14:14:52\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(217, 1, 'User Crafty Dev has updated their profile information', '2025-12-18 14:55:01', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 14:55:01\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(218, 1, 'User Crafty Dev has updated their profile information', '2025-12-18 16:48:21', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 16:48:21\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(219, 1, 'User Crafty Dev has updated their profile information', '2025-12-18 17:24:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 17:24:24\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(220, 1, 'User Crafty Dev has updated their profile information', '2025-12-18 17:27:33', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 17:27:33\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(221, 19, 'User Crafty Dev has updated their profile information', '2025-12-18 17:43:46', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 17:43:46\"}', 'java-backend', NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(222, 2, 'User Garrison Sayor has updated their profile information', '2025-12-18 17:59:01', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 17:59:01\"}', 'java-backend', NULL, NULL, NULL, 'USER', '2', 'success', '2026-01-28 16:35:09'),
(223, 2, 'User Garrison Sayor has updated their profile information', '2025-12-18 18:00:48', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 18:00:48\"}', 'java-backend', NULL, NULL, NULL, 'USER', '2', 'success', '2026-01-28 16:35:09'),
(224, 2, 'User Garrison Sayor has updated their profile information', '2025-12-18 18:03:12', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 18:03:12\"}', 'java-backend', NULL, NULL, NULL, 'USER', '2', 'success', '2026-01-28 16:35:09'),
(225, 3, 'User Christopher Leabon has updated their profile information', '2025-12-18 18:57:39', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 18:57:39\"}', 'java-backend', NULL, NULL, NULL, 'USER', '3', 'success', '2026-01-28 16:35:09'),
(226, 2, 'User Garrison Sayor has updated their profile information', '2025-12-18 18:58:52', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 18:58:52\"}', 'java-backend', NULL, NULL, NULL, 'USER', '2', 'success', '2026-01-28 16:35:09'),
(227, 1, 'User Crafty Dev has updated their profile information', '2025-12-18 19:20:32', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 19:20:32\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(228, 1, 'User Crafty Dev has updated their profile information', '2025-12-18 19:21:32', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 19:21:32\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(229, 2, 'User Garrison Sayor has updated their profile information', '2025-12-18 19:23:34', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 19:23:34\"}', 'java-backend', NULL, NULL, NULL, 'USER', '2', 'success', '2026-01-28 16:35:09'),
(230, 1, 'User Crafty Dev has updated their profile information', '2025-12-29 13:22:20', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-29 13:22:20\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(231, 3, 'User Christopher Leabon has updated their profile information', '2025-12-29 13:59:25', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-29 13:59:25\"}', 'java-backend', NULL, NULL, NULL, 'USER', '3', 'success', '2026-01-28 16:35:09'),
(232, 1, 'User Crafty Dev has updated their profile information', '2025-12-29 14:18:35', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-29 14:18:35\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(233, 2, 'User Garrison Sayor has updated their profile information', '2025-12-29 14:25:22', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-29 14:25:22\"}', 'java-backend', NULL, NULL, NULL, 'USER', '2', 'success', '2026-01-28 16:35:09'),
(234, 1, 'User Crafty Dev has updated their profile information', '2025-12-29 14:42:27', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-29 14:42:27\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(235, 1, 'User Crafty Dev has updated their profile information', '2025-12-29 15:06:50', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-29 15:06:50\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(236, 1, 'User Crafty Dev has updated their profile information', '2025-12-29 15:13:05', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-29 15:13:05\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(237, 1, 'User Crafty Dev has updated their profile information', '2025-12-29 15:47:49', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-29 15:47:49\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(238, 2, 'User Garrison Sayor has updated their profile information', '2025-12-29 15:50:41', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-29 15:50:41\"}', 'java-backend', NULL, NULL, NULL, 'USER', '2', 'success', '2026-01-28 16:35:09'),
(239, 1, 'User Crafty Dev has updated their profile information', '2026-01-08 05:49:20', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-08 05:49:20\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(240, 1, 'User Crafty Dev has updated their profile information', '2026-01-11 15:15:47', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-11 15:15:47\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(241, 23, 'User Crayton Kamara has updated their profile information', '2026-01-11 21:06:01', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-11 21:06:01\"}', 'java-backend', NULL, NULL, NULL, 'USER', '23', 'success', '2026-01-28 16:35:09'),
(242, 23, 'User Crayton Kamara has updated their profile information', '2026-01-11 21:14:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-11 21:14:26\"}', 'java-backend', NULL, NULL, NULL, 'USER', '23', 'success', '2026-01-28 16:35:09'),
(243, 23, 'User Crayton Kamara has updated their profile information', '2026-01-11 21:28:05', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-11 21:28:05\"}', 'java-backend', NULL, NULL, NULL, 'USER', '23', 'success', '2026-01-28 16:35:09'),
(244, 23, 'User Crayton Kamara has updated their profile information', '2026-01-11 21:53:15', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-11 21:53:15\"}', 'java-backend', NULL, NULL, NULL, 'USER', '23', 'success', '2026-01-28 16:35:09'),
(245, 23, 'User Crayton Kamara has updated their profile information', '2026-01-11 22:29:13', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-11 22:29:13\"}', 'java-backend', NULL, NULL, NULL, 'USER', '23', 'success', '2026-01-28 16:35:09'),
(246, 23, 'User Crayton Kamara has updated their profile information', '2026-01-11 22:38:38', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-11 22:38:38\"}', 'java-backend', NULL, NULL, NULL, 'USER', '23', 'success', '2026-01-28 16:35:09'),
(247, 23, 'User Crayton Kamara has updated their profile information', '2026-01-11 22:49:17', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-11 22:49:17\"}', 'java-backend', NULL, NULL, NULL, 'USER', '23', 'success', '2026-01-28 16:35:09'),
(248, 1, 'User Crafty Dev has updated their profile information', '2026-01-12 00:13:32', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-12 00:13:32\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(249, 1, 'User Crafty Dev has updated their profile information', '2026-01-13 02:51:06', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-13 02:51:06\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(250, 1, 'User Crafty Dev has updated their profile information', '2026-01-13 15:42:17', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-13 15:42:17\"}', 'java-backend', NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(251, 1, 'User Crafty Dev has updated their profile information', '2026-01-13 21:58:44', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-13 21:58:44\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(252, 1, 'User Crafty Dev has updated their profile information', '2026-01-13 21:59:39', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-13 21:59:39\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(253, 1, 'User Crafty Dev has updated their profile information', '2026-01-13 22:00:06', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-13 22:00:06\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(254, 1, 'User Crafty Dev has updated their profile information', '2026-01-13 22:04:10', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-13 22:04:10\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(255, 1, 'User Crafty Dev has updated their profile information', '2026-01-13 22:04:41', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-13 22:04:41\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(256, 1, 'User Crafty Dev has updated their profile information', '2026-01-13 22:10:55', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-13 22:10:55\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(257, 1, 'User Crafty Dev has updated their profile information', '2026-01-13 22:12:45', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-13 22:12:45\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(258, 1, 'EMPLOYEE_UPDATED', '2026-01-13 22:12:45', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-13 22:12:45\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(259, 1, 'User Crafty Dev has updated their profile information', '2026-01-13 22:12:53', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-13 22:12:53\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(260, 1, 'EMPLOYEE_UPDATED', '2026-01-13 22:12:53', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-13 22:12:53\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(261, 1, 'User Crafty Dev has updated their profile information', '2026-01-16 17:05:02', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-16 17:05:02\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(262, 1, 'User Crafty Dev has updated their profile information', '2026-01-16 17:09:08', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-16 17:09:08\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(263, 1, 'User Crafty Dev has updated their profile information', '2026-01-16 17:12:27', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-16 17:12:27\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(264, 1, 'User Crafty Dev has updated their profile information', '2026-01-16 17:20:39', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-16 17:20:39\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(265, 1, 'User Crafty Dev has updated their profile information', '2026-01-16 17:27:21', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-16 17:27:21\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(266, 1, 'User Crafty Dev has updated their profile information', '2026-01-16 17:29:02', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-16 17:29:02\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(267, 1, 'User Crafty Dev has updated their profile information', '2026-01-16 17:29:16', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-16 17:29:16\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(268, 1, 'User Crafty Dev has updated their profile information', '2026-01-16 17:29:32', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-16 17:29:32\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(269, 1, 'User Crafty Dev has updated their profile information', '2026-01-16 17:30:04', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-16 17:30:04\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(270, 1, 'Employee Updated Their Profile Info', '2026-01-16 17:30:04', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-16 17:30:04\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(271, 1, 'User Crafty Dev has updated their profile information', '2026-01-16 17:30:40', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-16 17:30:40\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(272, 1, 'User Crafty Dev has updated their profile information', '2026-01-17 20:44:00', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-17 20:44:00\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(273, 1, 'User Crafty Dev has updated their profile information', '2026-01-17 20:44:43', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-17 20:44:43\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(274, 1, 'User Crafty Dev has updated their profile information', '2026-01-17 20:56:48', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-17 20:56:48\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(275, 1, 'User Crafty Dev has updated their profile information', '2026-01-17 21:01:17', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-17 21:01:17\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(276, NULL, 'UPDATE_BUDGET', '2026-01-18 13:06:04', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 13:06:04\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(277, NULL, 'UPDATE_BUDGET', '2026-01-18 13:11:43', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 13:11:43\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(278, NULL, 'UPDATE_BUDGET', '2026-01-18 13:18:36', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 13:18:36\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(279, NULL, 'UPDATE_BUDGET', '2026-01-18 13:18:49', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 13:18:49\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(280, NULL, 'UPDATE_BUDGET', '2026-01-18 13:19:22', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 13:19:22\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(281, NULL, 'UPDATE_BUDGET', '2026-01-18 13:19:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 13:19:24\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(282, 1, 'User Crafty Dev has updated their profile information', '2026-01-18 13:24:36', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 13:24:36\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(283, 1, 'User Crafty Dev has updated their profile information', '2026-01-18 13:40:33', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 13:40:33\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(284, 1, 'CREATE_BUDGET', '2026-01-18 13:55:45', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 13:55:45\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(285, 1, 'CREATE_BUDGET', '2026-01-18 13:55:45', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 13:55:45\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(286, 1, 'CREATE_BUDGET', '2026-01-18 13:55:45', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 13:55:45\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(287, 1, 'CREATE_BUDGET', '2026-01-18 13:55:45', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 13:55:45\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(288, 1, 'CREATE_BUDGET', '2026-01-18 13:56:32', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 13:56:32\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(289, 1, 'CREATE_BUDGET', '2026-01-18 13:56:32', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 13:56:32\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(290, 1, 'CREATE_BUDGET', '2026-01-18 13:56:32', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 13:56:32\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(291, 1, 'CREATE_BUDGET', '2026-01-18 13:56:32', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 13:56:32\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(292, 1, 'CREATE_BUDGET', '2026-01-18 14:21:52', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 14:21:52\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(293, NULL, 'UPDATE_BUDGET', '2026-01-18 14:23:37', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 14:23:37\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(294, NULL, 'CREATE_BUDGET_REQUEST', '2026-01-18 15:20:34', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 15:20:34\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(295, 1, 'CREATE_BUDGET', '2026-01-18 15:21:00', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 15:21:00\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(296, 1, 'User Crafty Dev has updated their profile information', '2026-01-19 15:42:14', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-19 15:42:14\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(297, 1, 'User Crafty Dev has updated their profile information', '2026-01-19 22:46:22', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-19 22:46:22\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(298, 1, 'Employee Updated Their Profile Info', '2026-01-19 22:46:22', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-19 22:46:22\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(299, 1, 'User Crafty Dev has updated their profile information', '2026-01-19 22:46:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-19 22:46:24\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(300, 1, 'Employee Updated Their Profile Info', '2026-01-19 22:46:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-19 22:46:24\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(301, NULL, 'CREATE_ACCOUNT_PAYABLE', '2026-01-20 09:55:41', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 09:55:41\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(302, NULL, 'CREATE_ACCOUNT_RECEIVABLE', '2026-01-20 10:05:38', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 10:05:38\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(303, NULL, 'UPDATE_ACCOUNT_RECEIVABLE', '2026-01-20 10:11:35', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 10:11:35\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(304, NULL, 'UPDATE_ACCOUNT_PAYABLE', '2026-01-20 10:12:31', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 10:12:31\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(305, NULL, 'UPDATE_ACCOUNT_PAYABLE', '2026-01-20 10:15:05', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 10:15:05\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(306, 1, 'User Crafty Dev has updated their profile information', '2026-01-20 15:34:50', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:34:50\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(307, 1, 'User Crafty Dev has updated their profile information', '2026-01-20 15:35:55', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:35:55\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(308, 1, 'User Crafty Dev has updated their profile information', '2026-01-20 15:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(309, 2, 'User Garrison Sayor has updated their profile information', '2026-01-20 15:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', NULL, NULL, NULL, NULL, 'USER', '2', 'success', '2026-01-28 16:35:09'),
(310, 3, 'User Christopher Leabon has updated their profile information', '2026-01-20 15:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', NULL, NULL, NULL, NULL, 'USER', '3', 'success', '2026-01-28 16:35:09'),
(311, 4, 'User George Kona has updated their profile information', '2026-01-20 15:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', NULL, NULL, NULL, NULL, 'USER', '4', 'success', '2026-01-28 16:35:09'),
(312, 5, 'User Thomas Sneh has updated their profile information', '2026-01-20 15:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', NULL, NULL, NULL, NULL, 'USER', '5', 'success', '2026-01-28 16:35:09'),
(313, 6, 'User Jennifer Davis has updated their profile information', '2026-01-20 15:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', NULL, NULL, NULL, NULL, 'USER', '6', 'success', '2026-01-28 16:35:09'),
(314, 7, 'User Robert Wilson has updated their profile information', '2026-01-20 15:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', NULL, NULL, NULL, NULL, 'USER', '7', 'success', '2026-01-28 16:35:09'),
(315, 8, 'User Amanda Brown has updated their profile information', '2026-01-20 15:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', NULL, NULL, NULL, NULL, 'USER', '8', 'success', '2026-01-28 16:35:09'),
(316, 9, 'User John Doe has updated their profile information', '2026-01-20 15:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', NULL, NULL, NULL, NULL, 'USER', '9', 'success', '2026-01-28 16:35:09'),
(317, 10, 'User Jane Smith has updated their profile information', '2026-01-20 15:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', NULL, NULL, NULL, NULL, 'USER', '10', 'success', '2026-01-28 16:35:09'),
(318, 11, 'User Mark Jones has updated their profile information', '2026-01-20 15:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', NULL, NULL, NULL, NULL, 'USER', '11', 'success', '2026-01-28 16:35:09'),
(319, 12, 'User Emily White has updated their profile information', '2026-01-20 15:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', NULL, NULL, NULL, NULL, 'USER', '12', 'success', '2026-01-28 16:35:09'),
(320, 13, 'User Alex Green has updated their profile information', '2026-01-20 15:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', NULL, NULL, NULL, NULL, 'USER', '13', 'success', '2026-01-28 16:35:09'),
(321, 14, 'User Maria Garcia has updated their profile information', '2026-01-20 15:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', NULL, NULL, NULL, NULL, 'USER', '14', 'success', '2026-01-28 16:35:09'),
(322, 15, 'User Chris Taylor has updated their profile information', '2026-01-20 15:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', NULL, NULL, NULL, NULL, 'USER', '15', 'success', '2026-01-28 16:35:09'),
(323, 19, 'User Crafty Dev has updated their profile information', '2026-01-20 15:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', NULL, NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(324, 20, 'User Issa Adams has updated their profile information', '2026-01-20 15:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', NULL, NULL, NULL, NULL, 'USER', '20', 'success', '2026-01-28 16:35:09'),
(325, 21, 'User Albertine Wilson has updated their profile information', '2026-01-20 15:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', NULL, NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(326, 23, 'User Crayton Kamara has updated their profile information', '2026-01-20 15:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', NULL, NULL, NULL, NULL, 'USER', '23', 'success', '2026-01-28 16:35:09'),
(327, 1, 'User Crafty Dev has updated their profile information', '2026-01-20 15:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(328, 2, 'User Garrison Sayor has updated their profile information', '2026-01-20 15:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', NULL, NULL, NULL, NULL, 'USER', '2', 'success', '2026-01-28 16:35:09'),
(329, 3, 'User Christopher Leabon has updated their profile information', '2026-01-20 15:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', NULL, NULL, NULL, NULL, 'USER', '3', 'success', '2026-01-28 16:35:09'),
(330, 4, 'User George Kona has updated their profile information', '2026-01-20 15:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', NULL, NULL, NULL, NULL, 'USER', '4', 'success', '2026-01-28 16:35:09'),
(331, 5, 'User Thomas Sneh has updated their profile information', '2026-01-20 15:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', NULL, NULL, NULL, NULL, 'USER', '5', 'success', '2026-01-28 16:35:09'),
(332, 6, 'User Jennifer Davis has updated their profile information', '2026-01-20 15:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', NULL, NULL, NULL, NULL, 'USER', '6', 'success', '2026-01-28 16:35:09'),
(333, 7, 'User Robert Wilson has updated their profile information', '2026-01-20 15:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', NULL, NULL, NULL, NULL, 'USER', '7', 'success', '2026-01-28 16:35:09'),
(334, 8, 'User Amanda Brown has updated their profile information', '2026-01-20 15:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', NULL, NULL, NULL, NULL, 'USER', '8', 'success', '2026-01-28 16:35:09'),
(335, 9, 'User John Doe has updated their profile information', '2026-01-20 15:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', NULL, NULL, NULL, NULL, 'USER', '9', 'success', '2026-01-28 16:35:09'),
(336, 10, 'User Jane Smith has updated their profile information', '2026-01-20 15:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', NULL, NULL, NULL, NULL, 'USER', '10', 'success', '2026-01-28 16:35:09'),
(337, 11, 'User Mark Jones has updated their profile information', '2026-01-20 15:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', NULL, NULL, NULL, NULL, 'USER', '11', 'success', '2026-01-28 16:35:09'),
(338, 12, 'User Emily White has updated their profile information', '2026-01-20 15:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', NULL, NULL, NULL, NULL, 'USER', '12', 'success', '2026-01-28 16:35:09'),
(339, 13, 'User Alex Green has updated their profile information', '2026-01-20 15:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', NULL, NULL, NULL, NULL, 'USER', '13', 'success', '2026-01-28 16:35:09'),
(340, 14, 'User Maria Garcia has updated their profile information', '2026-01-20 15:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', NULL, NULL, NULL, NULL, 'USER', '14', 'success', '2026-01-28 16:35:09'),
(341, 15, 'User Chris Taylor has updated their profile information', '2026-01-20 15:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', NULL, NULL, NULL, NULL, 'USER', '15', 'success', '2026-01-28 16:35:09'),
(342, 19, 'User Crafty Dev has updated their profile information', '2026-01-20 15:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', NULL, NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09');
INSERT INTO `audit_logs_archive` (`id`, `user_id`, `action`, `timestamp`, `details`, `service_name`, `ip_address`, `request_id`, `session_id`, `entity_type`, `entity_id`, `result`, `archived_at`) VALUES
(343, 20, 'User Issa Adams has updated their profile information', '2026-01-20 15:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', NULL, NULL, NULL, NULL, 'USER', '20', 'success', '2026-01-28 16:35:09'),
(344, 21, 'User Albertine Wilson has updated their profile information', '2026-01-20 15:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', NULL, NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(345, 1, 'User Crafty Dev has updated their profile information', '2026-01-20 15:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(346, 2, 'User Garrison Sayor has updated their profile information', '2026-01-20 15:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', NULL, NULL, NULL, NULL, 'USER', '2', 'success', '2026-01-28 16:35:09'),
(347, 3, 'User Christopher Leabon has updated their profile information', '2026-01-20 15:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', NULL, NULL, NULL, NULL, 'USER', '3', 'success', '2026-01-28 16:35:09'),
(348, 4, 'User George Kona has updated their profile information', '2026-01-20 15:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', NULL, NULL, NULL, NULL, 'USER', '4', 'success', '2026-01-28 16:35:09'),
(349, 5, 'User Thomas Sneh has updated their profile information', '2026-01-20 15:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', NULL, NULL, NULL, NULL, 'USER', '5', 'success', '2026-01-28 16:35:09'),
(350, 6, 'User Jennifer Davis has updated their profile information', '2026-01-20 15:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', NULL, NULL, NULL, NULL, 'USER', '6', 'success', '2026-01-28 16:35:09'),
(351, 7, 'User Robert Wilson has updated their profile information', '2026-01-20 15:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', NULL, NULL, NULL, NULL, 'USER', '7', 'success', '2026-01-28 16:35:09'),
(352, 8, 'User Amanda Brown has updated their profile information', '2026-01-20 15:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', NULL, NULL, NULL, NULL, 'USER', '8', 'success', '2026-01-28 16:35:09'),
(353, 9, 'User John Doe has updated their profile information', '2026-01-20 15:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', NULL, NULL, NULL, NULL, 'USER', '9', 'success', '2026-01-28 16:35:09'),
(354, 10, 'User Jane Smith has updated their profile information', '2026-01-20 15:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', NULL, NULL, NULL, NULL, 'USER', '10', 'success', '2026-01-28 16:35:09'),
(355, 11, 'User Mark Jones has updated their profile information', '2026-01-20 15:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', NULL, NULL, NULL, NULL, 'USER', '11', 'success', '2026-01-28 16:35:09'),
(356, 12, 'User Emily White has updated their profile information', '2026-01-20 15:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', NULL, NULL, NULL, NULL, 'USER', '12', 'success', '2026-01-28 16:35:09'),
(357, 13, 'User Alex Green has updated their profile information', '2026-01-20 15:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', NULL, NULL, NULL, NULL, 'USER', '13', 'success', '2026-01-28 16:35:09'),
(358, 14, 'User Maria Garcia has updated their profile information', '2026-01-20 15:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', NULL, NULL, NULL, NULL, 'USER', '14', 'success', '2026-01-28 16:35:09'),
(359, 15, 'User Chris Taylor has updated their profile information', '2026-01-20 15:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', NULL, NULL, NULL, NULL, 'USER', '15', 'success', '2026-01-28 16:35:09'),
(360, 19, 'User Crafty Dev has updated their profile information', '2026-01-20 15:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', NULL, NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(361, 20, 'User Issa Adams has updated their profile information', '2026-01-20 15:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', NULL, NULL, NULL, NULL, 'USER', '20', 'success', '2026-01-28 16:35:09'),
(362, 21, 'User Albertine Wilson has updated their profile information', '2026-01-20 15:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', NULL, NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(363, 23, 'User Crayton Kamara has updated their profile information', '2026-01-20 15:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', NULL, NULL, NULL, NULL, 'USER', '23', 'success', '2026-01-28 16:35:09'),
(364, 1, 'User Crafty Dev has updated their profile information', '2026-01-20 15:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(365, 2, 'User Garrison Sayor has updated their profile information', '2026-01-20 15:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', NULL, NULL, NULL, NULL, 'USER', '2', 'success', '2026-01-28 16:35:09'),
(366, 3, 'User Christopher Leabon has updated their profile information', '2026-01-20 15:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', NULL, NULL, NULL, NULL, 'USER', '3', 'success', '2026-01-28 16:35:09'),
(367, 4, 'User George Kona has updated their profile information', '2026-01-20 15:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', NULL, NULL, NULL, NULL, 'USER', '4', 'success', '2026-01-28 16:35:09'),
(368, 5, 'User Thomas Sneh has updated their profile information', '2026-01-20 15:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', NULL, NULL, NULL, NULL, 'USER', '5', 'success', '2026-01-28 16:35:09'),
(369, 6, 'User Jennifer Davis has updated their profile information', '2026-01-20 15:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', NULL, NULL, NULL, NULL, 'USER', '6', 'success', '2026-01-28 16:35:09'),
(370, 7, 'User Robert Wilson has updated their profile information', '2026-01-20 15:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', NULL, NULL, NULL, NULL, 'USER', '7', 'success', '2026-01-28 16:35:09'),
(371, 8, 'User Amanda Brown has updated their profile information', '2026-01-20 15:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', NULL, NULL, NULL, NULL, 'USER', '8', 'success', '2026-01-28 16:35:09'),
(372, 9, 'User John Doe has updated their profile information', '2026-01-20 15:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', NULL, NULL, NULL, NULL, 'USER', '9', 'success', '2026-01-28 16:35:09'),
(373, 10, 'User Jane Smith has updated their profile information', '2026-01-20 15:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', NULL, NULL, NULL, NULL, 'USER', '10', 'success', '2026-01-28 16:35:09'),
(374, 11, 'User Mark Jones has updated their profile information', '2026-01-20 15:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', NULL, NULL, NULL, NULL, 'USER', '11', 'success', '2026-01-28 16:35:09'),
(375, 12, 'User Emily White has updated their profile information', '2026-01-20 15:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', NULL, NULL, NULL, NULL, 'USER', '12', 'success', '2026-01-28 16:35:09'),
(376, 13, 'User Alex Green has updated their profile information', '2026-01-20 15:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', NULL, NULL, NULL, NULL, 'USER', '13', 'success', '2026-01-28 16:35:09'),
(377, 14, 'User Maria Garcia has updated their profile information', '2026-01-20 15:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', NULL, NULL, NULL, NULL, 'USER', '14', 'success', '2026-01-28 16:35:09'),
(378, 15, 'User Chris Taylor has updated their profile information', '2026-01-20 15:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', NULL, NULL, NULL, NULL, 'USER', '15', 'success', '2026-01-28 16:35:09'),
(379, 19, 'User Crafty Dev has updated their profile information', '2026-01-20 15:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', NULL, NULL, NULL, NULL, 'USER', '19', 'success', '2026-01-28 16:35:09'),
(380, 20, 'User Issa Adams has updated their profile information', '2026-01-20 15:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', NULL, NULL, NULL, NULL, 'USER', '20', 'success', '2026-01-28 16:35:09'),
(381, 21, 'User Albertine Wilson has updated their profile information', '2026-01-20 15:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', NULL, NULL, NULL, NULL, 'USER', '21', 'success', '2026-01-28 16:35:09'),
(382, 23, 'User Crayton Kamara has updated their profile information', '2026-01-20 15:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', NULL, NULL, NULL, NULL, 'USER', '23', 'success', '2026-01-28 16:35:09'),
(383, 1, 'User Crafty Dev has updated their profile information', '2026-01-20 15:59:40', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:59:40\"}', NULL, NULL, NULL, NULL, 'USER', '1', 'success', '2026-01-28 16:35:09'),
(384, NULL, 'CREATE_ACCOUNT_PAYABLE', '2026-01-20 16:02:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 16:02:24\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(385, NULL, 'UPDATE_ACCOUNT_PAYABLE', '2026-01-20 16:02:40', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 16:02:40\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(386, NULL, 'UPDATE_ACCOUNT_PAYABLE', '2026-01-20 16:10:25', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 16:10:25\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(387, NULL, 'UPDATE_ACCOUNT_PAYABLE', '2026-01-20 16:12:50', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 16:12:50\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(388, NULL, 'UPDATE_ACCOUNT_PAYABLE', '2026-01-20 16:15:42', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 16:15:42\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(389, NULL, 'UPDATE_ACCOUNT_PAYABLE', '2026-01-20 16:20:43', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 16:20:43\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(390, NULL, 'UPDATE_ACCOUNT_PAYABLE', '2026-01-20 16:21:28', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 16:21:28\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(391, NULL, 'CREATE_ACCOUNT_PAYABLE', '2026-01-20 16:34:44', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 16:34:44\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(392, NULL, 'UPDATE_ACCOUNT_PAYABLE', '2026-01-20 16:36:52', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 16:36:52\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09'),
(393, NULL, 'UPDATE_ACCOUNT_PAYABLE', '2026-01-20 16:43:54', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 16:43:54\"}', 'java-backend', NULL, NULL, NULL, NULL, NULL, 'success', '2026-01-28 16:35:09');

-- --------------------------------------------------------

--
-- Table structure for table `benefit_plans`
--

CREATE TABLE `benefit_plans` (
  `id` bigint(20) NOT NULL,
  `contribution_amount` decimal(38,2) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `plan_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `budgets`
--

CREATE TABLE `budgets` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `fiscal_year` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `total_amount` decimal(15,2) NOT NULL,
  `allocated_amount` decimal(15,2) DEFAULT 0.00,
  `spent_amount` decimal(15,2) DEFAULT 0.00,
  `remaining_amount` decimal(15,2) GENERATED ALWAYS AS (`total_amount` - `spent_amount`) STORED,
  `status` enum('draft','pending_approval','approved','active','closed') DEFAULT 'draft',
  `created_by` int(11) NOT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `amount` decimal(38,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `budgets`
--

INSERT INTO `budgets` (`id`, `name`, `description`, `department_id`, `fiscal_year`, `start_date`, `end_date`, `total_amount`, `allocated_amount`, `spent_amount`, `status`, `created_by`, `approved_by`, `approved_at`, `created_at`, `updated_at`, `amount`) VALUES
(1, 'HR Department Budget 2024', 'Annual budget for Human Resources', 1, 2024, '2024-01-01', '2024-12-31', 500000.00, 0.00, 500000.00, 'approved', 2, NULL, NULL, '2025-07-07 13:16:01', '2026-01-18 09:57:29', NULL),
(2, 'Finance Department Budget 2024', 'Annual budget for Finance Department', 2, 2024, '2024-01-01', '2024-12-31', 750000.00, 0.00, 750000.00, 'approved', 3, NULL, NULL, '2025-07-07 13:16:01', '2026-01-18 09:57:29', NULL),
(3, 'IT Department Budget 2024', 'Annual budget for Information Technology', 3, 2024, '2024-01-01', '2024-12-31', 1000000.00, 0.00, 1000000.00, 'approved', 4, NULL, NULL, '2025-07-07 13:16:01', '2026-01-18 09:57:29', NULL),
(4, 'Operations Budget 2024', 'Annual budget for Operations', 4, 2024, '2024-01-01', '2024-12-31', 800000.00, 0.00, 800000.00, 'approved', 5, NULL, NULL, '2025-07-07 13:16:01', '2026-01-18 09:57:29', NULL),
(5, 'Office Supplies - Finance', 'Need to replenish office supplies', 1, 2026, '2025-07-24', '2026-07-24', 500.00, 500.00, 0.00, 'active', 1, NULL, NULL, '2026-01-18 11:55:45', '2026-01-18 11:55:45', NULL),
(6, 'Software Licenses - Information Technology', 'Purchase new accounting software licenses', 1, 2026, '2025-07-24', '2026-07-24', 1200.00, 1200.00, 0.00, 'active', 1, NULL, NULL, '2026-01-18 11:55:45', '2026-01-18 11:55:45', NULL),
(7, 'Training - Planning and Development', 'Budget for staff training and development', 1, 2026, '2025-07-24', '2026-07-24', 800.00, 800.00, 0.00, 'active', 1, NULL, NULL, '2026-01-18 11:55:45', '2026-01-18 11:55:45', NULL),
(8, 'Consulting Services - Human Resources', 'Hire external consultants for audit', 1, 2026, '2025-07-24', '2026-07-24', 3000.00, 3000.00, 0.00, 'active', 1, NULL, NULL, '2026-01-18 11:55:45', '2026-01-18 11:55:45', NULL),
(13, 'Cases Files', 'Files to handle cases catalog', 5, 2026, '2026-01-18', '2026-12-31', 450000.00, 0.00, 20000.00, 'draft', 1, NULL, NULL, '2026-01-18 12:21:52', '2026-01-18 12:21:52', NULL),
(14, 'Intern Stipend - ', 'Needed for interns use for transportation and feeding', 1, 2026, '2026-01-18', '2027-01-18', 4500000.00, 4500000.00, 0.00, 'active', 1, NULL, NULL, '2026-01-18 13:21:00', '2026-01-18 13:21:00', NULL),
(1, 'HR Department Budget 2024', 'Annual budget for Human Resources', 1, 2024, '2024-01-01', '2024-12-31', 500000.00, 0.00, 500000.00, 'approved', 2, NULL, NULL, '2025-07-07 13:16:01', '2026-01-18 09:57:29', NULL),
(2, 'Finance Department Budget 2024', 'Annual budget for Finance Department', 2, 2024, '2024-01-01', '2024-12-31', 750000.00, 0.00, 750000.00, 'approved', 3, NULL, NULL, '2025-07-07 13:16:01', '2026-01-18 09:57:29', NULL),
(3, 'IT Department Budget 2024', 'Annual budget for Information Technology', 3, 2024, '2024-01-01', '2024-12-31', 1000000.00, 0.00, 1000000.00, 'approved', 4, NULL, NULL, '2025-07-07 13:16:01', '2026-01-18 09:57:29', NULL),
(4, 'Operations Budget 2024', 'Annual budget for Operations', 4, 2024, '2024-01-01', '2024-12-31', 800000.00, 0.00, 800000.00, 'approved', 5, NULL, NULL, '2025-07-07 13:16:01', '2026-01-18 09:57:29', NULL),
(5, 'Office Supplies - Finance', 'Need to replenish office supplies', 1, 2026, '2025-07-24', '2026-07-24', 500.00, 500.00, 0.00, 'active', 1, NULL, NULL, '2026-01-18 11:55:45', '2026-01-18 11:55:45', NULL),
(6, 'Software Licenses - Information Technology', 'Purchase new accounting software licenses', 1, 2026, '2025-07-24', '2026-07-24', 1200.00, 1200.00, 0.00, 'active', 1, NULL, NULL, '2026-01-18 11:55:45', '2026-01-18 11:55:45', NULL),
(7, 'Training - Planning and Development', 'Budget for staff training and development', 1, 2026, '2025-07-24', '2026-07-24', 800.00, 800.00, 0.00, 'active', 1, NULL, NULL, '2026-01-18 11:55:45', '2026-01-18 11:55:45', NULL),
(8, 'Consulting Services - Human Resources', 'Hire external consultants for audit', 1, 2026, '2025-07-24', '2026-07-24', 3000.00, 3000.00, 0.00, 'active', 1, NULL, NULL, '2026-01-18 11:55:45', '2026-01-18 11:55:45', NULL),
(13, 'Cases Files', 'Files to handle cases catalog', 5, 2026, '2026-01-18', '2026-12-31', 450000.00, 0.00, 20000.00, 'draft', 1, NULL, NULL, '2026-01-18 12:21:52', '2026-01-18 12:21:52', NULL),
(14, 'Intern Stipend - ', 'Needed for interns use for transportation and feeding', 1, 2026, '2026-01-18', '2027-01-18', 4500000.00, 4500000.00, 0.00, 'active', 1, NULL, NULL, '2026-01-18 13:21:00', '2026-01-18 13:21:00', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `budget_line_items`
--

CREATE TABLE `budget_line_items` (
  `id` int(11) NOT NULL,
  `budget_id` int(11) NOT NULL,
  `account_id` int(11) NOT NULL,
  `description` varchar(200) DEFAULT NULL,
  `budgeted_amount` decimal(12,2) NOT NULL,
  `spent_amount` decimal(12,2) DEFAULT 0.00,
  `remaining_amount` decimal(12,2) GENERATED ALWAYS AS (`budgeted_amount` - `spent_amount`) STORED,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `budget_requests`
--

CREATE TABLE `budget_requests` (
  `id` bigint(20) NOT NULL,
  `category` varchar(255) DEFAULT NULL,
  `department` varchar(255) DEFAULT NULL,
  `justification` varchar(1000) DEFAULT NULL,
  `request_date` date DEFAULT NULL,
  `requested_amount` decimal(15,2) DEFAULT NULL,
  `requested_by` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `department_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `budget_requests`
--

INSERT INTO `budget_requests` (`id`, `category`, `department`, `justification`, `request_date`, `requested_amount`, `requested_by`, `status`, `department_id`) VALUES
(1, 'Office Supplies', 'Finance', 'Need to replenish office supplies', '2025-07-24', 500.00, 'Christopher Leabon', 'Approved', NULL),
(2, 'Software Licenses', 'Information Technology', 'Purchase new accounting software licenses', '2025-07-24', 1200.00, 'Christopher Leabon', 'Approved', NULL),
(3, 'Training', 'Planning and Development', 'Budget for staff training and development', '2025-07-24', 800.00, 'Robert Wilson', 'Approved', NULL),
(4, 'Equipment', 'Information Technology', 'Upgrade computers and peripherals', '2025-07-24', 2500.00, 'Robert Wilson', 'Rejected', NULL),
(5, 'Consulting Services', 'Human Resources', 'Hire external consultants for audit', '2025-07-24', 3000.00, 'Crafty Dev', 'Approved', NULL),
(6, 'Intern Stipend', '', 'Needed for interns use for transportation and feeding', '2026-01-18', 4500000.00, 'Crafty', 'Approved', 1),
(1, 'Office Supplies', 'Finance', 'Need to replenish office supplies', '2025-07-24', 500.00, 'Christopher Leabon', 'Approved', NULL),
(2, 'Software Licenses', 'Information Technology', 'Purchase new accounting software licenses', '2025-07-24', 1200.00, 'Christopher Leabon', 'Approved', NULL),
(3, 'Training', 'Planning and Development', 'Budget for staff training and development', '2025-07-24', 800.00, 'Robert Wilson', 'Approved', NULL),
(4, 'Equipment', 'Information Technology', 'Upgrade computers and peripherals', '2025-07-24', 2500.00, 'Robert Wilson', 'Rejected', NULL),
(5, 'Consulting Services', 'Human Resources', 'Hire external consultants for audit', '2025-07-24', 3000.00, 'Crafty Dev', 'Approved', NULL),
(6, 'Intern Stipend', '', 'Needed for interns use for transportation and feeding', '2026-01-18', 4500000.00, 'Crafty', 'Approved', 1);

-- --------------------------------------------------------

--
-- Table structure for table `business_permits`
--

CREATE TABLE `business_permits` (
  `id` bigint(20) NOT NULL,
  `permit_number` varchar(255) NOT NULL,
  `business_name` varchar(255) NOT NULL,
  `business_type` varchar(255) DEFAULT NULL,
  `owner_name` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `contact_number` varchar(255) DEFAULT NULL,
  `issue_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `fee` decimal(10,2) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `business_permits`
--

INSERT INTO `business_permits` (`id`, `permit_number`, `business_name`, `business_type`, `owner_name`, `address`, `contact_number`, `issue_date`, `expiry_date`, `fee`, `status`, `created_at`, `updated_at`) VALUES
(1, 'BP-2024-001', 'Tech Solutions Inc', 'IT Services', 'John Doe', '123 Main St', '+1234567890', '2026-01-12', '2027-01-12', 500.00, 'active', '2026-01-12 22:21:37', NULL),
(2, 'BP-2024-002', 'Green Grocers', 'Retail', 'Jane Smith', '456 Market Ave', '+0987654321', '2026-01-12', '2027-01-12', 300.00, 'active', '2026-01-12 22:21:37', NULL),
(1, 'BP-2024-001', 'Tech Solutions Inc', 'IT Services', 'John Doe', '123 Main St', '+1234567890', '2026-01-12', '2027-01-12', 500.00, 'active', '2026-01-12 22:21:37', NULL),
(2, 'BP-2024-002', 'Green Grocers', 'Retail', 'Jane Smith', '456 Market Ave', '+0987654321', '2026-01-12', '2027-01-12', 300.00, 'active', '2026-01-12 22:21:37', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` bigint(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `category_type` enum('asset','accessory','consumable','component','license') NOT NULL DEFAULT 'asset',
  `eula_text` text DEFAULT NULL,
  `use_default_eula` tinyint(1) DEFAULT 0,
  `require_acceptance` tinyint(1) DEFAULT 0,
  `checkin_email` tinyint(1) DEFAULT 0,
  `image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `category_type`, `eula_text`, `use_default_eula`, `require_acceptance`, `checkin_email`, `image`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Laptops', 'asset', NULL, 0, 1, 0, NULL, '2026-02-19 22:49:14', '2026-02-19 22:49:14', NULL),
(2, 'Desktops', 'asset', NULL, 0, 1, 0, NULL, '2026-02-19 22:49:14', '2026-02-19 22:49:14', NULL),
(3, 'Mobile Phones', 'asset', NULL, 0, 1, 0, NULL, '2026-02-19 22:49:14', '2026-02-19 22:49:14', NULL),
(4, 'Tablets', 'asset', NULL, 0, 1, 0, NULL, '2026-02-19 22:49:14', '2026-02-19 22:49:14', NULL),
(5, 'Displays', 'asset', NULL, 0, 0, 0, NULL, '2026-02-19 22:49:14', '2026-02-19 22:49:14', NULL),
(6, 'Keyboards', 'accessory', NULL, 0, 0, 0, NULL, '2026-02-19 22:49:14', '2026-02-19 22:49:14', NULL),
(7, 'Mouse', 'accessory', NULL, 0, 0, 0, NULL, '2026-02-19 22:49:14', '2026-02-19 22:49:14', NULL),
(8, 'RAM', 'component', NULL, 0, 0, 0, NULL, '2026-02-19 22:49:14', '2026-02-19 22:49:14', NULL),
(9, 'HDD/SSD', 'component', NULL, 0, 0, 0, NULL, '2026-02-19 22:49:14', '2026-02-19 22:49:14', NULL),
(10, 'Office Software', 'license', NULL, 0, 1, 0, NULL, '2026-02-19 22:49:14', '2026-02-19 22:49:14', NULL),
(11, 'Printer Ink', 'consumable', NULL, 0, 0, 0, NULL, '2026-02-19 22:49:14', '2026-02-19 22:49:14', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `chart_of_accounts`
--

CREATE TABLE `chart_of_accounts` (
  `id` int(11) NOT NULL,
  `account_code` varchar(20) NOT NULL,
  `account_name` varchar(100) NOT NULL,
  `account_type` enum('asset','liability','equity','revenue','expense') NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chart_of_accounts`
--

INSERT INTO `chart_of_accounts` (`id`, `account_code`, `account_name`, `account_type`, `description`, `is_active`, `created_by`, `created_at`, `updated_at`) VALUES
(1, '1000', 'Current Assets', 'asset', 'Short term asset', 1, 1, '2025-07-07 13:16:00', '2026-01-18 09:05:15'),
(2, '1100', 'Cash and Cash Equivalents', 'asset', 'Cash accounts', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(3, '1110', 'Petty Cash', 'asset', 'Small cash fund', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:01'),
(4, '1120', 'Bank Account - Operating', 'asset', 'Main operating account', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:01'),
(5, '1200', 'Accounts Receivable', 'asset', 'Money owed to organization', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(6, '1300', 'Inventory', 'asset', 'Stock and supplies', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(7, '1400', 'Prepaid Expenses', 'asset', 'Expenses paid in advance', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(8, '1500', 'Fixed Assets', 'asset', 'Long-term assets', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(9, '1510', 'Buildings', 'asset', 'Office buildings and facilities', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:01'),
(10, '1520', 'Equipment', 'asset', 'Office and technical equipment', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:01'),
(11, '1530', 'Vehicles', 'asset', 'Fleet vehicles', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:01'),
(12, '1540', 'Furniture and Fixtures', 'asset', 'Office furniture', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:01'),
(13, '2000', 'Current Liabilities', 'liability', 'Short-term obligations', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(14, '2100', 'Accounts Payable', 'liability', 'Money owed to vendors', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:01'),
(15, '2200', 'Accrued Expenses', 'liability', 'Expenses incurred but not paid', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:01'),
(16, '2300', 'Payroll Liabilities', 'liability', 'Employee-related liabilities', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:01'),
(17, '3000', 'Equity', 'equity', 'Organizational equity', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(18, '3100', 'Retained Earnings', 'equity', 'Accumulated earnings', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:01'),
(19, '4000', 'Revenue', 'revenue', 'Income sources', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(20, '4100', 'Service Revenue', 'revenue', 'Revenue from services', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:01'),
(21, '4200', 'Grant Revenue', 'revenue', 'Government grants', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:01'),
(22, '4300', 'Other Revenue', 'revenue', 'Miscellaneous income', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:01'),
(23, '5000', 'Operating Expenses', 'expense', 'Regular operating costs', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(24, '5100', 'Salaries and Wages', 'expense', 'Employee compensation', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:01'),
(25, '5200', 'Benefits', 'expense', 'Employee benefits', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:01'),
(26, '5300', 'Office Supplies', 'expense', 'General office supplies', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:01'),
(27, '5400', 'Utilities', 'expense', 'Electricity, water, internet', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:01'),
(28, '5500', 'Rent', 'expense', 'Office rent', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:01'),
(29, '5600', 'Professional Services', 'expense', 'Legal, consulting fees', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:01'),
(30, '5700', 'Travel and Transportation', 'expense', 'Business travel costs', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:01'),
(31, '5800', 'Training and Development', 'expense', 'Employee training', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:01'),
(32, '5802', 'Gas delivery', 'liability', 'Short term money owed Total', NULL, 1, '2026-01-17 20:23:04', '2026-01-17 20:23:04'),
(33, '5803', 'Empl Checks', 'expense', 'Employees Payments', NULL, 1, '2026-01-18 16:41:50', '2026-01-18 16:41:50'),
(34, '5201', 'Accounts Payable', 'liability', 'Money owed to vendors', 1, 1, '2026-01-19 09:11:10', '2026-01-19 09:11:10'),
(35, '5202', 'Sales Revenue', 'revenue', 'Revenue from sales', 1, 2, '2026-01-19 09:11:10', '2026-01-19 09:11:10'),
(36, '5203', 'Office Expenses', 'expense', 'General office expenses', 1, 3, '2026-01-19 09:11:10', '2026-01-19 09:11:10'),
(37, '5204', 'IT Services', 'expense', 'Information technology services', 1, 4, '2026-01-19 09:11:10', '2026-01-19 09:11:10'),
(38, '5205', 'Utilities', 'expense', 'Utility expenses', 1, 5, '2026-01-19 09:11:10', '2026-01-19 09:11:10'),
(39, '5206', 'Accounts Receivable', 'asset', 'Money owed by customers', 1, 6, '2026-01-19 09:11:10', '2026-01-19 09:11:10'),
(1, '1000', 'Current Assets', 'asset', 'Short term asset', 1, 1, '2025-07-07 13:16:00', '2026-01-18 09:05:15'),
(2, '1100', 'Cash and Cash Equivalents', 'asset', 'Cash accounts', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(3, '1110', 'Petty Cash', 'asset', 'Small cash fund', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:01'),
(4, '1120', 'Bank Account - Operating', 'asset', 'Main operating account', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:01'),
(5, '1200', 'Accounts Receivable', 'asset', 'Money owed to organization', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(6, '1300', 'Inventory', 'asset', 'Stock and supplies', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(7, '1400', 'Prepaid Expenses', 'asset', 'Expenses paid in advance', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(8, '1500', 'Fixed Assets', 'asset', 'Long-term assets', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(9, '1510', 'Buildings', 'asset', 'Office buildings and facilities', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:01'),
(10, '1520', 'Equipment', 'asset', 'Office and technical equipment', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:01'),
(11, '1530', 'Vehicles', 'asset', 'Fleet vehicles', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:01'),
(12, '1540', 'Furniture and Fixtures', 'asset', 'Office furniture', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:01'),
(13, '2000', 'Current Liabilities', 'liability', 'Short-term obligations', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(14, '2100', 'Accounts Payable', 'liability', 'Money owed to vendors', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:01'),
(15, '2200', 'Accrued Expenses', 'liability', 'Expenses incurred but not paid', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:01'),
(16, '2300', 'Payroll Liabilities', 'liability', 'Employee-related liabilities', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:01'),
(17, '3000', 'Equity', 'equity', 'Organizational equity', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(18, '3100', 'Retained Earnings', 'equity', 'Accumulated earnings', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:01'),
(19, '4000', 'Revenue', 'revenue', 'Income sources', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(20, '4100', 'Service Revenue', 'revenue', 'Revenue from services', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:01'),
(21, '4200', 'Grant Revenue', 'revenue', 'Government grants', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:01'),
(22, '4300', 'Other Revenue', 'revenue', 'Miscellaneous income', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:01'),
(23, '5000', 'Operating Expenses', 'expense', 'Regular operating costs', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(24, '5100', 'Salaries and Wages', 'expense', 'Employee compensation', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:01'),
(25, '5200', 'Benefits', 'expense', 'Employee benefits', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:01'),
(26, '5300', 'Office Supplies', 'expense', 'General office supplies', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:01'),
(27, '5400', 'Utilities', 'expense', 'Electricity, water, internet', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:01'),
(28, '5500', 'Rent', 'expense', 'Office rent', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:01'),
(29, '5600', 'Professional Services', 'expense', 'Legal, consulting fees', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:01'),
(30, '5700', 'Travel and Transportation', 'expense', 'Business travel costs', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:01'),
(31, '5800', 'Training and Development', 'expense', 'Employee training', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:01'),
(32, '5802', 'Gas delivery', 'liability', 'Short term money owed Total', NULL, 1, '2026-01-17 20:23:04', '2026-01-17 20:23:04'),
(33, '5803', 'Empl Checks', 'expense', 'Employees Payments', NULL, 1, '2026-01-18 16:41:50', '2026-01-18 16:41:50'),
(34, '5201', 'Accounts Payable', 'liability', 'Money owed to vendors', 1, 1, '2026-01-19 09:11:10', '2026-01-19 09:11:10'),
(35, '5202', 'Sales Revenue', 'revenue', 'Revenue from sales', 1, 2, '2026-01-19 09:11:10', '2026-01-19 09:11:10'),
(36, '5203', 'Office Expenses', 'expense', 'General office expenses', 1, 3, '2026-01-19 09:11:10', '2026-01-19 09:11:10'),
(37, '5204', 'IT Services', 'expense', 'Information technology services', 1, 4, '2026-01-19 09:11:10', '2026-01-19 09:11:10'),
(38, '5205', 'Utilities', 'expense', 'Utility expenses', 1, 5, '2026-01-19 09:11:10', '2026-01-19 09:11:10'),
(39, '5206', 'Accounts Receivable', 'asset', 'Money owed by customers', 1, 6, '2026-01-19 09:11:10', '2026-01-19 09:11:10');

-- --------------------------------------------------------

--
-- Table structure for table `companies`
--

CREATE TABLE `companies` (
  `id` bigint(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `address` text DEFAULT NULL,
  `address2` text DEFAULT NULL,
  `province` varchar(100) DEFAULT NULL,
  `district` varchar(100) DEFAULT NULL,
  `sector` varchar(100) DEFAULT NULL,
  `cell` varchar(100) DEFAULT NULL,
  `village` varchar(100) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `po_box` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `companies`
--

INSERT INTO `companies` (`id`, `name`, `address`, `address2`, `province`, `district`, `sector`, `cell`, `village`, `city`, `country`, `po_box`, `email`, `phone`, `url`, `image`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'UNILAK – Kigali Main Campus', 'Kicukiro, KG 552 St', 'Near Sonatubes', 'Kigali City', 'Kicukiro', 'Gahanga', 'Gahanga', 'Nyarurama', 'Kigali', 'Rwanda', 'P.O. Box Kigali', 'info@unilak.rw', '+250 788 000 111', 'https://www.unilak.rw', NULL, '2026-02-19 22:49:14', '2026-02-20 17:48:14', NULL),
(2, 'UNILAK – Rwamagana Branch', 'RN3, Rwamagana Town', 'Education Complex', 'Eastern Province', 'Rwamagana', 'Kigabiro', 'Kigabiro', 'Kigarama', 'Rwamagana', 'Rwanda', 'P.O. Box Rwamagana', 'rwamagana@unilak.rw', '+250 788 000 222', 'https://www.unilak.rw', NULL, '2026-02-19 22:49:14', '2026-02-20 17:48:14', NULL),
(3, 'UNILAK – Musanze Branch', 'NR 18 Ave, Musanze', 'Campus Annex', 'Northern Province', 'Musanze', 'Muhoza', 'Muhoza', 'Kaguhu', 'Musanze', 'Rwanda', 'P.O. Box Musanze', 'musanze@unilak.rw', '+250 788 000 333', 'https://www.unilak.rw', NULL, '2026-02-20 15:15:00', '2026-02-20 17:48:14', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `compliance_records`
--

CREATE TABLE `compliance_records` (
  `id` bigint(20) NOT NULL,
  `compliance_date` date NOT NULL,
  `compliance_type` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `responsible_person` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `components`
--

CREATE TABLE `components` (
  `id` bigint(20) NOT NULL,
  `name` varchar(150) NOT NULL,
  `category_id` bigint(20) DEFAULT NULL,
  `manufacturer_id` bigint(20) DEFAULT NULL,
  `supplier_id` bigint(20) DEFAULT NULL,
  `company_id` bigint(20) DEFAULT NULL,
  `location_id` bigint(20) DEFAULT NULL,
  `model_no` varchar(100) DEFAULT NULL,
  `serial` varchar(120) DEFAULT NULL,
  `min_qty` int(11) NOT NULL DEFAULT 0,
  `qty_total` int(11) NOT NULL DEFAULT 0,
  `qty_remaining` int(11) NOT NULL DEFAULT 0,
  `unit_cost` decimal(13,4) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `component_checkouts`
--

CREATE TABLE `component_checkouts` (
  `id` bigint(20) NOT NULL,
  `component_id` bigint(20) NOT NULL,
  `asset_id` bigint(20) DEFAULT NULL,
  `checked_out_to_user_id` int(11) DEFAULT NULL,
  `qty` int(11) NOT NULL DEFAULT 1,
  `checked_out_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `checked_in_at` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `component_checkouts`
--
DELIMITER $$
CREATE TRIGGER `trg_cc_after_delete` AFTER DELETE ON `component_checkouts` FOR EACH ROW BEGIN
  IF OLD.checked_in_at IS NULL THEN
    UPDATE components SET qty_remaining = qty_remaining + OLD.qty WHERE id = OLD.component_id;
  END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_cc_after_insert` AFTER INSERT ON `component_checkouts` FOR EACH ROW BEGIN
  IF NEW.checked_in_at IS NULL THEN
    UPDATE components
      SET qty_remaining = qty_remaining - NEW.qty
    WHERE id = NEW.component_id;
  END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_cc_after_update` AFTER UPDATE ON `component_checkouts` FOR EACH ROW BEGIN
  IF OLD.checked_in_at IS NULL AND NEW.checked_in_at IS NOT NULL THEN
    UPDATE components SET qty_remaining = qty_remaining + OLD.qty WHERE id = NEW.component_id;
  END IF;

  IF OLD.checked_in_at IS NOT NULL AND NEW.checked_in_at IS NULL THEN
    IF (SELECT qty_remaining FROM components WHERE id = NEW.component_id) < NEW.qty THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'component_checkouts: insufficient stock to un-checkin';
    END IF;
    UPDATE components SET qty_remaining = qty_remaining - NEW.qty WHERE id = NEW.component_id;
  END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_cc_before_insert` BEFORE INSERT ON `component_checkouts` FOR EACH ROW BEGIN
  DECLARE rem INT;

  IF NEW.qty <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'component_checkouts: qty must be > 0';
  END IF;

  SELECT qty_remaining INTO rem
  FROM components WHERE id = NEW.component_id FOR UPDATE;

  IF rem < NEW.qty THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'component_checkouts: insufficient component stock';
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `consumables`
--

CREATE TABLE `consumables` (
  `id` bigint(20) NOT NULL,
  `name` varchar(150) NOT NULL,
  `category_id` bigint(20) DEFAULT NULL,
  `manufacturer_id` bigint(20) DEFAULT NULL,
  `supplier_id` bigint(20) DEFAULT NULL,
  `company_id` bigint(20) DEFAULT NULL,
  `location_id` bigint(20) DEFAULT NULL,
  `item_no` varchar(100) DEFAULT NULL,
  `model_no` varchar(100) DEFAULT NULL,
  `min_qty` int(11) NOT NULL DEFAULT 0,
  `qty_total` int(11) NOT NULL DEFAULT 0,
  `qty_remaining` int(11) NOT NULL DEFAULT 0,
  `unit_cost` decimal(13,4) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `consumables`
--

INSERT INTO `consumables` (`id`, `name`, `category_id`, `manufacturer_id`, `supplier_id`, `company_id`, `location_id`, `item_no`, `model_no`, `min_qty`, `qty_total`, `qty_remaining`, `unit_cost`, `notes`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Toner Cartridge – HP (Black)', 11, 3, 2, 1, 14, 'CONS-INK-001', 'M404-TONER-BK', 5, 15, 15, 85000.0000, 'Track with transactions (initial stock via txn)', '2026-02-20 17:48:14', '2026-02-20 18:06:50', NULL),
(2, 'A4 Paper (500 sheets)', 11, NULL, 2, 1, 14, 'CONS-PAPER-001', 'A4-REAM', 30, 120, 120, 4500.0000, 'Using Printer Ink category until Paper category added', '2026-02-20 17:48:14', '2026-02-20 18:06:50', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `consumable_transactions`
--

CREATE TABLE `consumable_transactions` (
  `id` bigint(20) NOT NULL,
  `consumable_id` bigint(20) NOT NULL,
  `txn_type` enum('in','out','adjust') NOT NULL,
  `qty` int(11) NOT NULL,
  `reference` varchar(120) DEFAULT NULL,
  `issued_to_user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `consumable_transactions`
--

INSERT INTO `consumable_transactions` (`id`, `consumable_id`, `txn_type`, `qty`, `reference`, `issued_to_user_id`, `created_at`) VALUES
(3, 1, 'in', 15, 'OPENING-STOCK-2026', NULL, '2026-02-20 18:06:50'),
(4, 2, 'in', 120, 'OPENING-STOCK-2026', NULL, '2026-02-20 18:06:50');

--
-- Triggers `consumable_transactions`
--
DELIMITER $$
CREATE TRIGGER `trg_ct_after_insert` AFTER INSERT ON `consumable_transactions` FOR EACH ROW BEGIN
  IF NEW.txn_type = 'in' THEN
    UPDATE consumables
      SET qty_total = qty_total + NEW.qty,
          qty_remaining = qty_remaining + NEW.qty
    WHERE id = NEW.consumable_id;
  ELSEIF NEW.txn_type = 'out' THEN
    UPDATE consumables
      SET qty_remaining = qty_remaining - NEW.qty
    WHERE id = NEW.consumable_id;
  ELSEIF NEW.txn_type = 'adjust' THEN
    UPDATE consumables
      SET qty_remaining = NEW.qty
    WHERE id = NEW.consumable_id;
  END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_ct_before_insert` BEFORE INSERT ON `consumable_transactions` FOR EACH ROW BEGIN
  DECLARE rem INT;

  IF NEW.qty <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'consumable_transactions: qty must be > 0';
  END IF;

  IF NEW.txn_type = 'out' THEN
    SELECT qty_remaining INTO rem
    FROM consumables WHERE id = NEW.consumable_id FOR UPDATE;

    IF rem < NEW.qty THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'consumable_transactions: insufficient stock';
    END IF;
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `head_of_department` int(11) DEFAULT NULL,
  `budget_allocation` decimal(15,2) DEFAULT 0.00,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `max_headcount` int(11) DEFAULT 50,
  `current_headcount` int(11) DEFAULT 0,
  `company_id` bigint(20) DEFAULT NULL,
  `location_id` bigint(20) DEFAULT NULL,
  `manager_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `name`, `description`, `head_of_department`, `budget_allocation`, `is_active`, `created_at`, `updated_at`, `max_headcount`, `current_headcount`, `company_id`, `location_id`, `manager_id`) VALUES
(1, 'Administration / Governance', 'Manages employee relations, recruitment, and HR policies', 2, 500000.00, 1, '2025-07-07 13:16:00', '2026-02-20 00:13:04', 50, 4, NULL, NULL, NULL),
(2, 'Security (includes Reception)', 'Handles financial planning, accounting, and budget management', 3, 750000.00, 1, '2025-07-07 13:16:00', '2026-02-20 00:13:04', 50, 4, NULL, NULL, NULL),
(3, 'Procurement', 'Manages IT infrastructure, software development, and technical support', 4, 1000000.00, 1, '2025-07-07 13:16:00', '2026-02-20 00:13:04', 50, 5, NULL, NULL, NULL),
(4, 'Finance', 'Oversees daily operations and process management', 5, 800000.00, 1, '2025-07-07 13:16:00', '2026-02-20 00:13:04', 50, 3, NULL, NULL, NULL),
(5, 'Human Resources', 'Handles legal matters, contracts, and compliance', NULL, 400000.00, 1, '2025-07-07 13:16:00', '2026-02-20 00:13:04', 50, 1, NULL, NULL, NULL),
(6, 'ICT / Facilities', 'Manages purchasing, vendor relations, and supply chain', NULL, 600000.00, 1, '2025-07-07 13:16:00', '2026-02-20 00:13:04', 50, 1, NULL, NULL, NULL),
(7, 'Asset Management', 'Tracks and maintains organizational assets', NULL, 300000.00, 1, '2025-07-07 13:16:00', '2026-02-20 00:13:04', 50, 1, NULL, NULL, NULL),
(8, 'Public Relations', 'Manages public communications and media relations', NULL, 250000.00, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00', 50, 0, NULL, NULL, NULL),
(9, 'Planning & Development', 'Strategic planning and organizational development', NULL, 450000.00, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00', 50, 0, NULL, NULL, NULL),
(10, 'Transportation', 'Manages fleet and transportation services', NULL, 350000.00, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00', 50, 0, NULL, NULL, NULL),
(11, 'Health & Safety', 'Ensures workplace safety and health compliance', NULL, 200000.00, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00', 50, 0, NULL, NULL, NULL),
(12, 'Revenue & Tax', 'Handles revenue collection and tax management', NULL, 550000.00, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00', 50, 0, NULL, NULL, NULL),
(1, 'Administration / Governance', 'Manages employee relations, recruitment, and HR policies', 2, 500000.00, 1, '2025-07-07 13:16:00', '2026-02-20 00:13:04', 50, 4, NULL, NULL, NULL),
(2, 'Security (includes Reception)', 'Handles financial planning, accounting, and budget management', 3, 750000.00, 1, '2025-07-07 13:16:00', '2026-02-20 00:13:04', 50, 4, NULL, NULL, NULL),
(3, 'Procurement', 'Manages IT infrastructure, software development, and technical support', 4, 1000000.00, 1, '2025-07-07 13:16:00', '2026-02-20 00:13:04', 50, 5, NULL, NULL, NULL),
(4, 'Finance', 'Oversees daily operations and process management', 5, 800000.00, 1, '2025-07-07 13:16:00', '2026-02-20 00:13:04', 50, 3, NULL, NULL, NULL),
(5, 'Human Resources', 'Handles legal matters, contracts, and compliance', NULL, 400000.00, 1, '2025-07-07 13:16:00', '2026-02-20 00:13:04', 50, 1, NULL, NULL, NULL),
(6, 'ICT / Facilities', 'Manages purchasing, vendor relations, and supply chain', NULL, 600000.00, 1, '2025-07-07 13:16:00', '2026-02-20 00:13:04', 50, 1, NULL, NULL, NULL),
(7, 'Asset Management', 'Tracks and maintains organizational assets', NULL, 300000.00, 1, '2025-07-07 13:16:00', '2026-02-20 00:13:04', 50, 1, NULL, NULL, NULL),
(8, 'Public Relations', 'Manages public communications and media relations', NULL, 250000.00, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00', 50, 0, NULL, NULL, NULL),
(9, 'Planning & Development', 'Strategic planning and organizational development', NULL, 450000.00, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00', 50, 0, NULL, NULL, NULL),
(10, 'Transportation', 'Manages fleet and transportation services', NULL, 350000.00, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00', 50, 0, NULL, NULL, NULL),
(11, 'Health & Safety', 'Ensures workplace safety and health compliance', NULL, 200000.00, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00', 50, 0, NULL, NULL, NULL),
(12, 'Revenue & Tax', 'Handles revenue collection and tax management', NULL, 550000.00, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00', 50, 0, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `depreciations`
--

CREATE TABLE `depreciations` (
  `id` bigint(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `months` int(11) NOT NULL,
  `depreciation_min` decimal(13,4) DEFAULT 0.0000,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `depreciations`
--

INSERT INTO `depreciations` (`id`, `name`, `months`, `depreciation_min`, `created_at`, `updated_at`) VALUES
(1, 'Computer Depreciation', 36, 0.0000, '2026-02-19 22:49:14', '2026-02-19 22:49:14'),
(2, 'Display Depreciation', 12, 0.0000, '2026-02-19 22:49:14', '2026-02-19 22:49:14'),
(3, 'Furniture Depreciation', 24, 0.0000, '2026-02-19 22:49:14', '2026-02-19 22:49:14'),
(4, 'Mobile Device Depreciation', 24, 0.0000, '2026-02-19 22:49:14', '2026-02-19 22:49:14');

-- --------------------------------------------------------

--
-- Table structure for table `disposal_records`
--

CREATE TABLE `disposal_records` (
  `id` bigint(20) NOT NULL,
  `disposal_date` date NOT NULL,
  `disposed_by` varchar(255) DEFAULT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `asset_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employee_benefits`
--

CREATE TABLE `employee_benefits` (
  `id` bigint(20) NOT NULL,
  `end_date` date DEFAULT NULL,
  `start_date` date NOT NULL,
  `benefit_plan_id` bigint(20) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employee_id_sequence`
--

CREATE TABLE `employee_id_sequence` (
  `id` int(11) NOT NULL,
  `last_employee_number` int(11) NOT NULL DEFAULT 20,
  `locked` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employee_id_sequence`
--

INSERT INTO `employee_id_sequence` (`id`, `last_employee_number`, `locked`) VALUES
(1, 22, 0);

-- --------------------------------------------------------

--
-- Table structure for table `employee_offboarding`
--

CREATE TABLE `employee_offboarding` (
  `id` bigint(20) NOT NULL,
  `access_revoked` bit(1) DEFAULT NULL,
  `assets_returned` bit(1) DEFAULT NULL,
  `clearance_completed` bit(1) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` bigint(20) DEFAULT NULL,
  `exit_interview_date` datetime(6) DEFAULT NULL,
  `exit_interview_scheduled` bit(1) DEFAULT NULL,
  `final_settlement_amount` double DEFAULT NULL,
  `final_settlement_paid` bit(1) DEFAULT NULL,
  `last_working_date` date DEFAULT NULL,
  `offboarding_type` varchar(255) DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `resignation_date` date DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employee_trainings`
--

CREATE TABLE `employee_trainings` (
  `id` bigint(20) NOT NULL,
  `completion_date` date DEFAULT NULL,
  `enrollment_date` date NOT NULL,
  `training_course_id` bigint(20) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `generated_reports`
--

CREATE TABLE `generated_reports` (
  `id` int(11) NOT NULL,
  `template_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `parameters` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`parameters`)),
  `file_path` varchar(255) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL,
  `status` enum('generating','completed','failed') DEFAULT 'generating',
  `generated_by` int(11) NOT NULL,
  `generated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL,
  `download_count` int(11) DEFAULT 0,
  `error_message` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `guard_posts`
--

CREATE TABLE `guard_posts` (
  `id` bigint(20) NOT NULL,
  `guards` int(11) NOT NULL,
  `post` varchar(255) NOT NULL,
  `shift` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `guard_posts`
--

INSERT INTO `guard_posts` (`id`, `guards`, `post`, `shift`, `status`) VALUES
(1, 4, 'Unilak FrontGate', 'Day', 'Active');

-- --------------------------------------------------------

--
-- Table structure for table `invoice_sequences`
--

CREATE TABLE `invoice_sequences` (
  `id` bigint(20) NOT NULL,
  `last_number` bigint(20) NOT NULL,
  `prefix` varchar(255) NOT NULL,
  `sequence_type` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `invoice_sequences`
--

INSERT INTO `invoice_sequences` (`id`, `last_number`, `prefix`, `sequence_type`) VALUES
(1, 7, 'AP', 'AP'),
(2, 1, 'AR', 'AR');

-- --------------------------------------------------------

--
-- Table structure for table `job_grades`
--

CREATE TABLE `job_grades` (
  `id` int(11) NOT NULL,
  `grade_code` varchar(10) NOT NULL,
  `grade_name` varchar(100) NOT NULL,
  `base_salary` decimal(12,2) NOT NULL,
  `allowances` decimal(12,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `job_grades`
--

INSERT INTO `job_grades` (`id`, `grade_code`, `grade_name`, `base_salary`, `allowances`, `created_at`) VALUES
(1, 'G1', 'Entry Level', 30000.00, 2000.00, '2026-01-11 11:20:23'),
(2, 'G2', 'Junior', 45000.00, 3000.00, '2026-01-11 11:20:23'),
(3, 'G3', 'Mid Level', 60000.00, 4000.00, '2026-01-11 11:20:23'),
(4, 'G4', 'Senior', 80000.00, 5000.00, '2026-01-11 11:20:23'),
(5, 'G5', 'Manager', 120000.00, 8000.00, '2026-01-11 11:20:23');

-- --------------------------------------------------------

--
-- Table structure for table `job_postings`
--

CREATE TABLE `job_postings` (
  `id` bigint(20) NOT NULL,
  `closing_date` date DEFAULT NULL,
  `created_by` bigint(20) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `job_grade_id` int(11) DEFAULT NULL,
  `posting_date` date DEFAULT NULL,
  `required_qualifications` text DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `journal_entries`
--

CREATE TABLE `journal_entries` (
  `id` int(11) NOT NULL,
  `entry_number` varchar(20) NOT NULL,
  `entry_date` date NOT NULL,
  `description` text NOT NULL,
  `reference_number` varchar(50) DEFAULT NULL,
  `total_debit` decimal(15,2) NOT NULL,
  `total_credit` decimal(15,2) NOT NULL,
  `status` enum('draft','posted','reversed') DEFAULT 'draft',
  `created_by` int(11) NOT NULL,
  `posted_by` int(11) DEFAULT NULL,
  `posted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `account_code` varchar(255) NOT NULL,
  `amount` decimal(38,2) NOT NULL,
  `reference` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `journal_entries`
--

INSERT INTO `journal_entries` (`id`, `entry_number`, `entry_date`, `description`, `reference_number`, `total_debit`, `total_credit`, `status`, `created_by`, `posted_by`, `posted_at`, `created_at`, `updated_at`, `account_code`, `amount`, `reference`) VALUES
(38, 'JE-20250728-001-L01', '2025-07-28', 'Cash Sale of Services (Bank Account)', 'INV-001', 5000.00, 0.00, 'posted', 1, 1, '2025-07-28 07:15:00', '2025-07-28 07:10:00', '2025-07-28 07:15:00', '1120', 5000.00, NULL),
(39, 'JE-20250728-001-L02', '2025-07-28', 'Cash Sale of Services (Service Revenue)', 'INV-001', 0.00, 5000.00, 'posted', 1, 1, '2025-07-28 07:15:00', '2025-07-28 07:10:00', '2025-07-28 07:15:00', '4100', 5000.00, NULL),
(40, 'JE-20250728-002-L01', '2025-07-28', 'Office Supplies Purchase (Expense)', 'PO-005', 750.00, 0.00, 'posted', 1, 1, '2025-07-28 08:00:00', '2025-07-28 07:55:00', '2025-07-28 08:00:00', '6100', 750.00, NULL),
(41, 'JE-20250728-002-L02', '2025-07-28', 'Office Supplies Purchase (Bank Account)', 'PO-005', 0.00, 750.00, 'posted', 1, 1, '2025-07-28 08:00:00', '2025-07-28 07:55:00', '2025-07-28 08:00:00', '1120', 750.00, NULL),
(42, 'JE-20250728-003-L01', '2025-07-28', 'Payment of Accounts Payable (AP)', 'CHK-1001', 2500.00, 0.00, 'posted', 1, 1, '2025-07-28 09:30:00', '2025-07-28 09:25:00', '2025-07-28 09:30:00', '2100', 2500.00, NULL),
(43, 'JE-20250728-003-L02', '2025-07-28', 'Payment of Accounts Payable (Bank Account)', 'CHK-1001', 0.00, 2500.00, 'posted', 1, 1, '2025-07-28 09:30:00', '2025-07-28 09:25:00', '2025-07-28 09:30:00', '1120', 2500.00, NULL),
(44, 'JE-20250729-004-L01', '2025-07-29', 'Received Grant Revenue (Bank Account)', 'GR-2025-001', 10000.00, 0.00, 'posted', 1, 1, '2025-07-29 07:00:00', '2025-07-29 06:55:00', '2025-07-29 07:00:00', '1120', 10000.00, NULL),
(45, 'JE-20250729-004-L02', '2025-07-29', 'Received Grant Revenue (Grant Revenue)', 'GR-2025-001', 0.00, 10000.00, 'posted', 1, 1, '2025-07-29 07:00:00', '2025-07-29 06:55:00', '2025-07-29 07:00:00', '4200', 10000.00, NULL),
(46, 'JE-20250729-005-L01', '2025-07-29', 'Payroll Expense (Salaries & Wages)', 'PR-0725', 20000.00, 0.00, 'posted', 1, 1, '2025-07-29 12:00:00', '2025-07-29 11:55:00', '2025-07-29 12:00:00', '5100', 20000.00, NULL),
(47, 'JE-20250729-005-L02', '2025-07-29', 'Payroll Expense (Bank Account)', 'PR-0725', 0.00, 20000.00, 'posted', 1, 1, '2025-07-29 12:00:00', '2025-07-29 11:55:00', '2025-07-29 12:00:00', '1120', 20000.00, NULL),
(48, 'JE-20250730-006-L01', '2025-07-30', 'Accounts Receivable Collection (Bank Account)', 'INV-002-PAY', 3000.00, 0.00, 'posted', 1, 1, '2025-07-30 07:30:00', '2025-07-30 07:25:00', '2025-07-30 07:30:00', '1120', 3000.00, NULL),
(49, 'JE-20250730-006-L02', '2025-07-30', 'Accounts Receivable Collection (AR)', 'INV-002-PAY', 0.00, 3000.00, 'posted', 1, 1, '2025-07-30 07:30:00', '2025-07-30 07:25:00', '2025-07-30 07:30:00', '1200', 3000.00, NULL),
(50, 'JE-20250730-007-L01', '2025-07-30', 'Purchase of Inventory on Credit (Inventory)', 'PO-006', 8000.00, 0.00, 'posted', 1, 1, '2025-07-30 08:10:00', '2025-07-30 08:05:00', '2025-07-30 08:10:00', '1300', 8000.00, NULL),
(51, 'JE-20250730-007-L02', '2025-07-30', 'Purchase of Inventory on Credit (AP)', 'PO-006', 0.00, 8000.00, 'posted', 1, 1, '2025-07-30 08:10:00', '2025-07-30 08:05:00', '2025-07-30 08:10:00', '2100', 8000.00, NULL),
(52, 'JE-20250730-008-L01', '2025-07-30', 'Prepaid Insurance Payment (Prepaid Expenses)', 'INS-987', 1200.00, 0.00, 'posted', 1, 1, '2025-07-30 09:00:00', '2025-07-30 08:55:00', '2025-07-30 09:00:00', '1400', 1200.00, NULL),
(53, 'JE-20250730-008-L02', '2025-07-30', 'Prepaid Insurance Payment (Bank Account)', 'INS-987', 0.00, 1200.00, 'posted', 1, 1, '2025-07-30 09:00:00', '2025-07-30 08:55:00', '2025-07-30 09:00:00', '1120', 1200.00, NULL),
(54, 'JE-20250730-009-L01', '2025-07-30', 'Utility Bill Payment (Expense)', 'UTIL-JUL', 350.00, 0.00, 'posted', 1, 1, '2025-07-30 10:00:00', '2025-07-30 09:55:00', '2025-07-30 10:00:00', '6200', 350.00, NULL),
(55, 'JE-20250730-009-L02', '2025-07-30', 'Utility Bill Payment (Bank Account)', 'UTIL-JUL', 0.00, 350.00, 'posted', 1, 1, '2025-07-30 10:00:00', '2025-07-30 09:55:00', '2025-07-30 10:00:00', '1120', 350.00, NULL),
(56, 'JE-20250730-010-L01', '2025-07-30', 'New Equipment Purchase (Equipment)', 'EQ-001', 5000.00, 0.00, 'posted', 1, 1, '2025-07-30 11:00:00', '2025-07-30 10:55:00', '2025-07-30 11:00:00', '1520', 5000.00, NULL),
(57, 'JE-20250730-010-L02', '2025-07-30', 'New Equipment Purchase (Bank Account)', 'EQ-001', 0.00, 5000.00, 'posted', 1, 1, '2025-07-30 11:00:00', '2025-07-30 10:55:00', '2025-07-30 11:00:00', '1120', 5000.00, NULL),
(58, 'JE-20250731-011-L01', '2025-07-31', 'Accrued Rent Expense (Expense)', 'RENT-JUL', 1500.00, 0.00, 'posted', 1, 1, '2025-07-31 07:00:00', '2025-07-31 06:55:00', '2025-07-31 07:00:00', '6300', 1500.00, NULL),
(59, 'JE-20250731-011-L02', '2025-07-31', 'Accrued Rent Expense (Accrued Expenses)', 'RENT-JUL', 0.00, 1500.00, 'posted', 1, 1, '2025-07-31 07:00:00', '2025-07-31 06:55:00', '2025-07-31 07:00:00', '2200', 1500.00, NULL),
(60, 'JE-20250731-012-L01', '2025-07-31', 'Petty Cash Replenishment (Petty Cash)', 'PC-JUL-01', 200.00, 0.00, 'posted', 1, 1, '2025-07-31 08:00:00', '2025-07-31 07:55:00', '2025-07-31 08:00:00', '1110', 200.00, NULL),
(61, 'JE-20250731-012-L02', '2025-07-31', 'Petty Cash Replenishment (Bank Account)', 'PC-JUL-01', 0.00, 200.00, 'posted', 1, 1, '2025-07-31 08:00:00', '2025-07-31 07:55:00', '2025-07-31 08:00:00', '1120', 200.00, NULL),
(62, 'JE-20250731-013-L01', '2025-07-31', 'Loan Interest Accrual (Interest Expense)', 'LOAN-INT-JUL', 500.00, 0.00, 'posted', 1, 1, '2025-07-31 09:00:00', '2025-07-31 08:55:00', '2025-07-31 09:00:00', '6400', 500.00, NULL),
(63, 'JE-20250731-013-L02', '2025-07-31', 'Loan Interest Accrual (Accrued Expenses)', 'LOAN-INT-JUL', 0.00, 500.00, 'posted', 1, 1, '2025-07-31 09:00:00', '2025-07-31 08:55:00', '2025-07-31 09:00:00', '2200', 500.00, NULL),
(64, 'JE-20250801-014-L01', '2025-08-01', 'Depreciation Expense (Expense)', 'DEP-AUG', 800.00, 0.00, 'posted', 1, 1, '2025-08-01 07:00:00', '2025-08-01 06:55:00', '2025-08-01 07:00:00', '6500', 800.00, NULL),
(65, 'JE-20250801-014-L02', '2025-08-01', 'Depreciation Expense (Accumulated Depreciation)', 'DEP-AUG', 0.00, 800.00, 'posted', 1, 1, '2025-08-01 07:00:00', '2025-08-01 06:55:00', '2025-08-01 07:00:00', '1590', 800.00, NULL),
(66, 'JE-20250801-015-L01', '2025-08-01', 'Consulting Fees Paid (Expense)', 'CONSULT-003', 1500.00, 0.00, 'posted', 1, 1, '2025-08-01 08:00:00', '2025-08-01 07:55:00', '2025-08-01 08:00:00', '6600', 1500.00, NULL),
(67, 'JE-20250801-015-L02', '2025-08-01', 'Consulting Fees Paid (Bank Account)', 'CONSULT-003', 0.00, 1500.00, 'posted', 1, 1, '2025-08-01 08:00:00', '2025-08-01 07:55:00', '2025-08-01 08:00:00', '1120', 1500.00, NULL),
(68, 'JE-20250801-016-L01', '2025-08-01', 'Other Revenue Received (Bank Account)', 'MISC-001', 250.00, 0.00, 'posted', 1, 1, '2025-08-01 09:00:00', '2025-08-01 08:55:00', '2025-08-01 09:00:00', '1120', 250.00, NULL),
(69, 'JE-20250801-016-L02', '2025-08-01', 'Other Revenue Received (Other Revenue)', 'MISC-001', 0.00, 250.00, 'posted', 1, 1, '2025-08-01 09:00:00', '2025-08-01 08:55:00', '2025-08-01 09:00:00', '4300', 250.00, NULL),
(70, 'JE-20250801-017-L01', '2025-08-01', 'Adjustment for Bad Debt (Bad Debt Expense)', 'ADJ-BAD-DEBT', 100.00, 0.00, 'posted', 1, 1, '2025-08-01 10:00:00', '2025-08-01 09:55:00', '2025-08-01 10:00:00', '6700', 100.00, NULL),
(71, 'JE-20250801-017-L02', '2025-08-01', 'Adjustment for Bad Debt (Allowance for Doubtful Accounts)', 'ADJ-BAD-DEBT', 0.00, 100.00, 'posted', 1, 1, '2025-08-01 10:00:00', '2025-08-01 09:55:00', '2025-08-01 10:00:00', '1210', 100.00, NULL),
(72, 'JE-20250801-018-L01', '2025-08-01', 'Closing Revenue (Revenue)', 'CL-ENTRY-JUL', 10000.00, 0.00, 'posted', 1, 1, '2025-08-01 15:00:00', '2025-08-01 14:55:00', '2025-08-01 15:00:00', '4000', 10000.00, NULL),
(73, 'JE-20250801-018-L02', '2025-08-01', 'Closing Expenses (Operating Expenses)', 'CL-ENTRY-JUL', 0.00, 7000.00, 'posted', 1, 1, '2025-08-01 15:00:00', '2025-08-01 14:55:00', '2025-08-01 15:00:00', '5000', 7000.00, NULL),
(74, 'JE-20250801-018-L03', '2025-08-01', 'Closing to Retained Earnings (Retained Earnings)', 'CL-ENTRY-JUL', 0.00, 3000.00, 'posted', 1, 1, '2025-08-01 15:00:00', '2025-08-01 14:55:00', '2025-08-01 15:00:00', '3100', 3000.00, NULL),
(75, 'JE-20260120-038', '2026-01-20', 'AP Invoice: AP-20260120-0006 - 3D banners', NULL, 25000.00, 25000.00, 'posted', 1, NULL, NULL, '2026-01-20 14:20:43', '2026-01-20 14:20:43', '5600', 25000.00, 'AP-AP-20260120-0006'),
(76, 'JE-20260120-039', '2026-01-20', 'Payment made for Invoice: AP-20260120-0006', NULL, 25000.00, 25000.00, 'posted', 1, NULL, NULL, '2026-01-20 14:21:28', '2026-01-20 14:21:28', '2100', 25000.00, 'PMT-AP-20260120-0006'),
(79, 'JE-20260120-040-L01', '2026-01-20', 'AP Invoice: AP-20260120-0007 (Expense)', NULL, 300.00, 0.00, 'posted', 1, NULL, NULL, '2026-01-20 14:43:54', '2026-01-20 14:43:54', '5800', 300.00, 'AP-AP-20260120-0007-DR'),
(80, 'JE-20260120-041-L02', '2026-01-20', 'AP Invoice: AP-20260120-0007 (AP)', NULL, 0.00, 300.00, 'posted', 1, NULL, NULL, '2026-01-20 14:43:54', '2026-01-20 14:43:54', '2200', 300.00, 'AP-AP-20260120-0007-CR');

-- --------------------------------------------------------

--
-- Table structure for table `journal_entry_lines`
--

CREATE TABLE `journal_entry_lines` (
  `id` int(11) NOT NULL,
  `journal_entry_id` int(11) NOT NULL,
  `account_id` int(11) NOT NULL,
  `description` varchar(200) DEFAULT NULL,
  `debit_amount` decimal(12,2) DEFAULT 0.00,
  `credit_amount` decimal(12,2) DEFAULT 0.00,
  `line_number` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `leave_approvals`
--

CREATE TABLE `leave_approvals` (
  `id` varchar(50) NOT NULL,
  `leave_request_id` varchar(50) NOT NULL,
  `approver_id` int(10) UNSIGNED NOT NULL,
  `approval_level` int(11) NOT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `comments` text DEFAULT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `leave_approvals`
--

INSERT INTO `leave_approvals` (`id`, `leave_request_id`, `approver_id`, `approval_level`, `status`, `comments`, `created_at`) VALUES
('LA_1758722194524', '11', 1, 1, 'approved', NULL, '2025-09-24 13:56:34'),
('LA_1758723253334', '12', 1, 1, 'rejected', 'Request rejected', '2025-09-24 14:14:13'),
('LA_1763639467354', '41', 1, 1, 'approved', NULL, '2025-11-20 11:51:07'),
('LA_1763640937709', '42', 1, 1, 'approved', NULL, '2025-11-20 12:15:37'),
('LA_1768853700106', '46', 1, 1, 'approved', NULL, '2026-01-19 20:15:00'),
('LA_1768853912493', '45', 1, 1, 'approved', NULL, '2026-01-19 20:18:32'),
('LA_1768853929139', '44', 1, 1, 'approved', NULL, '2026-01-19 20:18:49'),
('LA_1768853979753', '43', 1, 1, 'approved', NULL, '2026-01-19 20:19:39'),
('LA_1768854161418', '13', 1, 1, 'approved', NULL, '2026-01-19 20:22:41'),
('LA_1768854464035', '14', 1, 1, 'approved', NULL, '2026-01-19 20:27:44'),
('LA_1768854483419', '15', 1, 1, 'approved', NULL, '2026-01-19 20:28:03'),
('LA_1769351142185', '16', 1, 1, 'rejected', 'Request rejected', '2026-01-25 14:25:42'),
('LA_1769351500554', '17', 1, 1, 'approved', NULL, '2026-01-25 14:31:40'),
('LA_1769351503656', '18', 1, 1, 'approved', NULL, '2026-01-25 14:31:43'),
('LA_1769351506698', '19', 1, 1, 'rejected', 'Request rejected', '2026-01-25 14:31:46'),
('LA_1769351516337', '20', 1, 1, 'rejected', 'Request rejected', '2026-01-25 14:31:56'),
('LA_1769351518818', '21', 1, 1, 'approved', NULL, '2026-01-25 14:31:58'),
('LA_1769351520891', '22', 1, 1, 'approved', NULL, '2026-01-25 14:32:00'),
('LA_1769351522919', '23', 1, 1, 'approved', NULL, '2026-01-25 14:32:02'),
('LA_1769351524985', '24', 1, 1, 'approved', NULL, '2026-01-25 14:32:04'),
('LA_1769351528628', '25', 1, 1, 'approved', NULL, '2026-01-25 14:32:08'),
('LA_1769351530705', '26', 1, 1, 'rejected', 'Request rejected', '2026-01-25 14:32:10'),
('LA_1769351533186', '27', 1, 1, 'rejected', 'Request rejected', '2026-01-25 14:32:13'),
('LA_1769351535498', '28', 1, 1, 'rejected', 'Request rejected', '2026-01-25 14:32:15'),
('LA_1769351538211', '29', 1, 1, 'approved', NULL, '2026-01-25 14:32:18'),
('LA_1769351540674', '30', 1, 1, 'approved', NULL, '2026-01-25 14:32:20'),
('LA_1769351542552', '31', 1, 1, 'approved', NULL, '2026-01-25 14:32:22'),
('LA_1769351545089', '32', 1, 1, 'approved', NULL, '2026-01-25 14:32:25'),
('LA_1769351547106', '33', 1, 1, 'approved', NULL, '2026-01-25 14:32:27'),
('LA_1769351549207', '34', 1, 1, 'approved', NULL, '2026-01-25 14:32:29'),
('LA_1769351551919', '35', 1, 1, 'approved', NULL, '2026-01-25 14:32:31'),
('LA_1769351553675', '36', 1, 1, 'approved', NULL, '2026-01-25 14:32:33'),
('LA_1769351555884', '37', 1, 1, 'approved', NULL, '2026-01-25 14:32:35'),
('LA_1769351557832', '38', 1, 1, 'approved', NULL, '2026-01-25 14:32:37'),
('LA_1769351560670', '39', 1, 1, 'approved', NULL, '2026-01-25 14:32:40'),
('LA_1769351646577', '3', 1, 1, 'approved', NULL, '2026-01-25 14:34:06'),
('LA_1769351772571', '6', 1, 1, 'rejected', 'Request rejected', '2026-01-25 14:36:12'),
('LA_1769351776932', '7', 1, 1, 'rejected', 'Request rejected', '2026-01-25 14:36:16'),
('LA_1769351783265', '5', 1, 1, 'rejected', 'Request rejected', '2026-01-25 14:36:23');

-- --------------------------------------------------------

--
-- Table structure for table `leave_balances`
--

CREATE TABLE `leave_balances` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `leave_type_id` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `allocated_days` decimal(4,1) DEFAULT 0.0,
  `used_days` decimal(4,1) DEFAULT 0.0,
  `carried_forward_days` decimal(4,1) DEFAULT 0.0,
  `remaining_days` decimal(4,1) GENERATED ALWAYS AS (`allocated_days` + `carried_forward_days` - `used_days`) STORED,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `leave_balances`
--

INSERT INTO `leave_balances` (`id`, `user_id`, `leave_type_id`, `year`, `allocated_days`, `used_days`, `carried_forward_days`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 2024, 21.0, 3.0, 0.0, '2025-07-07 13:16:00', '2025-09-24 12:59:38'),
(2, 2, 1, 2024, 21.0, 3.0, 0.0, '2025-07-07 13:16:00', '2025-09-24 13:56:34'),
(3, 3, 1, 2024, 21.0, 3.0, 0.0, '2025-07-07 13:16:00', '2026-01-19 20:22:41'),
(4, 4, 1, 2024, 21.0, 3.0, 0.0, '2025-07-07 13:16:00', '2026-01-19 20:28:03'),
(5, 5, 1, 2024, 21.0, 3.0, 0.0, '2025-07-07 13:16:00', '2026-01-25 14:31:40'),
(6, 6, 1, 2024, 21.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(7, 7, 1, 2024, 21.0, 3.0, 0.0, '2025-07-07 13:16:00', '2026-01-25 14:31:58'),
(8, 8, 1, 2024, 21.0, 3.0, 0.0, '2025-07-07 13:16:00', '2026-01-25 14:32:02'),
(9, 9, 1, 2024, 21.0, 3.0, 0.0, '2025-07-07 13:16:00', '2026-01-25 14:32:08'),
(10, 10, 1, 2024, 21.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(11, 11, 1, 2024, 21.0, 13.0, 0.0, '2025-07-07 13:16:00', '2026-01-25 14:34:06'),
(12, 12, 1, 2024, 21.0, 3.0, 0.0, '2025-07-07 13:16:00', '2026-01-25 14:32:22'),
(13, 13, 1, 2024, 21.0, 3.0, 0.0, '2025-07-07 13:16:00', '2026-01-25 14:32:27'),
(14, 14, 1, 2024, 21.0, 3.0, 0.0, '2025-07-07 13:16:00', '2026-01-25 14:32:31'),
(15, 15, 1, 2024, 21.0, 3.0, 0.0, '2025-07-07 13:16:00', '2026-01-25 14:32:35'),
(16, 1, 1, 2025, 10.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-08 07:45:28'),
(17, 2, 2, 2024, 10.0, 1.0, 0.0, '2025-07-07 13:16:00', '2025-09-24 13:00:11'),
(18, 3, 2, 2024, 10.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(19, 4, 0, 2024, 10.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-08 07:20:05'),
(20, 5, 2, 2024, 10.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(21, 6, 2, 2024, 10.0, 1.0, 0.0, '2025-07-07 13:16:00', '2026-01-25 14:31:43'),
(22, 7, 2, 2024, 10.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(23, 8, 2, 2024, 10.0, 1.0, 0.0, '2025-07-07 13:16:00', '2026-01-25 14:32:00'),
(24, 9, 2, 2024, 10.0, 1.0, 0.0, '2025-07-07 13:16:00', '2026-01-25 14:32:04'),
(25, 10, 2, 2024, 10.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(26, 11, 2, 2024, 10.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(27, 12, 2, 2024, 10.0, 1.0, 0.0, '2025-07-07 13:16:00', '2026-01-25 14:32:20'),
(28, 13, 2, 2024, 10.0, 1.0, 0.0, '2025-07-07 13:16:00', '2026-01-25 14:32:25'),
(29, 14, 2, 2024, 10.0, 1.0, 0.0, '2025-07-07 13:16:00', '2026-01-25 14:32:29'),
(30, 15, 2, 2024, 10.0, 1.0, 0.0, '2025-07-07 13:16:00', '2026-01-25 14:32:33'),
(31, 1, 3, 2024, 5.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(32, 2, 3, 2024, 5.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(33, 3, 3, 2024, 5.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(34, 4, 3, 2024, 5.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(35, 5, 3, 2024, 5.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(36, 6, 3, 2024, 5.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(37, 7, 3, 2024, 5.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(38, 8, 3, 2024, 5.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(39, 9, 3, 2024, 5.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(40, 10, 3, 2024, 5.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(41, 11, 3, 2024, 5.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(42, 12, 3, 2024, 5.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(43, 13, 3, 2024, 5.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(44, 14, 3, 2024, 5.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(45, 15, 3, 2024, 5.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(46, 1, 4, 2024, 90.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(47, 2, 4, 2024, 90.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(48, 3, 4, 2024, 90.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(49, 4, 4, 2024, 90.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(50, 5, 4, 2024, 90.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(51, 6, 4, 2024, 90.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(52, 7, 4, 2024, 90.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(53, 8, 4, 2024, 90.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(54, 9, 4, 2024, 90.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(55, 10, 4, 2024, 90.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(56, 11, 4, 2024, 90.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(57, 12, 4, 2024, 90.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(58, 13, 4, 2024, 90.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(59, 14, 4, 2024, 90.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(60, 15, 4, 2024, 90.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(61, 1, 5, 2024, 14.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(62, 2, 5, 2024, 14.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(63, 3, 5, 2024, 14.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(64, 4, 5, 2024, 14.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(65, 5, 5, 2024, 14.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(66, 6, 5, 2024, 14.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(67, 7, 5, 2024, 14.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(68, 8, 5, 2024, 14.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(69, 9, 5, 2024, 14.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(70, 10, 5, 2024, 14.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(71, 11, 5, 2024, 14.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(72, 12, 5, 2024, 14.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(73, 13, 5, 2024, 14.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(74, 14, 5, 2024, 14.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(75, 15, 5, 2024, 14.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(76, 1, 6, 2024, 3.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(77, 2, 6, 2024, 3.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(78, 3, 6, 2024, 3.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(79, 4, 6, 2024, 3.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(80, 5, 6, 2024, 3.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(81, 6, 6, 2024, 3.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(82, 7, 6, 2024, 3.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(83, 8, 6, 2024, 3.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(84, 9, 6, 2024, 3.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(85, 10, 6, 2024, 3.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(86, 11, 6, 2024, 3.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(87, 12, 6, 2024, 3.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(88, 13, 6, 2024, 3.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(89, 14, 6, 2024, 3.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(90, 15, 6, 2024, 3.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(91, 1, 7, 2024, 10.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(92, 2, 7, 2024, 10.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(93, 3, 7, 2024, 10.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(94, 4, 7, 2024, 10.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(95, 5, 7, 2024, 10.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(96, 6, 7, 2024, 10.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(97, 7, 7, 2024, 10.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(98, 8, 7, 2024, 10.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(99, 9, 7, 2024, 10.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(100, 10, 7, 2024, 10.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(101, 11, 7, 2024, 10.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(102, 12, 7, 2024, 10.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(103, 13, 7, 2024, 10.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(104, 14, 7, 2024, 10.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(105, 15, 7, 2024, 10.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(106, 1, 8, 2024, 2.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(107, 2, 8, 2024, 2.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(108, 3, 8, 2024, 2.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(109, 4, 8, 2024, 2.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(110, 5, 8, 2024, 2.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(111, 6, 8, 2024, 2.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(112, 7, 8, 2024, 2.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(113, 8, 8, 2024, 2.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(114, 9, 8, 2024, 2.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(115, 10, 8, 2024, 2.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(116, 11, 8, 2024, 2.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(117, 12, 8, 2024, 2.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(118, 13, 8, 2024, 2.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(119, 14, 8, 2024, 2.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(120, 15, 8, 2024, 2.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(122, 19, 1, 2025, 21.0, 0.0, 0.0, '2025-07-08 08:02:12', '2025-07-08 08:02:12'),
(123, 19, 2, 2025, 10.0, 0.0, 0.0, '2025-07-08 08:02:12', '2025-07-08 08:02:12'),
(124, 19, 3, 2025, 5.0, 0.0, 0.0, '2025-07-08 08:02:12', '2025-07-08 08:02:12'),
(125, 19, 4, 2025, 90.0, 0.0, 0.0, '2025-07-08 08:02:12', '2025-07-08 08:02:12'),
(126, 19, 5, 2025, 14.0, 23.0, 0.0, '2025-07-08 08:02:12', '2025-09-24 10:22:05'),
(127, 19, 6, 2025, 3.0, 0.0, 0.0, '2025-07-08 08:02:12', '2025-07-08 08:02:12'),
(128, 19, 7, 2025, 10.0, 0.0, 0.0, '2025-07-08 08:02:12', '2025-07-08 08:02:12'),
(129, 19, 8, 2025, 2.0, 0.0, 0.0, '2025-07-08 08:02:12', '2025-07-08 08:02:12'),
(130, 2, 1, 2025, 21.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(131, 3, 1, 2025, 21.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(132, 4, 1, 2025, 21.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(133, 5, 1, 2025, 21.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(134, 6, 1, 2025, 21.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(135, 7, 1, 2025, 21.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(136, 8, 1, 2025, 21.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(137, 9, 1, 2025, 21.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(138, 10, 1, 2025, 21.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(139, 11, 1, 2025, 21.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(140, 12, 1, 2025, 21.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(141, 13, 1, 2025, 21.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(142, 14, 1, 2025, 21.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(143, 15, 1, 2025, 21.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(144, 20, 1, 2025, 21.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(145, 21, 1, 2025, 21.0, 3.0, 0.0, '2025-10-06 12:03:00', '2025-11-20 11:51:07'),
(146, 1, 2, 2025, 10.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(147, 2, 2, 2025, 10.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(148, 3, 2, 2025, 10.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(149, 4, 2, 2025, 10.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(150, 5, 2, 2025, 10.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(151, 6, 2, 2025, 10.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(152, 7, 2, 2025, 10.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(153, 8, 2, 2025, 10.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(154, 9, 2, 2025, 10.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(155, 10, 2, 2025, 10.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(156, 11, 2, 2025, 10.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(157, 12, 2, 2025, 10.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(158, 13, 2, 2025, 10.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(159, 14, 2, 2025, 10.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(160, 15, 2, 2025, 10.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(161, 20, 2, 2025, 10.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(162, 21, 2, 2025, 10.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(163, 1, 3, 2025, 5.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(164, 2, 3, 2025, 5.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(165, 3, 3, 2025, 5.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(166, 4, 3, 2025, 5.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(167, 5, 3, 2025, 5.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(168, 6, 3, 2025, 5.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(169, 7, 3, 2025, 5.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(170, 8, 3, 2025, 5.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(171, 9, 3, 2025, 5.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(172, 10, 3, 2025, 5.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(173, 11, 3, 2025, 5.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(174, 12, 3, 2025, 5.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(175, 13, 3, 2025, 5.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(176, 14, 3, 2025, 5.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(177, 15, 3, 2025, 5.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(178, 20, 3, 2025, 5.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(179, 21, 3, 2025, 5.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(180, 1, 4, 2025, 90.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(181, 2, 4, 2025, 90.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(182, 3, 4, 2025, 90.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(183, 4, 4, 2025, 90.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(184, 5, 4, 2025, 90.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(185, 6, 4, 2025, 90.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(186, 7, 4, 2025, 90.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(187, 8, 4, 2025, 90.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(188, 9, 4, 2025, 90.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(189, 10, 4, 2025, 90.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(190, 11, 4, 2025, 90.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(191, 12, 4, 2025, 90.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(192, 13, 4, 2025, 90.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(193, 14, 4, 2025, 90.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(194, 15, 4, 2025, 90.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(195, 20, 4, 2025, 90.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(196, 21, 4, 2025, 90.0, 63.1, 0.0, '2025-10-06 12:03:00', '2026-01-19 20:19:39'),
(197, 1, 5, 2025, 14.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(198, 2, 5, 2025, 14.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(199, 3, 5, 2025, 14.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(200, 4, 5, 2025, 14.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(201, 5, 5, 2025, 14.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(202, 6, 5, 2025, 14.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(203, 7, 5, 2025, 14.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(204, 8, 5, 2025, 14.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(205, 9, 5, 2025, 14.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(206, 10, 5, 2025, 14.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(207, 11, 5, 2025, 14.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(208, 12, 5, 2025, 14.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(209, 13, 5, 2025, 14.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(210, 14, 5, 2025, 14.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(211, 15, 5, 2025, 14.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(212, 20, 5, 2025, 14.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(213, 21, 5, 2025, 14.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(214, 1, 6, 2025, 3.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(215, 2, 6, 2025, 3.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(216, 3, 6, 2025, 3.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(217, 4, 6, 2025, 3.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(218, 5, 6, 2025, 3.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(219, 6, 6, 2025, 3.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(220, 7, 6, 2025, 3.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(221, 8, 6, 2025, 3.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(222, 9, 6, 2025, 3.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(223, 10, 6, 2025, 3.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(224, 11, 6, 2025, 3.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(225, 12, 6, 2025, 3.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(226, 13, 6, 2025, 3.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(227, 14, 6, 2025, 3.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(228, 15, 6, 2025, 3.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(229, 20, 6, 2025, 3.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(230, 21, 6, 2025, 3.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(231, 1, 7, 2025, 10.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(232, 2, 7, 2025, 10.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(233, 3, 7, 2025, 10.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(234, 4, 7, 2025, 10.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(235, 5, 7, 2025, 10.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(236, 6, 7, 2025, 10.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(237, 7, 7, 2025, 10.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(238, 8, 7, 2025, 10.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(239, 9, 7, 2025, 10.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(240, 10, 7, 2025, 10.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(241, 11, 7, 2025, 10.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(242, 12, 7, 2025, 10.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(243, 13, 7, 2025, 10.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(244, 14, 7, 2025, 10.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(245, 15, 7, 2025, 10.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(246, 20, 7, 2025, 10.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(247, 21, 7, 2025, 10.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(248, 1, 8, 2025, 2.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(249, 2, 8, 2025, 2.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(250, 3, 8, 2025, 2.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(251, 4, 8, 2025, 2.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(252, 5, 8, 2025, 2.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(253, 6, 8, 2025, 2.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(254, 7, 8, 2025, 2.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(255, 8, 8, 2025, 2.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(256, 9, 8, 2025, 2.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(257, 10, 8, 2025, 2.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(258, 11, 8, 2025, 2.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(259, 12, 8, 2025, 2.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(260, 13, 8, 2025, 2.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(261, 14, 8, 2025, 2.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(262, 15, 8, 2025, 2.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(263, 20, 8, 2025, 2.0, 0.0, 0.0, '2025-10-06 12:03:00', '2025-10-06 12:03:00'),
(264, 21, 8, 2025, 2.0, 4.0, 0.0, '2025-10-06 12:03:00', '2026-01-19 20:18:49');

-- --------------------------------------------------------

--
-- Table structure for table `leave_blackouts`
--

CREATE TABLE `leave_blackouts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `leave_request_id` int(11) NOT NULL,
  `blackout_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `leave_requests`
--

CREATE TABLE `leave_requests` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `leave_type_id` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `total_days` decimal(4,1) NOT NULL,
  `reason` text NOT NULL,
  `status` enum('pending','approved','rejected','cancelled','completed') NOT NULL DEFAULT 'pending',
  `supporting_documents` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`supporting_documents`)),
  `applied_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `reviewed_by` int(11) DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `review_comments` text DEFAULT NULL,
  `emergency_contact` varchar(100) DEFAULT NULL,
  `emergency_phone` varchar(20) DEFAULT NULL,
  `handover_notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `blackout_created` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `leave_requests`
--

INSERT INTO `leave_requests` (`id`, `user_id`, `leave_type_id`, `start_date`, `end_date`, `total_days`, `reason`, `status`, `supporting_documents`, `applied_at`, `reviewed_by`, `reviewed_at`, `review_comments`, `emergency_contact`, `emergency_phone`, `handover_notes`, `created_at`, `updated_at`, `blackout_created`) VALUES
(1, 9, 1, '2024-12-15', '2024-12-19', 5.0, 'Family vacation', 'completed', NULL, '2025-07-07 13:16:01', 6, '2024-12-01 08:00:00', NULL, NULL, NULL, NULL, '2025-07-07 13:16:01', '2026-02-19 23:00:01', 0),
(2, 10, 2, '2024-12-10', '2024-12-10', 1.0, 'Medical appointment', 'completed', NULL, '2025-07-07 13:16:01', 7, '2024-12-01 09:00:00', NULL, NULL, NULL, NULL, '2025-07-07 13:16:01', '2026-02-19 23:00:01', 0),
(3, 11, 1, '2024-12-20', '2024-12-31', 10.0, 'Year-end vacation', 'completed', NULL, '2025-07-07 13:16:01', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-07 13:16:01', '2026-02-19 23:00:01', 0),
(4, 19, 3, '2024-12-12', '2024-12-12', 1.0, 'Personal matter', 'completed', NULL, '2025-07-07 13:16:01', 5, '2024-12-01 12:00:00', NULL, NULL, NULL, NULL, '2025-07-07 13:16:01', '2026-02-19 23:00:02', 0),
(5, 19, 1, '2025-07-17', '2025-08-02', 17.0, 'It\'s unplanned', 'rejected', NULL, '2025-07-15 02:00:29', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:00:29', '2026-01-25 14:36:23', 0),
(6, 1, 2, '2024-05-30', '2024-05-30', 1.0, 'Medical appointment', 'rejected', NULL, '2025-07-15 02:11:53', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:11:53', '2026-01-25 14:36:12', 0),
(7, 1, 1, '2024-05-15', '2024-05-17', 3.0, 'Personal vacation', 'rejected', NULL, '2025-07-15 02:11:53', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:11:53', '2026-01-25 14:36:16', 0),
(8, 1, 2, '2024-05-30', '2024-05-30', 1.0, 'Medical appointment', 'completed', NULL, '2025-07-15 02:16:40', 1, '2025-09-24 10:26:15', NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2026-02-19 23:00:00', 0),
(9, 1, 1, '2024-05-15', '2024-05-17', 3.0, 'Personal vacation', 'completed', NULL, '2025-07-15 02:16:40', 1, '2025-09-24 12:59:38', NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2026-02-19 23:00:00', 0),
(10, 2, 2, '2024-05-30', '2024-05-30', 1.0, 'Medical appointment', 'completed', NULL, '2025-07-15 02:16:40', 1, '2025-09-24 13:00:11', NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2026-02-19 23:00:01', 0),
(11, 2, 1, '2024-05-15', '2024-05-17', 3.0, 'Personal vacation', 'completed', NULL, '2025-07-15 02:16:40', 1, '2025-09-24 13:56:34', NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2026-02-19 23:00:00', 0),
(12, 3, 2, '2024-05-30', '2024-05-30', 1.0, 'Medical appointment', 'rejected', NULL, '2025-07-15 02:16:40', 1, '2025-09-24 14:14:13', 'Request rejected', NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-09-24 14:14:13', 0),
(13, 3, 1, '2024-05-15', '2024-05-17', 3.0, 'Personal vacation', 'completed', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2026-02-19 23:00:01', 0),
(14, 4, 2, '2024-05-30', '2024-05-30', 1.0, 'Medical appointment', 'completed', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2026-02-19 23:00:01', 0),
(15, 4, 1, '2024-05-15', '2024-05-17', 3.0, 'Personal vacation', 'completed', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2026-02-19 23:00:01', 0),
(16, 5, 2, '2024-05-30', '2024-05-30', 1.0, 'Medical appointment', 'rejected', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2026-01-25 14:25:42', 0),
(17, 5, 1, '2024-05-15', '2024-05-17', 3.0, 'Personal vacation', 'completed', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2026-02-19 23:00:01', 0),
(18, 6, 2, '2024-05-30', '2024-05-30', 1.0, 'Medical appointment', 'completed', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2026-02-19 23:00:01', 0),
(19, 6, 1, '2024-05-15', '2024-05-17', 3.0, 'Personal vacation', 'rejected', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2026-01-25 14:31:46', 0),
(20, 7, 2, '2024-05-30', '2024-05-30', 1.0, 'Medical appointment', 'rejected', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2026-01-25 14:31:56', 0),
(21, 7, 1, '2024-05-15', '2024-05-17', 3.0, 'Personal vacation', 'completed', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2026-02-19 23:00:01', 0),
(22, 8, 2, '2024-05-30', '2024-05-30', 1.0, 'Medical appointment', 'completed', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2026-02-19 23:00:01', 0),
(23, 8, 1, '2024-05-15', '2024-05-17', 3.0, 'Personal vacation', 'completed', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2026-02-19 23:00:01', 0),
(24, 9, 2, '2024-05-30', '2024-05-30', 1.0, 'Medical appointment', 'completed', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2026-02-19 23:00:01', 0),
(25, 9, 1, '2024-05-15', '2024-05-17', 3.0, 'Personal vacation', 'completed', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2026-02-19 23:00:01', 0),
(26, 10, 2, '2024-05-30', '2024-05-30', 1.0, 'Medical appointment', 'rejected', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2026-01-25 14:32:10', 0),
(27, 10, 1, '2024-05-15', '2024-05-17', 3.0, 'Personal vacation', 'rejected', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2026-01-25 14:32:13', 0),
(28, 11, 2, '2024-05-30', '2024-05-30', 1.0, 'Medical appointment', 'rejected', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2026-01-25 14:32:15', 0),
(29, 11, 1, '2024-05-15', '2024-05-17', 3.0, 'Personal vacation', 'completed', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2026-02-19 23:00:02', 0),
(30, 12, 2, '2024-05-30', '2024-05-30', 1.0, 'Medical appointment', 'completed', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2026-02-19 23:00:02', 0),
(31, 12, 1, '2024-05-15', '2024-05-17', 3.0, 'Personal vacation', 'completed', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2026-02-19 23:00:02', 0),
(32, 13, 2, '2024-05-30', '2024-05-30', 1.0, 'Medical appointment', 'completed', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2026-02-19 23:00:02', 0),
(33, 13, 1, '2024-05-15', '2024-05-17', 3.0, 'Personal vacation', 'completed', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2026-02-19 23:00:02', 0),
(34, 14, 2, '2024-05-30', '2024-05-30', 1.0, 'Medical appointment', 'completed', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2026-02-19 23:00:02', 0),
(35, 14, 1, '2024-05-15', '2024-05-17', 3.0, 'Personal vacation', 'completed', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2026-02-19 23:00:02', 0),
(36, 15, 2, '2024-05-30', '2024-05-30', 1.0, 'Medical appointment', 'completed', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2026-02-19 23:00:02', 0),
(37, 15, 1, '2024-05-15', '2024-05-17', 3.0, 'Personal vacation', 'completed', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2026-02-19 23:00:02', 0),
(38, 19, 2, '2024-05-30', '2024-05-30', 1.0, 'Medical appointment', 'completed', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2026-02-19 23:00:02', 0),
(39, 19, 1, '2024-05-15', '2024-05-17', 3.0, 'Personal vacation', 'completed', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2026-02-19 23:00:02', 0),
(40, 19, 5, '2025-08-07', '2025-08-29', 23.0, 'Gonna be a father', 'completed', NULL, '2025-07-15 15:29:15', 1, '2025-09-24 10:22:05', NULL, NULL, NULL, NULL, '2025-07-15 15:29:15', '2026-02-19 23:00:02', 0),
(41, 21, 1, '2025-11-20', '2025-11-22', 3.0, 'Vacation', 'completed', NULL, '2025-11-19 07:55:02', NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-19 07:55:02', '2026-02-19 23:00:02', 0),
(42, 21, 8, '2025-11-21', '2025-11-22', 2.0, 'Thesis defense', 'completed', NULL, '2025-11-20 12:00:35', NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-20 12:00:35', '2026-02-19 23:00:02', 0),
(43, 21, 4, '2025-11-21', '2026-01-22', 63.0, 'Birth', 'completed', NULL, '2025-11-20 12:18:08', NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-20 12:18:08', '2026-02-19 23:00:02', 0),
(44, 21, 8, '2025-11-21', '2025-11-22', 2.0, 'Sick', 'completed', NULL, '2025-11-20 16:01:05', NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-20 16:01:05', '2026-02-19 23:00:02', 0),
(45, 1, 1, '2026-01-14', '2026-01-23', 10.0, 'Going for break', 'completed', NULL, '2026-01-13 15:22:47', NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-13 15:22:47', '2026-02-19 23:00:00', 0),
(46, 1, 2, '2026-01-25', '2026-01-27', 3.0, 'On leave', 'completed', NULL, '2026-01-13 15:33:31', NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-13 15:33:31', '2026-02-19 23:00:00', 0);

--
-- Triggers `leave_requests`
--
DELIMITER $$
CREATE TRIGGER `update_leave_balance_after_approval` AFTER UPDATE ON `leave_requests` FOR EACH ROW BEGIN
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        UPDATE leave_balances 
        SET used_days = used_days + NEW.total_days,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = NEW.user_id 
        AND leave_type_id = NEW.leave_type_id 
        AND year = YEAR(NEW.start_date);
    END IF;
    
    IF NEW.status = 'cancelled' AND OLD.status = 'approved' THEN
        UPDATE leave_balances 
        SET used_days = used_days - NEW.total_days,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = NEW.user_id 
        AND leave_type_id = NEW.leave_type_id 
        AND year = YEAR(NEW.start_date);
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `leave_types`
--

CREATE TABLE `leave_types` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `max_days_per_year` int(11) DEFAULT 0,
  `carry_forward_allowed` tinyint(1) DEFAULT 0,
  `max_carry_forward_days` int(11) DEFAULT 0,
  `requires_approval` tinyint(1) DEFAULT 1,
  `is_paid` tinyint(1) DEFAULT 1,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `leave_types`
--

INSERT INTO `leave_types` (`id`, `name`, `description`, `max_days_per_year`, `carry_forward_allowed`, `max_carry_forward_days`, `requires_approval`, `is_paid`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Annual Leave', 'Regular vacation leave', 21, 1, 5, 1, 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(2, 'Sick Leave', 'Medical leave for illness', 10, 0, 0, 0, 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(3, 'Personal Leave', 'Personal time off', 5, 0, 0, 1, 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(4, 'Maternity Leave', 'Maternity leave for new mothers', 90, 0, 0, 1, 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(5, 'Paternity Leave', 'Paternity leave for new fathers', 14, 0, 0, 1, 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(6, 'Bereavement Leave', 'Leave for family bereavement', 3, 0, 0, 1, 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(7, 'Study Leave', 'Educational leave', 10, 0, 0, 1, 1, 1, '2025-07-07 13:16:00', '2026-01-28 12:56:59'),
(8, 'Emergency Leave', 'Emergency situations', 2, 0, 0, 1, 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00');

-- --------------------------------------------------------

--
-- Table structure for table `licenses`
--

CREATE TABLE `licenses` (
  `id` bigint(20) NOT NULL,
  `name` varchar(150) NOT NULL,
  `category_id` bigint(20) DEFAULT NULL,
  `manufacturer_id` bigint(20) DEFAULT NULL,
  `supplier_id` bigint(20) DEFAULT NULL,
  `company_id` bigint(20) DEFAULT NULL,
  `product_key` varchar(255) DEFAULT NULL,
  `seats_total` int(11) NOT NULL DEFAULT 1,
  `seats_used` int(11) NOT NULL DEFAULT 0,
  `purchase_date` date DEFAULT NULL,
  `expiration_date` date DEFAULT NULL,
  `purchase_cost` decimal(13,4) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `licenses`
--

INSERT INTO `licenses` (`id`, `name`, `category_id`, `manufacturer_id`, `supplier_id`, `company_id`, `product_key`, `seats_total`, `seats_used`, `purchase_date`, `expiration_date`, `purchase_cost`, `notes`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Microsoft 365 (Education)', 10, 7, 1, 1, NULL, 300, 0, '2025-09-01', '2026-09-01', 0.0000, 'UNILAK staff/students subscription', '2026-02-20 17:48:14', '2026-02-20 17:48:14', NULL),
(2, 'Windows 11 Pro (Volume)', 10, 7, 1, 1, 'XXXXX-XXXXX-XXXXX-XXXXX-XXXXX', 50, 0, '2025-10-15', NULL, 0.0000, 'For staff machines imaging', '2026-02-20 17:48:14', '2026-02-20 17:48:14', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `license_assignments`
--

CREATE TABLE `license_assignments` (
  `id` bigint(20) NOT NULL,
  `license_id` bigint(20) NOT NULL,
  `assigned_to_user_id` int(11) DEFAULT NULL,
  `assigned_to_asset_id` bigint(20) DEFAULT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `revoked_at` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `license_assignments`
--
DELIMITER $$
CREATE TRIGGER `trg_la_after_delete` AFTER DELETE ON `license_assignments` FOR EACH ROW BEGIN
  IF OLD.revoked_at IS NULL THEN
    UPDATE licenses SET seats_used = GREATEST(seats_used - 1, 0) WHERE id = OLD.license_id;
  END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_la_after_insert` AFTER INSERT ON `license_assignments` FOR EACH ROW BEGIN
  IF NEW.revoked_at IS NULL THEN
    UPDATE licenses SET seats_used = seats_used + 1 WHERE id = NEW.license_id;
  END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_la_after_update` AFTER UPDATE ON `license_assignments` FOR EACH ROW BEGIN
  IF OLD.revoked_at IS NULL AND NEW.revoked_at IS NOT NULL THEN
    UPDATE licenses SET seats_used = GREATEST(seats_used - 1, 0) WHERE id = NEW.license_id;
  END IF;

  IF OLD.revoked_at IS NOT NULL AND NEW.revoked_at IS NULL THEN
    IF (SELECT seats_used FROM licenses WHERE id = NEW.license_id) >= (SELECT seats_total FROM licenses WHERE id = NEW.license_id) THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'license_assignments: no available seats to un-revoke';
    END IF;
    UPDATE licenses SET seats_used = seats_used + 1 WHERE id = NEW.license_id;
  END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_la_before_insert` BEFORE INSERT ON `license_assignments` FOR EACH ROW BEGIN
  DECLARE usedSeats INT;
  DECLARE totalSeats INT;

  IF NEW.assigned_to_user_id IS NULL AND NEW.assigned_to_asset_id IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'license_assignments: must assign to user or asset';
  END IF;

  SELECT seats_used, seats_total INTO usedSeats, totalSeats
  FROM licenses WHERE id = NEW.license_id FOR UPDATE;

  IF usedSeats >= totalSeats THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'license_assignments: no available license seats';
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `locations`
--

CREATE TABLE `locations` (
  `id` bigint(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `address` text DEFAULT NULL,
  `address2` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `province` varchar(100) DEFAULT NULL,
  `district` varchar(100) DEFAULT NULL,
  `sector` varchar(100) DEFAULT NULL,
  `cell` varchar(100) DEFAULT NULL,
  `village` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `po_box` varchar(50) DEFAULT NULL,
  `parent_id` bigint(20) DEFAULT NULL,
  `currency` varchar(10) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `locations`
--

INSERT INTO `locations` (`id`, `name`, `address`, `address2`, `city`, `state`, `province`, `district`, `sector`, `cell`, `village`, `country`, `po_box`, `parent_id`, `currency`, `image`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Headquarters', 'Sonatube', 'PO BOX 6392', 'Kigali', 'Kigali', NULL, NULL, NULL, NULL, NULL, 'Rwanda', NULL, NULL, 'RWF', NULL, '2026-02-19 22:49:14', '2026-02-20 00:33:33', NULL),
(2, 'IT Department', '123 Main St, Floor 3', NULL, 'New York', 'NY', NULL, NULL, NULL, NULL, NULL, 'USA', NULL, NULL, NULL, NULL, '2026-02-19 22:49:14', '2026-02-19 22:49:14', NULL),
(3, 'Warehouse', '456 Storage Ave', NULL, 'New York', 'NY', NULL, NULL, NULL, NULL, NULL, 'USA', NULL, NULL, NULL, NULL, '2026-02-19 22:49:14', '2026-02-19 22:49:14', NULL),
(4, 'HR Office', '123 Main St, Floor 2', NULL, 'New York', 'NY', NULL, NULL, NULL, NULL, NULL, 'USA', NULL, NULL, NULL, NULL, '2026-02-19 22:49:14', '2026-02-19 22:49:14', NULL),
(5, 'Finance Department', '123 Main St, Floor 4', NULL, 'New York', 'NY', NULL, NULL, NULL, NULL, NULL, 'USA', NULL, NULL, NULL, NULL, '2026-02-19 22:49:14', '2026-02-19 22:49:14', NULL),
(6, 'Parking Lot A', '123 Main St, Parking', NULL, 'New York', 'NY', NULL, NULL, NULL, NULL, NULL, 'USA', NULL, NULL, NULL, NULL, '2026-02-19 22:49:14', '2026-02-19 22:49:14', NULL),
(7, 'UNILAK Kigali Main Campus', 'Kicukiro, KG 552 St', 'Main Campus', 'Kigali', 'Kigali City', 'Kigali City', 'Kicukiro', 'Gahanga', 'Gahanga', 'Nyarurama', 'Rwanda', 'P.O. Box Kigali', NULL, 'RWF', NULL, '2026-02-20 17:48:14', '2026-02-20 17:48:14', NULL),
(8, 'UNILAK Rwamagana Branch', 'RN3, Rwamagana Town', 'Branch Campus', 'Rwamagana', 'Eastern Province', 'Eastern Province', 'Rwamagana', 'Kigabiro', 'Kigabiro', 'Kigarama', 'Rwanda', 'P.O. Box Rwamagana', NULL, 'RWF', NULL, '2026-02-20 17:48:14', '2026-02-20 17:48:14', NULL),
(9, 'UNILAK Musanze Branch', 'NR 18 Ave, Musanze', 'Branch Campus', 'Musanze', 'Northern Province', 'Northern Province', 'Musanze', 'Muhoza', 'Muhoza', 'Kaguhu', 'Rwanda', 'P.O. Box Musanze', NULL, 'RWF', NULL, '2026-02-20 17:48:14', '2026-02-20 17:48:14', NULL),
(10, 'Kigali – Main Gate', 'Main Gate Lane', 'Entry Control', 'Kigali', 'Kigali City', 'Kigali City', 'Kicukiro', 'Gahanga', 'Gahanga', 'Nyarurama', 'Rwanda', NULL, 7, 'RWF', NULL, '2026-02-20 17:48:14', '2026-02-20 17:48:14', NULL),
(11, 'Kigali – Guard Post', 'Main Gate Lane', 'Security Post', 'Kigali', 'Kigali City', 'Kigali City', 'Kicukiro', 'Gahanga', 'Gahanga', 'Nyarurama', 'Rwanda', NULL, 7, 'RWF', NULL, '2026-02-20 17:48:14', '2026-02-20 17:48:14', NULL),
(12, 'Kigali – Reception', 'Admin Block', 'Front Desk', 'Kigali', 'Kigali City', 'Kigali City', 'Kicukiro', 'Gahanga', 'Gahanga', 'Nyarurama', 'Rwanda', NULL, 7, 'RWF', NULL, '2026-02-20 17:48:14', '2026-02-20 17:48:14', NULL),
(13, 'Kigali – ICT Store', 'ICT Building', 'Store Room', 'Kigali', 'Kigali City', 'Kigali City', 'Kicukiro', 'Gahanga', 'Gahanga', 'Nyarurama', 'Rwanda', NULL, 7, 'RWF', NULL, '2026-02-20 17:48:14', '2026-02-20 17:48:14', NULL),
(14, 'Kigali – Finance Office', 'Admin Block', 'Finance', 'Kigali', 'Kigali City', 'Kigali City', 'Kicukiro', 'Gahanga', 'Gahanga', 'Nyarurama', 'Rwanda', NULL, 7, 'RWF', NULL, '2026-02-20 17:48:14', '2026-02-20 17:48:14', NULL),
(15, 'Rwamagana – Main Gate', 'RN3 Entrance', 'Entry Control', 'Rwamagana', 'Eastern Province', 'Eastern Province', 'Rwamagana', 'Kigabiro', 'Kigabiro', 'Kigarama', 'Rwanda', NULL, 8, 'RWF', NULL, '2026-02-20 17:48:14', '2026-02-20 17:48:14', NULL),
(16, 'Rwamagana – ICT Store', 'Branch Campus', 'Store', 'Rwamagana', 'Eastern Province', 'Eastern Province', 'Rwamagana', 'Kigabiro', 'Kigabiro', 'Kigarama', 'Rwanda', NULL, 8, 'RWF', NULL, '2026-02-20 17:48:14', '2026-02-20 17:48:14', NULL),
(17, 'Musanze – Main Gate', 'NR 18 Entrance', 'Entry Control', 'Musanze', 'Northern Province', 'Northern Province', 'Musanze', 'Muhoza', 'Muhoza', 'Kaguhu', 'Rwanda', NULL, 9, 'RWF', NULL, '2026-02-20 17:48:14', '2026-02-20 17:48:14', NULL),
(18, 'Musanze – ICT Store', 'Branch Campus', 'Store', 'Musanze', 'Northern Province', 'Northern Province', 'Musanze', 'Muhoza', 'Muhoza', 'Kaguhu', 'Rwanda', NULL, 9, 'RWF', NULL, '2026-02-20 17:48:14', '2026-02-20 17:48:14', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `maintenance_records`
--

CREATE TABLE `maintenance_records` (
  `id` bigint(20) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `maintenance_date` date NOT NULL,
  `performed_by` varchar(255) DEFAULT NULL,
  `asset_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `manufacturers`
--

CREATE TABLE `manufacturers` (
  `id` bigint(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `url` varchar(255) DEFAULT NULL,
  `support_url` varchar(255) DEFAULT NULL,
  `support_phone` varchar(50) DEFAULT NULL,
  `support_email` varchar(100) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `manufacturers`
--

INSERT INTO `manufacturers` (`id`, `name`, `url`, `support_url`, `support_phone`, `support_email`, `image`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Dell', 'https://dell.com', NULL, NULL, 'support@dell.com', NULL, '2026-02-19 22:49:14', '2026-02-19 22:49:14', NULL),
(2, 'Apple', 'https://apple.com', NULL, NULL, 'support@apple.com', NULL, '2026-02-19 22:49:14', '2026-02-19 22:49:14', NULL),
(3, 'HP', 'https://hp.com', NULL, NULL, 'support@hp.com', NULL, '2026-02-19 22:49:14', '2026-02-19 22:49:14', NULL),
(4, 'Lenovo', 'https://lenovo.com', NULL, NULL, 'support@lenovo.com', NULL, '2026-02-19 22:49:14', '2026-02-19 22:49:14', NULL),
(5, 'Office Pro', 'https://officepro.com', NULL, NULL, 'support@officepro.com', NULL, '2026-02-19 22:49:14', '2026-02-19 22:49:14', NULL),
(6, 'Toyota', 'https://toyota.com', NULL, NULL, 'support@toyota.com', NULL, '2026-02-19 22:49:14', '2026-02-19 22:49:14', NULL),
(7, 'Microsoft', 'https://microsoft.com', NULL, NULL, 'support@microsoft.com', NULL, '2026-02-19 22:49:14', '2026-02-19 22:49:14', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `type` enum('info','warning','error','success') DEFAULT 'info',
  `is_read` tinyint(1) DEFAULT 0,
  `action_url` varchar(255) DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `read_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `action_url`, `expires_at`, `created_at`, `read_at`) VALUES
(1, 9, 'Leave Request Approved', 'Your leave request for December 15-19 has been approved.', 'success', 0, '/leave/my-requests', NULL, '2025-07-07 13:16:01', NULL),
(3, 11, 'New Procurement Request', 'A new procurement request requires your review.', 'warning', 0, '/procurement/requests', NULL, '2025-07-07 13:16:01', NULL),
(4, 6, 'Monthly Report Due', 'The monthly HR report is due by end of week.', 'warning', 0, '/reports', NULL, '2025-07-07 13:16:01', NULL),
(5, 7, 'Budget Review Required', 'Q4 budget review meeting scheduled for next week.', 'info', 0, '/finance/budgets', NULL, '2025-07-07 13:16:01', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `onboarding_checklists`
--

CREATE TABLE `onboarding_checklists` (
  `id` bigint(20) NOT NULL,
  `assigned_date` datetime(6) DEFAULT NULL,
  `completed_at` datetime(6) DEFAULT NULL,
  `is_completed` bit(1) DEFAULT NULL,
  `task_name` varchar(255) NOT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payroll_runs`
--

CREATE TABLE `payroll_runs` (
  `id` int(11) NOT NULL,
  `run_month` int(11) NOT NULL,
  `run_year` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `total_gross` decimal(15,2) DEFAULT 0.00,
  `total_deductions` decimal(15,2) DEFAULT 0.00,
  `total_net` decimal(15,2) DEFAULT 0.00,
  `status` enum('DRAFT','PROCESSING','COMPLETED','CLOSED') DEFAULT 'DRAFT',
  `created_by` int(11) NOT NULL,
  `closed_by` int(11) DEFAULT NULL,
  `closed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `run_date` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payroll_runs`
--

INSERT INTO `payroll_runs` (`id`, `run_month`, `run_year`, `start_date`, `end_date`, `total_gross`, `total_deductions`, `total_net`, `status`, `created_by`, `closed_by`, `closed_at`, `created_at`, `run_date`) VALUES
(1, 11, 2025, '2025-11-01', '2025-11-30', 102400.00, 12133.28, 91066.72, 'COMPLETED', 1, NULL, NULL, '2026-01-22 17:43:20', '2025-11-30 23:59:59.000000'),
(2, 12, 2025, '2025-12-01', '2025-12-31', 104000.00, 12433.28, 91566.72, 'COMPLETED', 1, NULL, NULL, '2026-01-22 17:43:20', '2025-12-31 23:59:59.000000'),
(4, 1, 2026, '2026-01-01', '2026-01-31', 1432500.00, 98362.50, 1334137.50, 'COMPLETED', 1, NULL, NULL, '2026-01-25 11:58:48', '2026-01-31 23:59:59.000000');

-- --------------------------------------------------------

--
-- Table structure for table `payslips`
--

CREATE TABLE `payslips` (
  `id` bigint(20) NOT NULL,
  `gross_pay` decimal(38,2) NOT NULL,
  `net_pay` decimal(38,2) NOT NULL,
  `other_deductions` decimal(38,2) NOT NULL,
  `pay_period_end` date NOT NULL,
  `pay_period_start` date NOT NULL,
  `tax_deductions` decimal(38,2) NOT NULL,
  `payroll_run_id` bigint(20) UNSIGNED DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `days_worked` int(11) DEFAULT 0,
  `overtime_hours` decimal(5,2) DEFAULT 0.00,
  `gross_salary` decimal(12,2) DEFAULT 0.00,
  `tax_deduction` decimal(10,2) DEFAULT 0.00,
  `pension_deduction` decimal(10,2) DEFAULT 0.00,
  `net_salary` decimal(12,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payslips`
--

INSERT INTO `payslips` (`id`, `gross_pay`, `net_pay`, `other_deductions`, `pay_period_end`, `pay_period_start`, `tax_deductions`, `payroll_run_id`, `user_id`, `days_worked`, `overtime_hours`, `gross_salary`, `tax_deduction`, `pension_deduction`, `net_salary`) VALUES
(1, 6500.00, 5722.92, 350.00, '2025-12-31', '2025-12-01', 427.08, 2, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00),
(2, 6400.00, 5691.67, 350.00, '2025-11-30', '2025-11-01', 408.33, 1, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00),
(3, 6500.00, 5722.92, 350.00, '2025-12-31', '2025-12-01', 427.08, 2, 2, 0, 0.00, 0.00, 0.00, 0.00, 0.00),
(4, 6400.00, 5691.67, 350.00, '2025-11-30', '2025-11-01', 408.33, 1, 2, 0, 0.00, 0.00, 0.00, 0.00, 0.00),
(5, 6500.00, 5722.92, 350.00, '2025-12-31', '2025-12-01', 427.08, 2, 3, 0, 0.00, 0.00, 0.00, 0.00, 0.00),
(6, 6400.00, 5691.67, 350.00, '2025-11-30', '2025-11-01', 408.33, 1, 3, 0, 0.00, 0.00, 0.00, 0.00, 0.00),
(7, 6500.00, 5722.92, 350.00, '2025-12-31', '2025-12-01', 427.08, 2, 4, 0, 0.00, 0.00, 0.00, 0.00, 0.00),
(8, 6400.00, 5691.67, 350.00, '2025-11-30', '2025-11-01', 408.33, 1, 4, 0, 0.00, 0.00, 0.00, 0.00, 0.00),
(9, 6500.00, 5722.92, 350.00, '2025-12-31', '2025-12-01', 427.08, 2, 5, 0, 0.00, 0.00, 0.00, 0.00, 0.00),
(10, 6400.00, 5691.67, 350.00, '2025-11-30', '2025-11-01', 408.33, 1, 5, 0, 0.00, 0.00, 0.00, 0.00, 0.00),
(11, 6500.00, 5722.92, 350.00, '2025-12-31', '2025-12-01', 427.08, 2, 6, 0, 0.00, 0.00, 0.00, 0.00, 0.00),
(12, 6400.00, 5691.67, 350.00, '2025-11-30', '2025-11-01', 408.33, 1, 6, 0, 0.00, 0.00, 0.00, 0.00, 0.00),
(13, 6500.00, 5722.92, 350.00, '2025-12-31', '2025-12-01', 427.08, 2, 7, 0, 0.00, 0.00, 0.00, 0.00, 0.00),
(14, 6400.00, 5691.67, 350.00, '2025-11-30', '2025-11-01', 408.33, 1, 7, 0, 0.00, 0.00, 0.00, 0.00, 0.00),
(15, 6500.00, 5722.92, 350.00, '2025-12-31', '2025-12-01', 427.08, 2, 8, 0, 0.00, 0.00, 0.00, 0.00, 0.00),
(16, 6400.00, 5691.67, 350.00, '2025-11-30', '2025-11-01', 408.33, 1, 8, 0, 0.00, 0.00, 0.00, 0.00, 0.00),
(17, 6500.00, 5722.92, 350.00, '2025-12-31', '2025-12-01', 427.08, 2, 9, 0, 0.00, 0.00, 0.00, 0.00, 0.00),
(18, 6400.00, 5691.67, 350.00, '2025-11-30', '2025-11-01', 408.33, 1, 9, 0, 0.00, 0.00, 0.00, 0.00, 0.00),
(19, 6500.00, 5722.92, 350.00, '2025-12-31', '2025-12-01', 427.08, 2, 10, 0, 0.00, 0.00, 0.00, 0.00, 0.00),
(20, 6400.00, 5691.67, 350.00, '2025-11-30', '2025-11-01', 408.33, 1, 10, 0, 0.00, 0.00, 0.00, 0.00, 0.00),
(21, 6500.00, 5722.92, 350.00, '2025-12-31', '2025-12-01', 427.08, 2, 11, 0, 0.00, 0.00, 0.00, 0.00, 0.00),
(22, 6400.00, 5691.67, 350.00, '2025-11-30', '2025-11-01', 408.33, 1, 11, 0, 0.00, 0.00, 0.00, 0.00, 0.00),
(23, 6500.00, 5722.92, 350.00, '2025-12-31', '2025-12-01', 427.08, 2, 12, 0, 0.00, 0.00, 0.00, 0.00, 0.00),
(24, 6400.00, 5691.67, 350.00, '2025-11-30', '2025-11-01', 408.33, 1, 12, 0, 0.00, 0.00, 0.00, 0.00, 0.00),
(25, 6500.00, 5722.92, 350.00, '2025-12-31', '2025-12-01', 427.08, 2, 13, 0, 0.00, 0.00, 0.00, 0.00, 0.00),
(26, 6400.00, 5691.67, 350.00, '2025-11-30', '2025-11-01', 408.33, 1, 13, 0, 0.00, 0.00, 0.00, 0.00, 0.00),
(27, 6500.00, 5722.92, 350.00, '2025-12-31', '2025-12-01', 427.08, 2, 14, 0, 0.00, 0.00, 0.00, 0.00, 0.00),
(28, 6400.00, 5691.67, 350.00, '2025-11-30', '2025-11-01', 408.33, 1, 14, 0, 0.00, 0.00, 0.00, 0.00, 0.00),
(29, 6500.00, 5722.92, 350.00, '2025-12-31', '2025-12-01', 427.08, 2, 15, 0, 0.00, 0.00, 0.00, 0.00, 0.00),
(30, 6400.00, 5691.67, 350.00, '2025-11-30', '2025-11-01', 408.33, 1, 15, 0, 0.00, 0.00, 0.00, 0.00, 0.00),
(31, 6500.00, 5722.92, 350.00, '2025-12-31', '2025-12-01', 427.08, 2, 19, 0, 0.00, 0.00, 0.00, 0.00, 0.00),
(32, 6400.00, 5691.67, 350.00, '2025-11-30', '2025-11-01', 408.33, 1, 19, 0, 0.00, 0.00, 0.00, 0.00, 0.00),
(48, 150000.00, 139900.00, 350.00, '2026-01-31', '2026-01-01', 9750.00, 4, 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00),
(49, 118750.00, 110681.25, 350.00, '2026-01-31', '2026-01-01', 7718.75, 4, 2, 0, 0.00, 0.00, 0.00, 0.00, 0.00),
(50, 122500.00, 114187.50, 350.00, '2026-01-31', '2026-01-01', 7962.50, 4, 3, 0, 0.00, 0.00, 0.00, 0.00, 0.00),
(51, 131250.00, 122368.75, 350.00, '2026-01-31', '2026-01-01', 8531.25, 4, 4, 0, 0.00, 0.00, 0.00, 0.00, 0.00),
(52, 115000.00, 107175.00, 350.00, '2026-01-31', '2026-01-01', 7475.00, 4, 5, 0, 0.00, 0.00, 0.00, 0.00, 0.00),
(53, 93750.00, 87306.25, 350.00, '2026-01-31', '2026-01-01', 6093.75, 4, 6, 0, 0.00, 0.00, 0.00, 0.00, 0.00),
(54, 97500.00, 90812.50, 350.00, '2026-01-31', '2026-01-01', 6337.50, 4, 7, 0, 0.00, 0.00, 0.00, 0.00, 0.00),
(55, 102500.00, 95487.50, 350.00, '2026-01-31', '2026-01-01', 6662.50, 4, 8, 0, 0.00, 0.00, 0.00, 0.00, 0.00),
(56, 68750.00, 63931.25, 350.00, '2026-01-31', '2026-01-01', 4468.75, 4, 9, 0, 0.00, 0.00, 0.00, 0.00, 0.00),
(57, 72500.00, 67437.50, 350.00, '2026-01-31', '2026-01-01', 4712.50, 4, 10, 0, 0.00, 0.00, 0.00, 0.00, 0.00),
(58, 77500.00, 72112.50, 350.00, '2026-01-31', '2026-01-01', 5037.50, 4, 11, 0, 0.00, 0.00, 0.00, 0.00, 0.00),
(59, 67500.00, 62762.50, 350.00, '2026-01-31', '2026-01-01', 4387.50, 4, 12, 0, 0.00, 0.00, 0.00, 0.00, 0.00),
(60, 73750.00, 68606.25, 350.00, '2026-01-31', '2026-01-01', 4793.75, 4, 13, 0, 0.00, 0.00, 0.00, 0.00, 0.00),
(61, 70000.00, 65100.00, 350.00, '2026-01-31', '2026-01-01', 4550.00, 4, 14, 0, 0.00, 0.00, 0.00, 0.00, 0.00),
(62, 71250.00, 66268.75, 350.00, '2026-01-31', '2026-01-01', 4631.25, 4, 15, 0, 0.00, 0.00, 0.00, 0.00, 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `performance_reviews`
--

CREATE TABLE `performance_reviews` (
  `id` bigint(20) NOT NULL,
  `review_date` date NOT NULL,
  `review_text` varchar(2000) NOT NULL,
  `reviewer` varchar(255) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `comments` varchar(2000) DEFAULT NULL,
  `employee_id` bigint(20) NOT NULL,
  `goals` varchar(2000) DEFAULT NULL,
  `rating` double NOT NULL,
  `reviewer_id` bigint(20) NOT NULL,
  `status` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `name`, `description`) VALUES
(1, 'user.create', 'Create new users'),
(2, 'user.read', 'View user information'),
(3, 'user.update', 'Update user information'),
(4, 'user.delete', 'Delete users'),
(5, 'user.manage_roles', 'Assign roles to users'),
(6, 'attendance.view_own', 'View own attendance records'),
(7, 'attendance.view_department', 'View department attendance records'),
(8, 'attendance.view_all', 'View all attendance records'),
(9, 'attendance.manage', 'Manage attendance records'),
(10, 'attendance.approve', 'Approve attendance modifications'),
(11, 'leave.request', 'Submit leave requests'),
(12, 'leave.view_own', 'View own leave requests'),
(13, 'leave.view_department', 'View department leave requests'),
(14, 'leave.approve', 'Approve leave requests'),
(15, 'leave.view_statistics', 'View leave statistics'),
(16, 'finance.view_dashboard', 'View finance dashboard'),
(17, 'finance.manage_accounts', 'Manage chart of accounts'),
(18, 'finance.manage_budgets', 'Manage budgets'),
(19, 'finance.approve_budgets', 'Approve budgets'),
(20, 'finance.manage_journal', 'Manage journal entries'),
(21, 'finance.view_reports', 'View financial reports'),
(22, 'procurement.request', 'Submit procurement requests'),
(23, 'procurement.view', 'View procurement requests'),
(24, 'procurement.approve', 'Approve procurement requests'),
(25, 'procurement.manage', 'Manage procurement system'),
(26, 'procurement.view_statistics', 'View procurement statistics'),
(27, 'asset.view', 'View assets'),
(28, 'asset.create', 'Create new assets'),
(29, 'asset.update', 'Update asset information'),
(30, 'asset.delete', 'Delete assets'),
(31, 'asset.assign', 'Assign assets to users'),
(35, 'reports.view', 'View reports'),
(36, 'reports.generate', 'Generate reports'),
(37, 'reports.manage', 'Manage report templates'),
(38, 'analytics.view', 'View analytics dashboard'),
(39, 'system.settings', 'Manage system settings'),
(40, 'system.audit', 'View audit logs'),
(41, 'system.backup', 'Perform system backups'),
(0, 'admin.all', 'Full admin access'),
(0, 'admin.users.create', 'Create users'),
(0, 'admin.users.read', 'View users'),
(0, 'admin.users.update', 'Update users'),
(0, 'admin.users.delete', 'Delete users'),
(0, 'security.incidents.create', 'Create security incidents'),
(0, 'security.incidents.read', 'View security incidents'),
(0, 'security.incidents.update', 'Update security incidents'),
(0, 'security.incidents.approve', 'Approve security incidents'),
(0, 'security.sop.read', 'View SOPs'),
(0, 'security.logs.create', 'Create entry logs'),
(0, 'security.logs.read', 'View entry logs'),
(0, 'security.visitors.create', 'Register visitors'),
(0, 'security.visitors.read', 'View visitors'),
(0, 'security.visitors.update', 'Update visitor records'),
(0, 'procurement.requisitions.create', 'Create requisitions'),
(0, 'procurement.requisitions.read', 'View requisitions'),
(0, 'procurement.requisitions.update', 'Update requisitions'),
(0, 'procurement.vendors.create', 'Create vendors'),
(0, 'procurement.vendors.read', 'View vendors'),
(0, 'procurement.vendors.update', 'Update vendors'),
(0, 'procurement.tenders.read', 'View tenders'),
(0, 'procurement.contracts.read', 'View contracts'),
(0, 'assets.create', 'Create assets'),
(0, 'assets.read', 'View assets'),
(0, 'assets.update', 'Update assets'),
(0, 'assets.assign', 'Assign assets'),
(0, 'assets.own.read', 'View own assigned assets'),
(0, 'hr.employees.create', 'Create employee records'),
(0, 'hr.employees.read', 'View employee records'),
(0, 'hr.employees.update', 'Update employee records'),
(0, 'hr.leave.create', 'Create leave requests'),
(0, 'hr.leave.read', 'View leave requests'),
(0, 'hr.leave.update', 'Update leave requests'),
(0, 'hr.leave.approve', 'Approve leave requests'),
(0, 'hr.policies.read', 'View HR policies'),
(0, 'hr.self.read', 'View own profile'),
(0, 'hr.self.update', 'Update own profile'),
(0, 'finance.expenses.create', 'Create expenses'),
(0, 'finance.expenses.read', 'View expenses'),
(0, 'finance.expenses.update', 'Update expenses'),
(0, 'finance.transactions.create', 'Create transactions'),
(0, 'finance.transactions.read', 'View transactions'),
(0, 'finance.reports.read', 'View financial reports');

-- --------------------------------------------------------

--
-- Table structure for table `pfm_exports`
--

CREATE TABLE `pfm_exports` (
  `id` int(11) NOT NULL,
  `payroll_run_id` int(11) NOT NULL,
  `export_date` date NOT NULL,
  `total_amount` decimal(15,2) NOT NULL,
  `journal_entry_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`journal_entry_data`)),
  `export_status` enum('PENDING','EXPORTED','FAILED') DEFAULT 'PENDING',
  `exported_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `position_slots`
--

CREATE TABLE `position_slots` (
  `id` int(11) NOT NULL,
  `department_id` int(11) NOT NULL,
  `position_title` varchar(100) NOT NULL,
  `total_slots` int(11) NOT NULL,
  `filled_slots` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `procurement_requests`
--

CREATE TABLE `procurement_requests` (
  `id` int(11) NOT NULL,
  `request_number` varchar(20) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text NOT NULL,
  `department_id` int(11) NOT NULL,
  `requested_by` int(11) NOT NULL,
  `estimated_cost` decimal(12,2) NOT NULL,
  `urgency` enum('low','medium','high','critical') DEFAULT 'medium',
  `required_date` date DEFAULT NULL,
  `status` enum('draft','submitted','under_review','approved','rejected','cancelled') DEFAULT 'draft',
  `budget_id` int(11) DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `procurement_requests`
--

INSERT INTO `procurement_requests` (`id`, `request_number`, `title`, `description`, `department_id`, `requested_by`, `estimated_cost`, `urgency`, `required_date`, `status`, `budget_id`, `approved_by`, `approved_at`, `rejection_reason`, `created_at`, `updated_at`) VALUES
(1, 'PR-2024-001', 'Office Supplies Replenishment', 'Monthly office supplies including paper, pens, folders', 1, 9, 500.00, 'medium', '2024-12-15', 'approved', NULL, NULL, NULL, NULL, '2025-07-07 13:16:01', '2025-07-07 13:16:01'),
(2, 'PR-2024-002', 'New Laptops for IT Department', 'Purchase of 5 new laptops for development team', 3, 11, 6000.00, 'high', '2024-12-20', 'under_review', NULL, NULL, NULL, NULL, '2025-07-07 13:16:01', '2025-07-07 13:16:01'),
(3, 'PR-2024-003', 'Conference Room Furniture', 'New conference table and chairs for meeting room', 4, 12, 2500.00, 'low', '2025-01-15', 'submitted', NULL, NULL, NULL, NULL, '2025-07-07 13:16:01', '2025-07-07 13:16:01'),
(4, 'PR-2024-004', 'Software Licenses', 'Annual renewal of software licenses', 3, 11, 3000.00, 'high', '2024-12-31', 'approved', NULL, NULL, NULL, NULL, '2025-07-07 13:16:01', '2025-07-07 13:16:01');

-- --------------------------------------------------------

--
-- Table structure for table `procurement_request_items`
--

CREATE TABLE `procurement_request_items` (
  `id` int(11) NOT NULL,
  `request_id` int(11) NOT NULL,
  `item_description` varchar(200) NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `unit_of_measure` varchar(20) DEFAULT NULL,
  `estimated_unit_cost` decimal(10,2) DEFAULT NULL,
  `estimated_total_cost` decimal(12,2) GENERATED ALWAYS AS (`quantity` * `estimated_unit_cost`) STORED,
  `specifications` text DEFAULT NULL,
  `line_number` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `qr_tokens`
--

CREATE TABLE `qr_tokens` (
  `id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `is_used` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `qr_tokens`
--

INSERT INTO `qr_tokens` (`id`, `token`, `expires_at`, `is_used`, `created_at`, `updated_at`) VALUES
(1, '82bc7a21-d6f7-4db6-9e40-728067430386', '2025-12-05 10:24:07', 1, '2025-12-05 09:24:07', '2025-12-05 09:25:02'),
(2, '8caa0625-9d1d-4b66-a9d3-1850d874fc60', '2025-12-05 10:29:07', 0, '2025-12-05 09:29:07', '2025-12-05 09:29:07'),
(3, 'edc1a5a6-e86d-446c-952d-c3dcdf851f57', '2025-12-05 10:34:08', 0, '2025-12-05 09:34:08', '2025-12-05 09:34:08'),
(4, '01013d86-69d7-41b6-90ff-cb4ed364a7b0', '2025-12-05 10:39:07', 0, '2025-12-05 09:39:07', '2025-12-05 09:39:07'),
(5, 'd1c8dc8a-e09a-45e6-8837-1911daee5b12', '2025-12-05 10:46:01', 0, '2025-12-05 09:46:01', '2025-12-05 09:46:01'),
(6, 'f346cb5a-ce10-4446-80a6-585482153ede', '2025-12-05 11:08:39', 0, '2025-12-05 10:08:40', '2025-12-05 10:08:40'),
(7, 'bba13f64-2e6d-47cf-920d-920fcbb9a0a1', '2025-12-05 11:08:40', 1, '2025-12-05 10:08:40', '2025-12-05 10:09:34'),
(8, '7b5b37e2-22ee-4680-a105-ef5b9a2974ee', '2025-12-05 11:14:40', 0, '2025-12-05 10:14:40', '2025-12-05 10:14:40'),
(9, 'b2de3854-2c89-40d4-8793-4129d70c5107', '2025-12-05 11:20:31', 0, '2025-12-05 10:20:31', '2025-12-05 10:20:31'),
(10, '57f41986-4c67-4c0f-8bbf-ab96e83727c8', '2025-12-07 18:52:42', 0, '2025-12-07 17:52:42', '2025-12-07 17:52:42'),
(11, '9d1cf209-3047-4ed6-af15-5f5ad7001b60', '2025-12-07 18:53:44', 0, '2025-12-07 17:53:44', '2025-12-07 17:53:44'),
(12, 'e5d145e2-7981-4e44-ab9e-f8c57d4d398c', '2025-12-07 18:57:44', 0, '2025-12-07 17:57:44', '2025-12-07 17:57:44'),
(13, '2815b1fc-9d43-4547-8d43-d6030b5fd229', '2025-12-07 19:02:43', 0, '2025-12-07 18:02:43', '2025-12-07 18:02:43'),
(14, '22f25df3-ef13-4341-b94c-e02e3f51a843', '2025-12-07 19:04:59', 0, '2025-12-07 18:04:59', '2025-12-07 18:04:59'),
(15, '58c207db-aa4a-41fa-84aa-70b9e0b744f3', '2025-12-07 19:12:20', 0, '2025-12-07 18:12:20', '2025-12-07 18:12:20'),
(16, '52e60c1b-fca5-49bb-9902-a57ce4549396', '2025-12-07 19:12:37', 0, '2025-12-07 18:12:37', '2025-12-07 18:12:37'),
(17, '0fb39d86-4c6f-4a3b-8430-d8a39e135c0c', '2025-12-07 19:17:37', 0, '2025-12-07 18:17:37', '2025-12-07 18:17:37'),
(18, '092dc4c3-8cae-4600-b99c-71a5b1845ca9', '2025-12-07 19:22:37', 0, '2025-12-07 18:22:37', '2025-12-07 18:22:37'),
(19, '38269a92-c8ad-4073-b047-9e299966fd61', '2025-12-07 19:25:57', 1, '2025-12-07 18:25:57', '2025-12-07 18:27:23');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `description`) VALUES
(1, 'Admin', 'System administrator with full access'),
(2, 'Internal Auditor', 'Auditor with read-only access across all modules'),
(3, 'Security Supervisor', 'Security supervisor with incident and SOP management'),
(4, 'Security Guard', 'Security guard with entry log and incident draft access'),
(5, 'Reception', 'Reception staff with visitor registration access'),
(6, 'Procurement Manager', 'Procurement manager with approval authority'),
(7, 'Procurement Officer', 'Procurement officer with requisition and vendor management'),
(8, 'Finance Manager', 'Finance manager with approval and budget authority'),
(9, 'Finance Officer', 'Finance officer with transaction processing'),
(10, 'HR Manager', 'HR manager with employee approval authority'),
(11, 'HR Officer', 'HR officer with employee record management'),
(12, 'Asset Manager', 'Asset manager with disposal approval authority');

-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  `granted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `granted_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role_permissions`
--

INSERT INTO `role_permissions` (`id`, `role_id`, `permission_id`, `granted_at`, `granted_by`) VALUES
(1, 1, 1, '2025-07-07 13:16:00', NULL),
(2, 1, 2, '2025-07-07 13:16:00', NULL),
(3, 1, 3, '2025-07-07 13:16:00', NULL),
(4, 1, 4, '2025-07-07 13:16:00', NULL),
(5, 1, 5, '2025-07-07 13:16:00', NULL),
(6, 1, 6, '2025-07-07 13:16:00', NULL),
(7, 1, 7, '2025-07-07 13:16:00', NULL),
(8, 1, 8, '2025-07-07 13:16:00', NULL),
(9, 1, 9, '2025-07-07 13:16:00', NULL),
(10, 1, 10, '2025-07-07 13:16:00', NULL),
(11, 1, 11, '2025-07-07 13:16:00', NULL),
(12, 1, 12, '2025-07-07 13:16:00', NULL),
(13, 1, 13, '2025-07-07 13:16:00', NULL),
(14, 1, 14, '2025-07-07 13:16:00', NULL),
(15, 1, 15, '2025-07-07 13:16:00', NULL),
(16, 1, 16, '2025-07-07 13:16:00', NULL),
(17, 1, 17, '2025-07-07 13:16:00', NULL),
(18, 1, 18, '2025-07-07 13:16:00', NULL),
(19, 1, 19, '2025-07-07 13:16:00', NULL),
(20, 1, 20, '2025-07-07 13:16:00', NULL),
(21, 1, 21, '2025-07-07 13:16:00', NULL),
(22, 1, 22, '2025-07-07 13:16:00', NULL),
(23, 1, 23, '2025-07-07 13:16:00', NULL),
(24, 1, 24, '2025-07-07 13:16:00', NULL),
(25, 13, 17, '2025-07-07 13:16:00', NULL),
(26, 1, 26, '2025-07-07 13:16:00', NULL),
(27, 1, 27, '2025-07-07 13:16:00', NULL),
(28, 1, 28, '2025-07-07 13:16:00', NULL),
(29, 1, 29, '2025-07-07 13:16:00', NULL),
(30, 1, 30, '2025-07-07 13:16:00', NULL),
(31, 1, 31, '2025-07-07 13:16:00', NULL),
(35, 1, 35, '2025-07-07 13:16:00', NULL),
(36, 1, 36, '2025-07-07 13:16:00', NULL),
(37, 1, 37, '2025-07-07 13:16:00', NULL),
(38, 1, 38, '2025-07-07 13:16:00', NULL),
(39, 1, 39, '2025-07-07 13:16:00', NULL),
(40, 1, 40, '2025-07-07 13:16:00', NULL),
(41, 1, 41, '2025-07-07 13:16:00', NULL),
(42, 2, 2, '2025-07-07 13:16:00', NULL),
(43, 2, 3, '2025-07-07 13:16:00', NULL),
(44, 2, 7, '2025-07-07 13:16:00', NULL),
(45, 2, 9, '2025-07-07 13:16:00', NULL),
(46, 2, 10, '2025-07-07 13:16:00', NULL),
(47, 2, 13, '2025-07-07 13:16:00', NULL),
(48, 2, 14, '2025-07-07 13:16:00', NULL),
(49, 2, 16, '2025-07-07 13:16:00', NULL),
(50, 2, 21, '2025-07-07 13:16:00', NULL),
(51, 2, 23, '2025-07-07 13:16:00', NULL),
(52, 2, 24, '2025-07-07 13:16:00', NULL),
(53, 2, 27, '2025-07-07 13:16:00', NULL),
(54, 2, 29, '2025-07-07 13:16:00', NULL),
(55, 2, 31, '2025-07-07 13:16:00', NULL),
(56, 2, 35, '2025-07-07 13:16:00', NULL),
(57, 2, 36, '2025-07-07 13:16:00', NULL),
(58, 2, 38, '2025-07-07 13:16:00', NULL),
(59, 3, 2, '2025-07-07 13:16:00', NULL),
(60, 3, 7, '2025-07-07 13:16:00', NULL),
(61, 3, 9, '2025-07-07 13:16:00', NULL),
(62, 3, 13, '2025-07-07 13:16:00', NULL),
(63, 3, 14, '2025-07-07 13:16:00', NULL),
(64, 3, 16, '2025-07-07 13:16:00', NULL),
(65, 3, 23, '2025-07-07 13:16:00', NULL),
(66, 3, 24, '2025-07-07 13:16:00', NULL),
(67, 3, 27, '2025-07-07 13:16:00', NULL),
(68, 3, 29, '2025-07-07 13:16:00', NULL),
(69, 3, 35, '2025-07-07 13:16:00', NULL),
(70, 3, 36, '2025-07-07 13:16:00', NULL),
(71, 5, 6, '2025-07-07 13:16:00', NULL),
(72, 5, 11, '2025-07-07 13:16:00', NULL),
(73, 5, 12, '2025-07-07 13:16:00', NULL),
(74, 5, 22, '2025-07-07 13:16:00', NULL),
(75, 5, 27, '2025-07-07 13:16:00', NULL),
(78, 14, 1, '2025-07-15 15:32:26', NULL),
(79, 14, 2, '2025-07-15 15:32:26', NULL),
(80, 14, 3, '2025-07-15 15:32:26', NULL),
(81, 14, 4, '2025-07-15 15:32:26', NULL),
(82, 14, 5, '2025-07-15 15:32:26', NULL),
(83, 14, 6, '2025-07-15 15:32:26', NULL),
(84, 14, 7, '2025-07-15 15:32:26', NULL),
(85, 14, 8, '2025-07-15 15:32:26', NULL),
(86, 14, 9, '2025-07-15 15:32:26', NULL),
(87, 14, 10, '2025-07-15 15:32:26', NULL),
(88, 14, 11, '2025-07-15 15:32:26', NULL),
(89, 14, 12, '2025-07-15 15:32:26', NULL),
(90, 14, 13, '2025-07-15 15:32:26', NULL),
(91, 14, 14, '2025-07-15 15:32:26', NULL),
(92, 14, 15, '2025-07-15 15:32:26', NULL),
(93, 14, 16, '2025-07-15 15:32:26', NULL),
(94, 14, 17, '2025-07-15 15:32:26', NULL),
(95, 14, 18, '2025-07-15 15:32:26', NULL),
(96, 14, 19, '2025-07-15 15:32:26', NULL),
(97, 14, 20, '2025-07-15 15:32:26', NULL),
(98, 14, 21, '2025-07-15 15:32:26', NULL),
(99, 14, 22, '2025-07-15 15:32:26', NULL),
(100, 14, 23, '2025-07-15 15:32:26', NULL),
(101, 14, 24, '2025-07-15 15:32:26', NULL),
(102, 14, 25, '2025-07-15 15:32:26', NULL),
(103, 14, 26, '2025-07-15 15:32:26', NULL),
(104, 14, 27, '2025-07-15 15:32:26', NULL),
(105, 14, 28, '2025-07-15 15:32:26', NULL),
(106, 14, 29, '2025-07-15 15:32:26', NULL),
(107, 14, 30, '2025-07-15 15:32:26', NULL),
(108, 14, 31, '2025-07-15 15:32:26', NULL),
(112, 14, 35, '2025-07-15 15:32:26', NULL),
(113, 14, 36, '2025-07-15 15:32:26', NULL),
(114, 14, 37, '2025-07-15 15:32:26', NULL),
(115, 14, 38, '2025-07-15 15:32:26', NULL),
(116, 14, 39, '2025-07-15 15:32:26', NULL),
(117, 14, 40, '2025-07-15 15:32:26', NULL),
(118, 14, 41, '2025-07-15 15:32:26', NULL),
(119, 5, 17, '2025-07-16 11:23:28', NULL),
(120, 5, 16, '2025-07-16 11:23:28', NULL),
(121, 15, 1, '2025-09-10 15:27:17', NULL),
(122, 15, 2, '2025-09-10 15:27:17', NULL),
(123, 15, 3, '2025-09-10 15:27:17', NULL),
(124, 15, 4, '2025-09-10 15:27:17', NULL),
(125, 15, 5, '2025-09-10 15:27:17', NULL),
(126, 15, 6, '2025-09-10 15:27:17', NULL),
(127, 15, 7, '2025-09-10 15:27:17', NULL),
(128, 15, 8, '2025-09-10 15:27:17', NULL),
(129, 15, 9, '2025-09-10 15:27:17', NULL),
(130, 15, 10, '2025-09-10 15:27:17', NULL),
(131, 15, 11, '2025-09-10 15:27:17', NULL),
(132, 15, 12, '2025-09-10 15:27:17', NULL),
(133, 15, 13, '2025-09-10 15:27:17', NULL),
(134, 15, 14, '2025-09-10 15:27:17', NULL),
(135, 15, 15, '2025-09-10 15:27:17', NULL),
(136, 15, 16, '2025-09-10 15:27:17', NULL),
(137, 15, 17, '2025-09-10 15:27:17', NULL),
(138, 15, 18, '2025-09-10 15:27:17', NULL),
(139, 15, 19, '2025-09-10 15:27:17', NULL),
(140, 15, 20, '2025-09-10 15:27:17', NULL),
(141, 15, 21, '2025-09-10 15:27:17', NULL),
(142, 15, 22, '2025-09-10 15:27:17', NULL),
(143, 15, 23, '2025-09-10 15:27:17', NULL),
(144, 15, 24, '2025-09-10 15:27:17', NULL),
(145, 15, 25, '2025-09-10 15:27:17', NULL),
(146, 15, 26, '2025-09-10 15:27:17', NULL),
(147, 15, 27, '2025-09-10 15:27:17', NULL),
(148, 15, 28, '2025-09-10 15:27:17', NULL),
(149, 15, 29, '2025-09-10 15:27:17', NULL),
(150, 15, 30, '2025-09-10 15:27:17', NULL),
(151, 15, 31, '2025-09-10 15:27:17', NULL),
(155, 15, 35, '2025-09-10 15:27:17', NULL),
(156, 15, 36, '2025-09-10 15:27:17', NULL),
(157, 15, 37, '2025-09-10 15:27:17', NULL),
(158, 15, 38, '2025-09-10 15:27:17', NULL),
(159, 15, 39, '2025-09-10 15:27:17', NULL),
(160, 15, 40, '2025-09-10 15:27:17', NULL),
(161, 15, 41, '2025-09-10 15:27:17', NULL),
(0, 1, 1, '2026-02-20 00:13:03', NULL),
(0, 1, 2, '2026-02-20 00:13:03', NULL),
(0, 1, 3, '2026-02-20 00:13:03', NULL),
(0, 1, 4, '2026-02-20 00:13:03', NULL),
(0, 1, 5, '2026-02-20 00:13:03', NULL),
(0, 1, 6, '2026-02-20 00:13:03', NULL),
(0, 1, 7, '2026-02-20 00:13:03', NULL),
(0, 1, 8, '2026-02-20 00:13:03', NULL),
(0, 1, 9, '2026-02-20 00:13:03', NULL),
(0, 1, 10, '2026-02-20 00:13:03', NULL),
(0, 1, 11, '2026-02-20 00:13:03', NULL),
(0, 1, 12, '2026-02-20 00:13:03', NULL),
(0, 1, 13, '2026-02-20 00:13:03', NULL),
(0, 1, 14, '2026-02-20 00:13:03', NULL),
(0, 1, 15, '2026-02-20 00:13:03', NULL),
(0, 1, 16, '2026-02-20 00:13:03', NULL),
(0, 1, 17, '2026-02-20 00:13:03', NULL),
(0, 1, 18, '2026-02-20 00:13:03', NULL),
(0, 1, 19, '2026-02-20 00:13:03', NULL),
(0, 1, 20, '2026-02-20 00:13:03', NULL),
(0, 1, 21, '2026-02-20 00:13:03', NULL),
(0, 1, 22, '2026-02-20 00:13:03', NULL),
(0, 1, 23, '2026-02-20 00:13:03', NULL),
(0, 1, 24, '2026-02-20 00:13:03', NULL),
(0, 1, 25, '2026-02-20 00:13:03', NULL),
(0, 1, 26, '2026-02-20 00:13:03', NULL),
(0, 1, 27, '2026-02-20 00:13:03', NULL),
(0, 1, 28, '2026-02-20 00:13:03', NULL),
(0, 1, 29, '2026-02-20 00:13:03', NULL),
(0, 1, 30, '2026-02-20 00:13:03', NULL),
(0, 1, 31, '2026-02-20 00:13:03', NULL),
(0, 1, 35, '2026-02-20 00:13:03', NULL),
(0, 1, 36, '2026-02-20 00:13:03', NULL),
(0, 1, 37, '2026-02-20 00:13:03', NULL),
(0, 1, 38, '2026-02-20 00:13:03', NULL),
(0, 1, 39, '2026-02-20 00:13:03', NULL),
(0, 1, 40, '2026-02-20 00:13:03', NULL),
(0, 1, 41, '2026-02-20 00:13:03', NULL),
(0, 1, 0, '2026-02-20 00:13:03', NULL),
(0, 1, 0, '2026-02-20 00:13:03', NULL),
(0, 1, 0, '2026-02-20 00:13:03', NULL),
(0, 1, 0, '2026-02-20 00:13:03', NULL),
(0, 1, 0, '2026-02-20 00:13:03', NULL),
(0, 1, 0, '2026-02-20 00:13:03', NULL),
(0, 1, 0, '2026-02-20 00:13:03', NULL),
(0, 1, 0, '2026-02-20 00:13:03', NULL),
(0, 1, 0, '2026-02-20 00:13:03', NULL),
(0, 1, 0, '2026-02-20 00:13:03', NULL),
(0, 1, 0, '2026-02-20 00:13:03', NULL),
(0, 1, 0, '2026-02-20 00:13:03', NULL),
(0, 1, 0, '2026-02-20 00:13:03', NULL),
(0, 1, 0, '2026-02-20 00:13:03', NULL),
(0, 1, 0, '2026-02-20 00:13:03', NULL),
(0, 1, 0, '2026-02-20 00:13:03', NULL),
(0, 1, 0, '2026-02-20 00:13:03', NULL),
(0, 1, 0, '2026-02-20 00:13:03', NULL),
(0, 1, 0, '2026-02-20 00:13:03', NULL),
(0, 1, 0, '2026-02-20 00:13:03', NULL),
(0, 1, 0, '2026-02-20 00:13:03', NULL),
(0, 1, 0, '2026-02-20 00:13:03', NULL),
(0, 1, 0, '2026-02-20 00:13:03', NULL),
(0, 1, 0, '2026-02-20 00:13:03', NULL),
(0, 1, 0, '2026-02-20 00:13:03', NULL),
(0, 1, 0, '2026-02-20 00:13:03', NULL),
(0, 1, 0, '2026-02-20 00:13:03', NULL),
(0, 1, 0, '2026-02-20 00:13:03', NULL),
(0, 1, 0, '2026-02-20 00:13:03', NULL),
(0, 1, 0, '2026-02-20 00:13:03', NULL),
(0, 1, 0, '2026-02-20 00:13:03', NULL),
(0, 1, 0, '2026-02-20 00:13:03', NULL),
(0, 1, 0, '2026-02-20 00:13:03', NULL),
(0, 1, 0, '2026-02-20 00:13:03', NULL),
(0, 1, 0, '2026-02-20 00:13:03', NULL),
(0, 1, 0, '2026-02-20 00:13:03', NULL),
(0, 1, 0, '2026-02-20 00:13:03', NULL),
(0, 1, 0, '2026-02-20 00:13:03', NULL),
(0, 1, 0, '2026-02-20 00:13:03', NULL),
(0, 1, 0, '2026-02-20 00:13:03', NULL),
(0, 1, 0, '2026-02-20 00:13:03', NULL),
(0, 1, 0, '2026-02-20 00:13:03', NULL),
(0, 1, 0, '2026-02-20 00:13:03', NULL),
(0, 1, 0, '2026-02-20 00:13:03', NULL),
(0, 2, 2, '2026-02-20 00:13:03', NULL),
(0, 2, 0, '2026-02-20 00:13:03', NULL),
(0, 2, 0, '2026-02-20 00:13:03', NULL),
(0, 2, 0, '2026-02-20 00:13:03', NULL),
(0, 2, 0, '2026-02-20 00:13:03', NULL),
(0, 2, 0, '2026-02-20 00:13:03', NULL),
(0, 2, 0, '2026-02-20 00:13:03', NULL),
(0, 2, 0, '2026-02-20 00:13:03', NULL),
(0, 2, 0, '2026-02-20 00:13:03', NULL),
(0, 2, 0, '2026-02-20 00:13:03', NULL),
(0, 2, 0, '2026-02-20 00:13:03', NULL),
(0, 2, 0, '2026-02-20 00:13:03', NULL),
(0, 2, 0, '2026-02-20 00:13:03', NULL),
(0, 2, 0, '2026-02-20 00:13:03', NULL),
(0, 2, 0, '2026-02-20 00:13:03', NULL),
(0, 2, 0, '2026-02-20 00:13:03', NULL),
(0, 2, 0, '2026-02-20 00:13:03', NULL),
(0, 2, 0, '2026-02-20 00:13:03', NULL),
(0, 2, 0, '2026-02-20 00:13:03', NULL),
(0, 3, 0, '2026-02-20 00:13:03', NULL),
(0, 3, 0, '2026-02-20 00:13:03', NULL),
(0, 3, 0, '2026-02-20 00:13:03', NULL),
(0, 3, 0, '2026-02-20 00:13:03', NULL),
(0, 3, 0, '2026-02-20 00:13:03', NULL),
(0, 3, 0, '2026-02-20 00:13:03', NULL),
(0, 3, 0, '2026-02-20 00:13:03', NULL),
(0, 4, 0, '2026-02-20 00:13:04', NULL),
(0, 4, 0, '2026-02-20 00:13:04', NULL),
(0, 4, 0, '2026-02-20 00:13:04', NULL),
(0, 4, 0, '2026-02-20 00:13:04', NULL),
(0, 5, 0, '2026-02-20 00:13:04', NULL),
(0, 5, 0, '2026-02-20 00:13:04', NULL),
(0, 5, 0, '2026-02-20 00:13:04', NULL),
(0, 6, 22, '2026-02-20 00:13:04', NULL),
(0, 6, 23, '2026-02-20 00:13:04', NULL),
(0, 6, 24, '2026-02-20 00:13:04', NULL),
(0, 6, 25, '2026-02-20 00:13:04', NULL),
(0, 6, 26, '2026-02-20 00:13:04', NULL),
(0, 6, 0, '2026-02-20 00:13:04', NULL),
(0, 6, 0, '2026-02-20 00:13:04', NULL),
(0, 6, 0, '2026-02-20 00:13:04', NULL),
(0, 6, 0, '2026-02-20 00:13:04', NULL),
(0, 6, 0, '2026-02-20 00:13:04', NULL),
(0, 6, 0, '2026-02-20 00:13:04', NULL),
(0, 6, 0, '2026-02-20 00:13:04', NULL),
(0, 6, 0, '2026-02-20 00:13:04', NULL),
(0, 7, 0, '2026-02-20 00:13:04', NULL),
(0, 7, 0, '2026-02-20 00:13:04', NULL),
(0, 7, 0, '2026-02-20 00:13:04', NULL),
(0, 7, 0, '2026-02-20 00:13:04', NULL),
(0, 7, 0, '2026-02-20 00:13:04', NULL),
(0, 7, 0, '2026-02-20 00:13:04', NULL),
(0, 7, 0, '2026-02-20 00:13:04', NULL),
(0, 8, 16, '2026-02-20 00:13:04', NULL),
(0, 8, 17, '2026-02-20 00:13:04', NULL),
(0, 8, 18, '2026-02-20 00:13:04', NULL),
(0, 8, 19, '2026-02-20 00:13:04', NULL),
(0, 8, 20, '2026-02-20 00:13:04', NULL),
(0, 8, 21, '2026-02-20 00:13:04', NULL),
(0, 8, 0, '2026-02-20 00:13:04', NULL),
(0, 8, 0, '2026-02-20 00:13:04', NULL),
(0, 8, 0, '2026-02-20 00:13:04', NULL),
(0, 8, 0, '2026-02-20 00:13:04', NULL),
(0, 8, 0, '2026-02-20 00:13:04', NULL),
(0, 8, 0, '2026-02-20 00:13:04', NULL),
(0, 8, 0, '2026-02-20 00:13:04', NULL),
(0, 9, 0, '2026-02-20 00:13:04', NULL),
(0, 9, 0, '2026-02-20 00:13:04', NULL),
(0, 9, 0, '2026-02-20 00:13:04', NULL),
(0, 9, 0, '2026-02-20 00:13:04', NULL),
(0, 9, 0, '2026-02-20 00:13:04', NULL),
(0, 9, 0, '2026-02-20 00:13:04', NULL),
(0, 10, 0, '2026-02-20 00:13:04', NULL),
(0, 10, 0, '2026-02-20 00:13:04', NULL),
(0, 10, 0, '2026-02-20 00:13:04', NULL),
(0, 10, 0, '2026-02-20 00:13:04', NULL),
(0, 10, 0, '2026-02-20 00:13:04', NULL),
(0, 10, 0, '2026-02-20 00:13:04', NULL),
(0, 10, 0, '2026-02-20 00:13:04', NULL),
(0, 10, 0, '2026-02-20 00:13:04', NULL),
(0, 10, 0, '2026-02-20 00:13:04', NULL),
(0, 10, 0, '2026-02-20 00:13:04', NULL),
(0, 10, 0, '2026-02-20 00:13:04', NULL),
(0, 11, 0, '2026-02-20 00:13:04', NULL),
(0, 11, 0, '2026-02-20 00:13:04', NULL),
(0, 11, 0, '2026-02-20 00:13:04', NULL),
(0, 11, 0, '2026-02-20 00:13:04', NULL),
(0, 11, 0, '2026-02-20 00:13:04', NULL),
(0, 11, 0, '2026-02-20 00:13:04', NULL),
(0, 12, 0, '2026-02-20 00:13:04', NULL),
(0, 12, 0, '2026-02-20 00:13:04', NULL),
(0, 12, 0, '2026-02-20 00:13:04', NULL),
(0, 12, 0, '2026-02-20 00:13:04', NULL),
(0, 12, 0, '2026-02-20 00:13:04', NULL),
(0, 13, 0, '2026-02-20 00:13:04', NULL),
(0, 13, 0, '2026-02-20 00:13:04', NULL),
(0, 13, 0, '2026-02-20 00:13:04', NULL),
(0, 13, 0, '2026-02-20 00:13:04', NULL),
(0, 14, 0, '2026-02-20 00:13:04', NULL),
(0, 14, 0, '2026-02-20 00:13:04', NULL),
(0, 14, 0, '2026-02-20 00:13:04', NULL),
(0, 14, 0, '2026-02-20 00:13:04', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `security_incidents`
--

CREATE TABLE `security_incidents` (
  `id` bigint(20) NOT NULL,
  `date` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `location` varchar(255) NOT NULL,
  `severity` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `incident_type` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sops`
--

CREATE TABLE `sops` (
  `id` bigint(20) NOT NULL,
  `category` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `last_updated` datetime(6) DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `version` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `status_labels`
--

CREATE TABLE `status_labels` (
  `id` bigint(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `status_type` enum('deployable','pending','undeployable','archived') NOT NULL DEFAULT 'deployable',
  `status_meta` enum('deployed','deployable','requestable') NOT NULL DEFAULT 'deployable',
  `color` varchar(10) DEFAULT NULL,
  `show_in_nav` tinyint(1) DEFAULT 1,
  `default_label` tinyint(1) DEFAULT 0,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `status_labels`
--

INSERT INTO `status_labels` (`id`, `name`, `status_type`, `status_meta`, `color`, `show_in_nav`, `default_label`, `notes`, `created_at`, `updated_at`) VALUES
(1, 'Ready to Deploy', 'deployable', 'deployable', '#28a745', 1, 1, NULL, '2026-02-19 22:49:14', '2026-02-19 22:49:14'),
(2, 'Deployed', 'deployable', 'deployed', '#007bff', 1, 0, NULL, '2026-02-19 22:49:14', '2026-02-19 22:49:14'),
(3, 'Pending', 'pending', 'deployable', '#ffc107', 1, 0, NULL, '2026-02-19 22:49:14', '2026-02-19 22:49:14'),
(4, 'Archived', 'archived', 'deployable', '#6c757d', 0, 0, NULL, '2026-02-19 22:49:14', '2026-02-19 22:49:14'),
(5, 'Broken - Not Fixable', 'undeployable', 'deployable', '#dc3545', 0, 0, NULL, '2026-02-19 22:49:14', '2026-02-19 22:49:14'),
(6, 'Out for Repair', 'undeployable', 'deployable', '#fd7e14', 0, 0, NULL, '2026-02-19 22:49:14', '2026-02-19 22:49:14');

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` bigint(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `province` varchar(100) DEFAULT NULL,
  `district` varchar(100) DEFAULT NULL,
  `sector` varchar(100) DEFAULT NULL,
  `cell` varchar(100) DEFAULT NULL,
  `village` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `po_box` varchar(50) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `contact` varchar(100) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`id`, `name`, `address`, `city`, `state`, `province`, `district`, `sector`, `cell`, `village`, `country`, `po_box`, `phone`, `email`, `contact`, `url`, `image`, `notes`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Rwanda ICT Supplies Ltd', 'KN 5 Rd, Kacyiru', 'Kigali', 'Kigali City', 'Kigali City', 'Gasabo', 'Kacyiru', 'Kacyiru', 'Kamatamu', 'Rwanda', 'P.O. Box 100 Kigali', '+250 788 111 000', 'sales@rwandaictsupplies.rw', 'Sales Desk', 'https://example.rw', NULL, 'Laptops, desktops, accessories.', '2026-02-20 17:48:14', '2026-02-20 17:48:14', NULL),
(2, 'Kigali Office Solutions', 'KK 15 Ave, Remera', 'Kigali', 'Kigali City', 'Kigali City', 'Gasabo', 'Remera', 'Remera', 'Rukiri I', 'Rwanda', 'P.O. Box 200 Kigali', '+250 788 222 000', 'orders@kigos.rw', 'Procurement', 'https://example.rw', NULL, 'Printers, toner, paper, office items.', '2026-02-20 17:48:14', '2026-02-20 17:48:14', NULL),
(3, 'Africa Network Distributors', 'KG 9 Ave, Kimihurura', 'Kigali', 'Kigali City', 'Kigali City', 'Gasabo', 'Kimihurura', 'Kimihurura', 'Rugando', 'Rwanda', 'P.O. Box 300 Kigali', '+250 788 333 000', 'support@and.rw', 'Network Team', 'https://example.rw', NULL, 'Networking equipment.', '2026-02-20 17:48:14', '2026-02-20 17:48:14', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `support_tickets`
--

CREATE TABLE `support_tickets` (
  `id` bigint(20) NOT NULL,
  `assigned_to` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `priority` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `system_configs`
--

CREATE TABLE `system_configs` (
  `id` bigint(20) NOT NULL,
  `config_key` varchar(255) NOT NULL,
  `config_value` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `id` int(11) NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `data_type` enum('string','number','boolean','json') DEFAULT 'string',
  `is_public` tinyint(1) DEFAULT 0,
  `updated_by` int(11) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`id`, `setting_key`, `setting_value`, `description`, `data_type`, `is_public`, `updated_by`, `updated_at`) VALUES
(1, 'organization_name', 'Craft Resource Management', 'Organization name', 'string', 1, NULL, '2025-07-07 13:16:01'),
(2, 'organization_address', '123 Government Plaza, Capital City, State 12345', 'Organization address', 'string', 1, NULL, '2025-07-07 13:16:01'),
(3, 'organization_phone', '+1-555-GOV-MENT', 'Main phone number', 'string', 1, NULL, '2025-07-07 13:16:01'),
(4, 'organization_email', 'info@craftresource.gov', 'Main email address', 'string', 1, NULL, '2025-07-07 13:16:01'),
(5, 'working_hours_start', '08:00', 'Standard working hours start time', 'string', 1, NULL, '2025-07-07 13:16:01'),
(6, 'working_hours_end', '17:00', 'Standard working hours end time', 'string', 1, NULL, '2025-07-07 13:16:01'),
(7, 'overtime_threshold', '8', 'Hours before overtime calculation', 'number', 0, NULL, '2025-07-07 13:16:01'),
(8, 'max_login_attempts', '5', 'Maximum failed login attempts before lockout', 'number', 0, NULL, '2025-07-07 13:16:01'),
(9, 'password_min_length', '8', 'Minimum password length', 'number', 0, NULL, '2025-07-07 13:16:01'),
(10, 'session_timeout', '3600', 'Session timeout in seconds', 'number', 0, NULL, '2025-07-07 13:16:01'),
(11, 'backup_retention_days', '30', 'Number of days to retain backups', 'number', 0, NULL, '2025-07-07 13:16:01'),
(12, 'notification_email_enabled', 'true', 'Enable email notifications', 'boolean', 0, NULL, '2025-07-07 13:16:01'),
(14, 'visitor_badge_expiry_hours', '8', 'Visitor badge validity in hours', 'number', 0, NULL, '2025-07-07 13:16:01');

-- --------------------------------------------------------

--
-- Table structure for table `training_courses`
--

CREATE TABLE `training_courses` (
  `id` bigint(20) NOT NULL,
  `course_name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `end_date` date NOT NULL,
  `start_date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `employee_id` varchar(20) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `middle_name` varchar(50) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `hire_date` date NOT NULL,
  `department_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `manager_id` int(11) DEFAULT NULL,
  `salary` decimal(12,2) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `biometric_enrollment_status` varchar(100) DEFAULT 'NONE',
  `last_login` timestamp NULL DEFAULT NULL,
  `failed_login_attempts` int(11) DEFAULT 0,
  `account_locked_until` timestamp NULL DEFAULT NULL,
  `password_reset_token` varchar(255) DEFAULT NULL,
  `password_reset_expires` timestamp NULL DEFAULT NULL,
  `date_of_joining` datetime(6) DEFAULT NULL,
  `account_number` varchar(255) DEFAULT NULL,
  `momo_number` varchar(255) DEFAULT NULL,
  `profile_picture_url` varchar(255) DEFAULT NULL,
  `emergency_contact_name` varchar(255) DEFAULT NULL,
  `emergency_contact_phone` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `account_status` varchar(255) DEFAULT NULL,
  `bank_name` varchar(255) DEFAULT NULL,
  `default_password_changed` bit(1) DEFAULT NULL,
  `job_grade_id` int(11) DEFAULT NULL,
  `profile_completed` bit(1) DEFAULT NULL,
  `provisioned_by` int(11) DEFAULT NULL,
  `provisioned_date` datetime(6) DEFAULT NULL,
  `temporary_password` varchar(255) DEFAULT NULL,
  `personal_contact` varchar(20) DEFAULT NULL,
  `contract_end_date` date DEFAULT NULL,
  `probation_end_date` date DEFAULT NULL,
  `tenant_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `employee_id`, `email`, `password`, `first_name`, `last_name`, `middle_name`, `phone`, `address`, `date_of_birth`, `hire_date`, `department_id`, `role_id`, `manager_id`, `salary`, `is_active`, `biometric_enrollment_status`, `last_login`, `failed_login_attempts`, `account_locked_until`, `password_reset_token`, `password_reset_expires`, `date_of_joining`, `account_number`, `momo_number`, `profile_picture_url`, `emergency_contact_name`, `emergency_contact_phone`, `created_at`, `updated_at`, `account_status`, `bank_name`, `default_password_changed`, `job_grade_id`, `profile_completed`, `provisioned_by`, `provisioned_date`, `temporary_password`, `personal_contact`, `contract_end_date`, `probation_end_date`, `tenant_id`) VALUES
(1, 'CRMS20022025003', 'garrisonsayor@gmail.com', '$2a$10$ZgXncgsDbc7.wCKGUCY0Veorgz4xjD2c3/VsxJAYh6IEgH11abPce', 'Dr. Enan', 'Nyesheja', 'Muhire', '+250791955398', 'Kanombe', '2002-02-04', '2025-01-01', 3, 1, NULL, 120000.00, 1, 'NONE', '2026-02-19 16:45:21', 0, NULL, NULL, NULL, NULL, '100235367283', '0791955398', 'http://res.cloudinary.com/dgfeef4ot/image/upload/v1770163325/uq8dsnadkdyzf3qmopzc.png', 'Albertine Tenneh Wilson', '079001274', '2025-07-07 15:16:00', '2026-02-20 02:13:04', 'ACTIVE', 'Bank of Kigali', b'1', NULL, b'1', NULL, NULL, NULL, NULL, '2027-01-01', '2024-04-01', NULL),
(2, 'CRMS20022024001', 'hr.head@craftresource.gov', '$2b$10$o/Y0kcYZqyZdhujd8S4uOuwftIaEfRNEdwKOCFDhSUT4bAGwpNDz2', 'Garrison', 'Sayor III', 'Nyunti', '+250791955398', 'Barnesville Estate, Area B53', '2002-10-30', '2024-01-15', 1, 10, NULL, 95000.00, 1, 'NONE', '2026-02-04 05:38:58', 0, NULL, NULL, NULL, NULL, NULL, NULL, 'http://res.cloudinary.com/dgfeef4ot/image/upload/v1770176080/vxogpmt0okleow6vzcnq.jpg', 'Floyd Sayor', '+231777512084', '2025-07-07 15:16:00', '2026-02-20 02:13:04', 'ACTIVE', NULL, NULL, NULL, b'1', NULL, NULL, NULL, NULL, '2025-01-15', '2024-04-15', NULL),
(3, '', 'finance.head@craftresource.gov', '$2b$10$o/Y0kcYZqyZdhujd8S4uOuwftIaEfRNEdwKOCFDhSUT4bAGwpNDz2', 'Christopher', 'Leabon', NULL, '+1234567892', NULL, NULL, '2024-01-15', 2, 8, NULL, 98000.00, 1, 'NONE', '2025-12-29 11:59:25', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-07 15:16:00', '2026-02-20 02:13:04', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-01-15', '2024-04-15', NULL),
(4, '', 'it.head@craftresource.gov', '$2b$10$o/Y0kcYZqyZdhujd8S4uOuwftIaEfRNEdwKOCFDhSUT4bAGwpNDz2', 'George', 'Kona', NULL, '+1234567893', NULL, NULL, '2024-01-15', 3, 12, NULL, 105000.00, 1, 'NONE', NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-07 15:16:00', '2026-02-20 02:13:04', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-01-15', '2024-04-15', NULL),
(5, '', 'ops.head@craftresource.gov', '$2b$10$o/Y0kcYZqyZdhujd8S4uOuwftIaEfRNEdwKOCFDhSUT4bAGwpNDz2', 'Thomas', 'Sneh', NULL, '+1234567894', NULL, NULL, '2024-01-15', 4, 6, NULL, 92000.00, 1, 'NONE', NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-07 15:16:00', '2026-02-20 02:13:04', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-01-15', '2024-04-15', NULL),
(6, '', 'hr.manager@craftresource.gov', '$2b$10$o/Y0kcYZqyZdhujd8S4uOuwftIaEfRNEdwKOCFDhSUT4bAGwpNDz2', 'Jennifer', 'Davis', NULL, '+1234567895', NULL, NULL, '2024-02-01', 1, 11, NULL, 75000.00, 1, 'NONE', NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-07 15:16:00', '2026-02-20 02:13:04', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-02-01', '2024-05-01', NULL),
(7, '', 'finance.manager@craftresource.gov', '$2b$10$o/Y0kcYZqyZdhujd8S4uOuwftIaEfRNEdwKOCFDhSUT4bAGwpNDz2', 'Robert', 'Wilson', NULL, '+1234567896', NULL, NULL, '2024-02-01', 2, 9, NULL, 78000.00, 1, 'NONE', NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-07 15:16:00', '2026-02-20 02:13:04', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-02-01', '2024-05-01', NULL),
(8, '', 'it.manager@craftresource.gov', '$2b$10$o/Y0kcYZqyZdhujd8S4uOuwftIaEfRNEdwKOCFDhSUT4bAGwpNDz2', 'Amanda', 'Brown', NULL, '+1234567897', NULL, NULL, '2024-02-01', 3, 13, NULL, 82000.00, 1, 'NONE', NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-07 15:16:00', '2026-02-20 02:13:04', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-02-01', '2024-05-01', NULL),
(9, '', 'john.doe@craftresource.gov', '$2b$10$o/Y0kcYZqyZdhujd8S4uOuwftIaEfRNEdwKOCFDhSUT4bAGwpNDz2', 'John', 'Doe', NULL, '+1234567898', NULL, NULL, '2024-03-01', 1, 14, NULL, 55000.00, 1, 'NONE', NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-07 15:16:00', '2026-02-20 02:13:04', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-03-01', '2024-06-01', NULL),
(10, '', 'jane.smith@craftresource.gov', '$2b$10$o/Y0kcYZqyZdhujd8S4uOuwftIaEfRNEdwKOCFDhSUT4bAGwpNDz2', 'Jane', 'Smith', NULL, '+1234567899', NULL, NULL, '2024-03-01', 2, 14, NULL, 58000.00, 1, 'NONE', NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-07 15:16:00', '2026-02-20 02:13:04', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-03-01', '2024-06-01', NULL),
(11, '', 'mark.jones@craftresource.gov', '$2b$10$o/Y0kcYZqyZdhujd8S4uOuwftIaEfRNEdwKOCFDhSUT4bAGwpNDz2', 'Mark', 'Jones', NULL, '+1234567800', NULL, NULL, '2024-03-15', 3, 14, NULL, 62000.00, 1, 'NONE', NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-07 15:16:00', '2026-02-20 02:13:04', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-03-15', '2024-06-15', NULL),
(12, '', 'emily.white@craftresource.gov', '$2b$10$o/Y0kcYZqyZdhujd8S4uOuwftIaEfRNEdwKOCFDhSUT4bAGwpNDz2', 'Emily', 'White', NULL, '+1234567801', NULL, NULL, '2024-03-15', 4, 14, NULL, 54000.00, 1, 'NONE', NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-07 15:16:00', '2026-02-20 02:13:04', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-03-15', '2024-06-15', NULL),
(13, '', 'alex.green@craftresource.gov', '$2b$10$o/Y0kcYZqyZdhujd8S4uOuwftIaEfRNEdwKOCFDhSUT4bAGwpNDz2', 'Alex', 'Green', NULL, '+1234567802', NULL, NULL, '2024-04-01', 5, 14, NULL, 59000.00, 1, 'NONE', NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-07 15:16:00', '2026-02-20 02:13:04', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-04-01', '2024-07-01', NULL),
(14, '', 'maria.garcia@craftresource.gov', '$2b$10$o/Y0kcYZqyZdhujd8S4uOuwftIaEfRNEdwKOCFDhSUT4bAGwpNDz2', 'Maria', 'Garcia', NULL, '+1234567803', NULL, NULL, '2024-04-01', 6, 14, NULL, 56000.00, 1, 'NONE', NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-07 15:16:00', '2026-02-20 02:13:04', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-04-01', '2024-07-01', NULL),
(15, '', 'chris.taylor@craftresource.gov', '$2b$10$o/Y0kcYZqyZdhujd8S4uOuwftIaEfRNEdwKOCFDhSUT4bAGwpNDz2', 'Chris', 'Taylor', NULL, '+1234567804', NULL, NULL, '2024-04-15', 7, 14, NULL, 57000.00, 1, 'NONE', NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-07 15:16:00', '2026-02-20 02:13:04', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-04-15', '2024-07-15', NULL),
(19, '', 'garrisonsay@gmail.com', '$2b$10$o/Y0kcYZqyZdhujd8S4uOuwftIaEfRNEdwKOCFDhSUT4bAGwpNDz2', 'Crafty', 'Dev', NULL, NULL, NULL, NULL, '2024-01-01', 2, 14, NULL, NULL, 1, 'NONE', '2025-12-18 15:43:46', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-07 18:06:52', '2026-02-20 02:13:04', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-01-01', '2024-04-01', NULL),
(20, '', 'issaadamx@gmail.com', '$2b$10$o/Y0kcYZqyZdhujd8S4uOuwftIaEfRNEdwKOCFDhSUT4bAGwpNDz2', 'Issa', 'Adams', NULL, NULL, NULL, NULL, '2024-01-01', 1, 14, NULL, NULL, 1, 'NONE', '2025-10-06 16:17:19', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 17:32:26', '2026-02-20 02:13:04', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-01-01', '2024-04-01', NULL),
(21, 'CRMS20032025003', 'albertinewilson29@gmail.com', '$2b$10$o/Y0kcYZqyZdhujd8S4uOuwftIaEfRNEdwKOCFDhSUT4bAGwpNDz2', 'Albertine', 'Wilson', 'Tenneh', '0790001273', 'Kanombe', '2003-01-05', '2025-09-10', 3, 2, NULL, NULL, 1, 'NONE', '2025-11-20 16:08:32', 0, NULL, NULL, NULL, NULL, '4493339187', '0791955398', 'http://res.cloudinary.com/dgfeef4ot/image/upload/v1759757113/kkofine7tqq8wug8jesv.jpg', 'Garrison Nyunti Sayor III', '07919555398', '2025-09-10 23:06:21', '2026-02-20 02:13:04', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-10', '2025-12-10', NULL),
(23, 'CRMS20032026004', 'sabbahkarsor@gmail.com', '$2b$10$o/Y0kcYZqyZdhujd8S4uOuwftIaEfRNEdwKOCFDhSUT4bAGwpNDz2', 'Crayton', 'Kamara', 'Morientes', '0791374847', 'Sonatube', '2003-05-21', '2026-01-11', 4, 7, NULL, NULL, 1, 'NONE', '2026-01-11 20:49:17', 0, NULL, NULL, NULL, NULL, '100235367283', '0791374847', NULL, 'Garrison Sayor', '0791955398', '2026-01-11 20:57:03', '2026-02-20 02:13:04', 'ACTIVE', NULL, b'1', 5, b'1', 1, '2026-01-11 20:57:03.000000', 'b7c030e6ad8a8350a68b2e6c955a3ae01d85d6e77e2c0f6f483dbfc691f29ac1', NULL, '2027-01-11', '2026-04-11', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `vendors`
--

CREATE TABLE `vendors` (
  `id` int(11) NOT NULL,
  `vendor_code` varchar(20) NOT NULL,
  `company_name` varchar(100) NOT NULL,
  `contact_person` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `tax_id` varchar(50) DEFAULT NULL,
  `bank_account` varchar(50) DEFAULT NULL,
  `payment_terms` varchar(100) DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `rating` decimal(3,2) DEFAULT 0.00,
  `is_active` tinyint(1) DEFAULT 1,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vendors`
--

INSERT INTO `vendors` (`id`, `vendor_code`, `company_name`, `contact_person`, `email`, `phone`, `address`, `tax_id`, `bank_account`, `payment_terms`, `category`, `rating`, `is_active`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'VEN001', 'Office Supplies Inc.', 'John Manager', 'john@officesupplies.com', '+1555-0101', '123 Business St, City, State 12345', NULL, NULL, NULL, 'Office Supplies', 4.50, 1, 1, '2025-07-07 13:16:01', '2025-07-07 13:16:01'),
(2, 'VEN002', 'Tech Solutions Ltd.', 'Sarah Tech', 'sarah@techsolutions.com', '+1555-0102', '456 Tech Ave, City, State 12345', NULL, NULL, NULL, 'Technology', 4.80, 1, 1, '2025-07-07 13:16:01', '2025-07-07 13:16:01'),
(3, 'VEN003', 'Furniture World', 'Mike Furniture', 'mike@furnitureworld.com', '+1555-0103', '789 Furniture Blvd, City, State 12345', NULL, NULL, NULL, 'Furniture', 4.20, 1, 1, '2025-07-07 13:16:01', '2025-07-07 13:16:01'),
(4, 'VEN004', 'Professional Services Co.', 'Lisa Professional', 'lisa@proservices.com', '+1555-0104', '321 Service Rd, City, State 12345', NULL, NULL, NULL, 'Professional Services', 4.60, 1, 1, '2025-07-07 13:16:01', '2025-07-07 13:16:01'),
(5, 'VEN005', 'Fleet Management Inc.', 'David Fleet', 'david@fleetmgmt.com', '+1555-0105', '654 Auto Way, City, State 12345', NULL, NULL, NULL, 'Transportation', 4.30, 1, 1, '2025-07-07 13:16:01', '2025-07-07 13:16:01');

-- --------------------------------------------------------

--
-- Table structure for table `visitors`
--

CREATE TABLE `visitors` (
  `id` int(11) NOT NULL,
  `visitor_id` varchar(20) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `company` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `purpose_of_visit` text DEFAULT NULL,
  `employee_to_visit` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `visitors`
--

INSERT INTO `visitors` (`id`, `visitor_id`, `first_name`, `last_name`, `company`, `email`, `phone`, `purpose_of_visit`, `employee_to_visit`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'CRMSVISITOR001', 'Garrison', 'Sayor III', 'ABc', 'garrisonsayor@icloud.com', '+250791955398', 'Interview', 21, 1, '2025-12-05 09:25:02', '2025-12-05 09:25:02'),
(2, 'CrmsVisitor002', 'Christopher', 'Leabon', 'CID104', 'garrisonsayor@gmail.com', '+250791955398', 'Business', 2, 1, '2025-12-05 10:09:34', '2025-12-05 10:09:34'),
(3, 'CrmsVisitor003', 'Thomas ', 'Sneh', 'Natcom', 'thomassneh36@gmail.com', '0792109920', 'Consultation ', 2, 1, '2025-12-07 18:27:23', '2025-12-07 18:27:23');

-- --------------------------------------------------------

--
-- Table structure for table `visitor_checkins`
--

CREATE TABLE `visitor_checkins` (
  `id` int(11) NOT NULL,
  `visitor_id` varchar(20) DEFAULT NULL,
  `check_in_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `check_out_time` timestamp NULL DEFAULT NULL,
  `check_in_method` enum('manual','biometric_face','id_card') DEFAULT 'manual',
  `check_out_method` enum('manual','biometric_face','id_card') DEFAULT 'manual',
  `purpose` text DEFAULT NULL,
  `host_employee_id` int(11) DEFAULT NULL,
  `status` enum('checked_in','checked_out','overstayed') DEFAULT 'checked_in',
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `visitor_checkins`
--

INSERT INTO `visitor_checkins` (`id`, `visitor_id`, `check_in_time`, `check_out_time`, `check_in_method`, `check_out_method`, `purpose`, `host_employee_id`, `status`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'CRMSVISITOR001', '2025-12-05 09:25:02', '2025-12-09 22:49:31', '', 'manual', 'Interview', 21, 'checked_out', NULL, '2025-12-05 09:25:02', '2025-12-09 22:49:31'),
(2, 'CrmsVisitor002', '2025-12-05 10:09:34', '2025-12-05 10:26:35', '', 'manual', 'Business', 2, 'checked_out', NULL, '2025-12-05 10:09:34', '2025-12-05 10:26:35'),
(3, 'CrmsVisitor003', '2025-12-07 18:27:23', '2025-12-09 22:49:17', '', 'manual', 'Consultation ', 2, 'checked_out', NULL, '2025-12-07 18:27:23', '2025-12-09 22:49:17');

-- --------------------------------------------------------

--
-- Table structure for table `visitor_logs`
--

CREATE TABLE `visitor_logs` (
  `id` int(11) NOT NULL,
  `visitor_id` int(11) NOT NULL,
  `purpose` text DEFAULT NULL,
  `employee_to_visit_id` int(11) NOT NULL,
  `check_in_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `check_out_time` timestamp NULL DEFAULT NULL,
  `check_in_method` enum('MANUAL','CARD','QR_SCAN') DEFAULT 'MANUAL',
  `check_out_method` enum('MANUAL','CARD','QR_SCAN') DEFAULT NULL,
  `biometric_template_id` int(11) DEFAULT NULL,
  `card_id_tapped` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `visitor_logs`
--

INSERT INTO `visitor_logs` (`id`, `visitor_id`, `purpose`, `employee_to_visit_id`, `check_in_time`, `check_out_time`, `check_in_method`, `check_out_method`, `biometric_template_id`, `card_id_tapped`) VALUES
(1, 1, 'IT consultation meeting', 4, '2024-12-01 07:00:00', '2024-12-01 10:00:00', 'MANUAL', 'MANUAL', NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `access_rules`
--
ALTER TABLE `access_rules`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `assets`
--
ALTER TABLE `assets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `asset_tag` (`asset_tag`),
  ADD KEY `company_id` (`company_id`),
  ADD KEY `location_id` (`location_id`),
  ADD KEY `rtd_location_id` (`rtd_location_id`),
  ADD KEY `supplier_id` (`supplier_id`),
  ADD KEY `idx_asset_tag` (`asset_tag`),
  ADD KEY `idx_serial` (`serial`),
  ADD KEY `idx_model_id` (`model_id`),
  ADD KEY `idx_status_id` (`status_id`);

--
-- Indexes for table `asset_disposals`
--
ALTER TABLE `asset_disposals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_asset_id` (`asset_id`);

--
-- Indexes for table `asset_maintenances`
--
ALTER TABLE `asset_maintenances`
  ADD PRIMARY KEY (`id`),
  ADD KEY `supplier_id` (`supplier_id`),
  ADD KEY `idx_asset_id` (`asset_id`);

--
-- Indexes for table `asset_models`
--
ALTER TABLE `asset_models`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `manufacturer_id` (`manufacturer_id`),
  ADD KEY `depreciation_id` (`depreciation_id`);

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_timestamp` (`timestamp`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_service_name` (`service_name`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `companies`
--
ALTER TABLE `companies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `components`
--
ALTER TABLE `components`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_cmp_company` (`company_id`),
  ADD KEY `idx_cmp_supplier` (`supplier_id`),
  ADD KEY `idx_cmp_mfg` (`manufacturer_id`),
  ADD KEY `idx_cmp_cat` (`category_id`),
  ADD KEY `idx_cmp_loc` (`location_id`);

--
-- Indexes for table `component_checkouts`
--
ALTER TABLE `component_checkouts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_cc_component` (`component_id`),
  ADD KEY `idx_cc_asset` (`asset_id`),
  ADD KEY `idx_cc_user` (`checked_out_to_user_id`);

--
-- Indexes for table `consumables`
--
ALTER TABLE `consumables`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_consumable_name_company` (`name`,`company_id`),
  ADD KEY `idx_cons_company` (`company_id`),
  ADD KEY `idx_cons_supplier` (`supplier_id`),
  ADD KEY `idx_cons_mfg` (`manufacturer_id`),
  ADD KEY `idx_cons_cat` (`category_id`),
  ADD KEY `idx_cons_loc` (`location_id`);

--
-- Indexes for table `consumable_transactions`
--
ALTER TABLE `consumable_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_ct_consumable` (`consumable_id`),
  ADD KEY `idx_ct_user` (`issued_to_user_id`);

--
-- Indexes for table `depreciations`
--
ALTER TABLE `depreciations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `disposal_records`
--
ALTER TABLE `disposal_records`
  ADD KEY `FK8k3ny1xkx7alutm0ih7lbtp73` (`asset_id`);

--
-- Indexes for table `employee_offboarding`
--
ALTER TABLE `employee_offboarding`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `guard_posts`
--
ALTER TABLE `guard_posts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `job_postings`
--
ALTER TABLE `job_postings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `licenses`
--
ALTER TABLE `licenses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_lic_company` (`company_id`),
  ADD KEY `idx_lic_supplier` (`supplier_id`),
  ADD KEY `idx_lic_mfg` (`manufacturer_id`),
  ADD KEY `idx_lic_cat` (`category_id`);

--
-- Indexes for table `license_assignments`
--
ALTER TABLE `license_assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_la_license` (`license_id`),
  ADD KEY `idx_la_user` (`assigned_to_user_id`),
  ADD KEY `idx_la_asset` (`assigned_to_asset_id`);

--
-- Indexes for table `locations`
--
ALTER TABLE `locations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `parent_id` (`parent_id`);

--
-- Indexes for table `maintenance_records`
--
ALTER TABLE `maintenance_records`
  ADD KEY `FK124fjg43i0s5luwopsoq78k9h` (`asset_id`);

--
-- Indexes for table `manufacturers`
--
ALTER TABLE `manufacturers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `onboarding_checklists`
--
ALTER TABLE `onboarding_checklists`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `status_labels`
--
ALTER TABLE `status_labels`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `access_rules`
--
ALTER TABLE `access_rules`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `assets`
--
ALTER TABLE `assets`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `asset_disposals`
--
ALTER TABLE `asset_disposals`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `asset_maintenances`
--
ALTER TABLE `asset_maintenances`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `asset_models`
--
ALTER TABLE `asset_models`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `companies`
--
ALTER TABLE `companies`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `components`
--
ALTER TABLE `components`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `component_checkouts`
--
ALTER TABLE `component_checkouts`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `consumables`
--
ALTER TABLE `consumables`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `consumable_transactions`
--
ALTER TABLE `consumable_transactions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `depreciations`
--
ALTER TABLE `depreciations`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `employee_offboarding`
--
ALTER TABLE `employee_offboarding`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `guard_posts`
--
ALTER TABLE `guard_posts`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `job_postings`
--
ALTER TABLE `job_postings`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `licenses`
--
ALTER TABLE `licenses`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `license_assignments`
--
ALTER TABLE `license_assignments`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `locations`
--
ALTER TABLE `locations`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `manufacturers`
--
ALTER TABLE `manufacturers`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `onboarding_checklists`
--
ALTER TABLE `onboarding_checklists`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `status_labels`
--
ALTER TABLE `status_labels`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `assets`
--
ALTER TABLE `assets`
  ADD CONSTRAINT `assets_ibfk_1` FOREIGN KEY (`model_id`) REFERENCES `asset_models` (`id`),
  ADD CONSTRAINT `assets_ibfk_2` FOREIGN KEY (`status_id`) REFERENCES `status_labels` (`id`),
  ADD CONSTRAINT `assets_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `assets_ibfk_4` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `assets_ibfk_5` FOREIGN KEY (`rtd_location_id`) REFERENCES `locations` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `assets_ibfk_6` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `asset_disposals`
--
ALTER TABLE `asset_disposals`
  ADD CONSTRAINT `asset_disposals_ibfk_1` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `asset_maintenances`
--
ALTER TABLE `asset_maintenances`
  ADD CONSTRAINT `asset_maintenances_ibfk_1` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `asset_maintenances_ibfk_2` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `asset_models`
--
ALTER TABLE `asset_models`
  ADD CONSTRAINT `asset_models_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  ADD CONSTRAINT `asset_models_ibfk_2` FOREIGN KEY (`manufacturer_id`) REFERENCES `manufacturers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `asset_models_ibfk_3` FOREIGN KEY (`depreciation_id`) REFERENCES `depreciations` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `components`
--
ALTER TABLE `components`
  ADD CONSTRAINT `cmp_ibfk_cat` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `cmp_ibfk_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `cmp_ibfk_loc` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `cmp_ibfk_mfg` FOREIGN KEY (`manufacturer_id`) REFERENCES `manufacturers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `cmp_ibfk_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `component_checkouts`
--
ALTER TABLE `component_checkouts`
  ADD CONSTRAINT `cc_ibfk_asset` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `cc_ibfk_component` FOREIGN KEY (`component_id`) REFERENCES `components` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cc_ibfk_user` FOREIGN KEY (`checked_out_to_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `consumables`
--
ALTER TABLE `consumables`
  ADD CONSTRAINT `cons_ibfk_cat` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `cons_ibfk_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `cons_ibfk_loc` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `cons_ibfk_mfg` FOREIGN KEY (`manufacturer_id`) REFERENCES `manufacturers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `cons_ibfk_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `consumable_transactions`
--
ALTER TABLE `consumable_transactions`
  ADD CONSTRAINT `ct_ibfk_consumable` FOREIGN KEY (`consumable_id`) REFERENCES `consumables` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ct_ibfk_user` FOREIGN KEY (`issued_to_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `disposal_records`
--
ALTER TABLE `disposal_records`
  ADD CONSTRAINT `FK8k3ny1xkx7alutm0ih7lbtp73` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`);

--
-- Constraints for table `licenses`
--
ALTER TABLE `licenses`
  ADD CONSTRAINT `licenses_ibfk_cat` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `licenses_ibfk_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `licenses_ibfk_mfg` FOREIGN KEY (`manufacturer_id`) REFERENCES `manufacturers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `licenses_ibfk_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `license_assignments`
--
ALTER TABLE `license_assignments`
  ADD CONSTRAINT `la_ibfk_asset` FOREIGN KEY (`assigned_to_asset_id`) REFERENCES `assets` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `la_ibfk_license` FOREIGN KEY (`license_id`) REFERENCES `licenses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `la_ibfk_user` FOREIGN KEY (`assigned_to_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `locations`
--
ALTER TABLE `locations`
  ADD CONSTRAINT `locations_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `locations` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `maintenance_records`
--
ALTER TABLE `maintenance_records`
  ADD CONSTRAINT `FK124fjg43i0s5luwopsoq78k9h` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
