-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 23, 2026 at 12:48 PM
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

CREATE DEFINER=`garrisonsayor`@`localhost` PROCEDURE `hr_create_employee` (IN `p_first_name` VARCHAR(50), IN `p_last_name` VARCHAR(50), IN `p_email` VARCHAR(100), IN `p_department_id` INT, IN `p_job_grade_id` INT, IN `p_role_id` INT, IN `p_hr_user_id` INT, OUT `p_employee_id` VARCHAR(10), OUT `p_success` BOOLEAN, OUT `p_message` VARCHAR(255))   BEGIN
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
            provisioned_by, provisioned_date, temporary_password
        ) VALUES (
            new_emp_id, p_first_name, p_last_name, p_email,
            p_department_id, p_job_grade_id, p_role_id,
            temp_password, 'PROVISIONED', FALSE, FALSE,
            p_hr_user_id, NOW(), temp_password
        );
        
        UPDATE departments SET current_headcount = current_headcount + 1 WHERE id = p_department_id;
        
        SET p_employee_id = new_emp_id;
        SET p_success = TRUE;
        SET p_message = CONCAT('Employee created successfully. Temporary Key: ', new_emp_id, ' + CRMSemp123!');
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
CREATE DEFINER=`garrisonsayor`@`localhost` FUNCTION `generate_employee_id` () RETURNS VARCHAR(10) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci DETERMINISTIC READS SQL DATA BEGIN
    DECLARE next_number INT;
    UPDATE `employee_id_sequence` SET `last_employee_number` = `last_employee_number` + 1 WHERE `id` = 1;
    SELECT `last_employee_number` INTO next_number FROM `employee_id_sequence` WHERE `id` = 1;
    RETURN CONCAT('EMP', LPAD(next_number, 3, '0'));
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ;

--
-- Dumping data for table `account_payables`
--

INSERT INTO `account_payables` (`id`, `amount`, `description`, `due_date`, `vendor_name`, `ap_account_code`, `category`, `expense_account_code`, `invoice_number`, `issue_date`, `journal_entry_id`, `payment_terms`, `status`, `created_at`, `created_by`) VALUES
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
) ;

--
-- Dumping data for table `account_receivables`
--

INSERT INTO `account_receivables` (`id`, `amount`, `customer_name`, `description`, `due_date`, `amount_paid`, `ar_account_code`, `balance`, `customer_id`, `invoice_number`, `issue_date`, `journal_entry_id`, `payment_terms`, `revenue_account_code`, `status`, `created_by`, `created_at`) VALUES
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
  `id` int(11) NOT NULL,
  `asset_tag` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `category_id` int(11) NOT NULL,
  `serial_number` varchar(100) DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `manufacturer` varchar(100) DEFAULT NULL,
  `purchase_date` date DEFAULT NULL,
  `purchase_cost` decimal(12,2) DEFAULT NULL,
  `current_value` decimal(12,2) DEFAULT NULL,
  `depreciation_rate` decimal(5,2) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `assigned_to` int(11) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `status` enum('active','inactive','maintenance','disposed','lost') DEFAULT 'active',
  `warranty_expiry` date DEFAULT NULL,
  `last_maintenance_date` date DEFAULT NULL,
  `next_maintenance_date` date DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `acquisition_cost` decimal(38,2) NOT NULL,
  `asset_name` varchar(255) NOT NULL,
  `acquisition_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `assets`
--

INSERT INTO `assets` (`id`, `asset_tag`, `name`, `description`, `category_id`, `serial_number`, `model`, `manufacturer`, `purchase_date`, `purchase_cost`, `current_value`, `depreciation_rate`, `location`, `assigned_to`, `department_id`, `status`, `warranty_expiry`, `last_maintenance_date`, `next_maintenance_date`, `created_by`, `created_at`, `updated_at`, `acquisition_cost`, `asset_name`, `acquisition_date`) VALUES
(1, 'COMP001', 'Dell Laptop - HR Manager', 'Dell Latitude 5520 Laptop', 1, 'DL5520001', 'Latitude 5520', 'Dell', '2024-01-15', 1200.00, 1200.00, NULL, 'HR Office', 6, 1, 'active', NULL, NULL, NULL, 1, '2025-07-07 13:16:01', '2025-07-07 13:16:01', 0.00, '', NULL),
(2, 'COMP002', 'HP Desktop - Finance', 'HP EliteDesk 800 G8', 1, 'HP800G8001', 'EliteDesk 800 G8', 'HP', '2024-01-20', 800.00, 800.00, NULL, 'Finance Department', 7, 2, 'active', NULL, NULL, NULL, 1, '2025-07-07 13:16:01', '2025-07-07 13:16:01', 0.00, '', NULL),
(3, 'FURN001', 'Executive Desk - HR Head', 'Wooden executive desk', 2, 'ED001', 'Executive Series', 'Office Pro', '2024-01-10', 500.00, 500.00, NULL, 'HR Head Office', 2, 1, 'active', NULL, NULL, NULL, 1, '2025-07-07 13:16:01', '2025-07-07 13:16:01', 0.00, '', NULL),
(4, 'VEHI001', 'Toyota Camry - Official', 'Official vehicle for department heads', 3, 'TC2024001', 'Camry 2024', 'Toyota', '2024-02-01', 25000.00, 25000.00, NULL, 'Parking Lot A', NULL, 4, 'active', NULL, NULL, NULL, 1, '2025-07-07 13:16:01', '2025-07-07 13:16:01', 0.00, '', NULL),
(5, 'SOFT001', 'Microsoft Office 365', 'Office productivity suite license', 4, 'MS365-001', 'Office 365 Business', 'Microsoft', '2024-01-01', 150.00, 150.00, NULL, 'IT Department', NULL, 3, 'active', NULL, NULL, NULL, 1, '2025-07-07 13:16:01', '2025-07-07 13:16:01', 0.00, '', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `asset_categories`
--

CREATE TABLE `asset_categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `depreciation_method` enum('straight_line','declining_balance','units_of_production') DEFAULT 'straight_line',
  `useful_life_years` int(11) DEFAULT 5,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `asset_categories`
--

INSERT INTO `asset_categories` (`id`, `name`, `description`, `depreciation_method`, `useful_life_years`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Computer Equipment', 'Laptops, desktops, servers', 'straight_line', 3, 1, '2025-07-07 13:16:01', '2025-07-07 13:16:01'),
(2, 'Office Furniture', 'Desks, chairs, cabinets', 'straight_line', 7, 1, '2025-07-07 13:16:01', '2025-07-07 13:16:01'),
(3, 'Vehicles', 'Cars, trucks, motorcycles', 'declining_balance', 5, 1, '2025-07-07 13:16:01', '2025-07-07 13:16:01'),
(4, 'Software', 'Software licenses and applications', 'straight_line', 2, 1, '2025-07-07 13:16:01', '2025-07-07 13:16:01'),
(5, 'Network Equipment', 'Routers, switches, access points', 'straight_line', 5, 1, '2025-07-07 13:16:01', '2025-07-07 13:16:01'),
(6, 'Office Equipment', 'Printers, scanners, phones', 'straight_line', 4, 1, '2025-07-07 13:16:01', '2025-07-07 13:16:01'),
(7, 'Security Equipment', 'Cameras, access control systems', 'straight_line', 6, 1, '2025-07-07 13:16:01', '2025-07-07 13:16:01');

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `id` bigint(20) NOT NULL,
  `clock_in_time` datetime(6) NOT NULL,
  `clock_out_time` datetime(6) DEFAULT NULL,
  `user_id` bigint(20) NOT NULL,
  `status` varchar(255) DEFAULT NULL,
  `audit_notes` varchar(255) DEFAULT NULL,
  `clock_in_method` varchar(255) DEFAULT NULL,
  `clock_out_method` varchar(255) DEFAULT NULL,
  `flagged_at` datetime(6) DEFAULT NULL,
  `flagged_by` bigint(20) DEFAULT NULL,
  `flagged_for_review` bit(1) DEFAULT NULL,
  `manual_fallback_flag` bit(1) DEFAULT NULL,
  `reviewed_at` datetime(6) DEFAULT NULL,
  `reviewed_by` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`id`, `clock_in_time`, `clock_out_time`, `user_id`, `status`, `audit_notes`, `clock_in_method`, `clock_out_method`, `flagged_at`, `flagged_by`, `flagged_for_review`, `manual_fallback_flag`, `reviewed_at`, `reviewed_by`) VALUES
(1, '2024-06-01 08:30:00.000000', '2024-06-01 17:15:00.000000', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(2, '2024-05-31 08:45:00.000000', '2024-05-31 17:30:00.000000', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(3, '2024-06-01 08:30:00.000000', '2024-06-01 17:15:00.000000', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(4, '2024-05-31 08:45:00.000000', '2024-05-31 17:30:00.000000', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(5, '2024-06-01 08:30:00.000000', '2024-06-01 17:15:00.000000', 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6, '2024-05-31 08:45:00.000000', '2024-05-31 17:30:00.000000', 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(7, '2024-06-01 08:30:00.000000', '2024-06-01 17:15:00.000000', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(8, '2024-05-31 08:45:00.000000', '2024-05-31 17:30:00.000000', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(9, '2024-06-01 08:30:00.000000', '2024-06-01 17:15:00.000000', 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(10, '2024-05-31 08:45:00.000000', '2024-05-31 17:30:00.000000', 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(11, '2024-06-01 08:30:00.000000', '2024-06-01 17:15:00.000000', 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(12, '2024-05-31 08:45:00.000000', '2024-05-31 17:30:00.000000', 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(13, '2024-06-01 08:30:00.000000', '2024-06-01 17:15:00.000000', 6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(14, '2024-05-31 08:45:00.000000', '2024-05-31 17:30:00.000000', 6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(15, '2024-06-01 08:30:00.000000', '2024-06-01 17:15:00.000000', 7, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(16, '2024-05-31 08:45:00.000000', '2024-05-31 17:30:00.000000', 7, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(17, '2024-06-01 08:30:00.000000', '2024-06-01 17:15:00.000000', 8, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(18, '2024-05-31 08:45:00.000000', '2024-05-31 17:30:00.000000', 8, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(19, '2024-06-01 08:30:00.000000', '2024-06-01 17:15:00.000000', 9, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(20, '2024-05-31 08:45:00.000000', '2024-05-31 17:30:00.000000', 9, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(21, '2024-06-01 08:30:00.000000', '2024-06-01 17:15:00.000000', 10, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(22, '2024-05-31 08:45:00.000000', '2024-05-31 17:30:00.000000', 10, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(23, '2024-06-01 08:30:00.000000', '2024-06-01 17:15:00.000000', 11, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(24, '2024-05-31 08:45:00.000000', '2024-05-31 17:30:00.000000', 11, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(25, '2024-06-01 08:30:00.000000', '2024-06-01 17:15:00.000000', 12, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(26, '2024-05-31 08:45:00.000000', '2024-05-31 17:30:00.000000', 12, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(27, '2024-06-01 08:30:00.000000', '2024-06-01 17:15:00.000000', 13, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(28, '2024-05-31 08:45:00.000000', '2024-05-31 17:30:00.000000', 13, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(29, '2024-06-01 08:30:00.000000', '2024-06-01 17:15:00.000000', 14, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(30, '2024-05-31 08:45:00.000000', '2024-05-31 17:30:00.000000', 14, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(31, '2024-06-01 08:30:00.000000', '2024-06-01 17:15:00.000000', 15, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(32, '2024-05-31 08:45:00.000000', '2024-05-31 17:30:00.000000', 15, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(33, '2024-06-01 08:30:00.000000', '2024-06-01 17:15:00.000000', 19, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(34, '2024-05-31 08:45:00.000000', '2024-05-31 17:30:00.000000', 19, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `attendance_records`
--

CREATE TABLE `attendance_records` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `clock_in_time` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `clock_out_time` timestamp NULL DEFAULT NULL,
  `clock_in_method` enum('manual','biometric_face','biometric_fingerprint','card','qr_scan') DEFAULT 'manual',
  `clock_out_method` enum('manual','biometric_face','biometric_fingerprint','card','qr_scan') DEFAULT 'manual',
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
  `buddy_punch_risk` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `attendance_records`
--

INSERT INTO `attendance_records` (`id`, `user_id`, `clock_in_time`, `clock_out_time`, `clock_in_method`, `clock_out_method`, `total_hours`, `overtime_hours`, `break_duration`, `location`, `ip_address`, `notes`, `status`, `approved_by`, `approved_at`, `created_at`, `updated_at`, `flagged_for_review`, `buddy_punch_risk`) VALUES
(1, 9, '2026-01-05 06:00:00', '2026-01-05 15:00:00', 'manual', 'manual', 9.00, 1.00, 60, 'Main Office', '192.168.1.100', 'Regular work day', 'present', NULL, NULL, '2025-07-07 13:16:01', '2026-01-13 14:20:47', 0, 0),
(2, 10, '2026-01-05 06:15:00', '2026-01-05 15:15:00', 'biometric_face', 'biometric_face', 9.00, 1.00, 60, 'Main Office', '192.168.1.101', 'Late arrival', 'late', NULL, NULL, '2025-07-07 13:16:01', '2026-01-13 14:20:47', 0, 0),
(3, 11, '2026-01-05 06:00:00', '2026-01-05 16:00:00', 'qr_scan', 'qr_scan', 10.00, 2.00, 60, 'Main Office', '192.168.1.102', 'Overtime work', 'present', NULL, NULL, '2025-07-07 13:16:01', '2026-01-13 14:20:47', 0, 0),
(4, 12, '2026-01-05 06:30:00', '2026-01-05 15:30:00', 'card', 'card', 9.00, 1.00, 60, 'Main Office', '192.168.1.103', 'Late arrival', 'late', NULL, NULL, '2025-07-07 13:16:01', '2026-01-13 14:20:47', 0, 0),
(5, 9, '2026-01-06 06:00:00', '2026-01-06 15:00:00', 'manual', 'manual', 9.00, 1.00, 60, 'Main Office', '192.168.1.100', 'Regular work day', 'present', NULL, NULL, '2025-07-07 13:16:01', '2026-01-13 14:20:47', 0, 0),
(6, 10, '2026-01-06 06:00:00', '2026-01-06 15:00:00', 'biometric_face', 'biometric_face', 9.00, 1.00, 60, 'Main Office', '192.168.1.101', 'Regular work day', 'present', NULL, NULL, '2025-07-07 13:16:01', '2026-01-13 14:20:47', 0, 0),
(7, 11, '2026-01-06 06:00:00', '2026-01-06 15:30:00', 'qr_scan', 'qr_scan', 9.50, 1.50, 60, 'Main Office', '192.168.1.102', 'Extra work', 'present', NULL, NULL, '2025-07-07 13:16:01', '2026-01-13 14:20:47', 0, 0),
(8, 12, '2026-01-06 06:00:00', '2026-01-06 15:00:00', 'card', 'card', 9.00, 1.00, 60, 'Main Office', '192.168.1.103', 'Regular work day', 'present', NULL, NULL, '2025-07-07 13:16:01', '2026-01-13 14:20:47', 0, 0),
(9, 2, '2026-01-07 06:00:00', '2026-01-07 15:00:00', 'qr_scan', 'qr_scan', 9.00, 1.00, 60, 'Main Office', '192.168.1.104', 'Regular work day', 'present', NULL, NULL, '2025-12-18 16:03:12', '2026-01-13 14:20:47', 0, 0),
(10, 3, '2026-01-07 06:00:00', '2026-01-07 15:00:00', 'qr_scan', 'qr_scan', 9.00, 1.00, 60, 'Main Office', '192.168.1.105', 'Regular work day', 'present', NULL, NULL, '2025-12-18 16:57:39', '2026-01-13 14:20:47', 0, 0),
(11, 1, '2026-01-07 06:00:00', '2026-01-07 15:00:00', 'qr_scan', 'qr_scan', 9.00, 1.00, 60, 'Main Office', '192.168.1.106', 'Regular work day', 'present', NULL, NULL, '2025-12-29 12:18:35', '2026-01-13 15:00:25', 0, 0),
(12, 1, '2026-01-07 06:00:00', '2026-01-07 15:00:00', 'qr_scan', 'qr_scan', 9.00, 1.00, 60, 'Main Office', '192.168.1.107', 'Regular work day', 'present', NULL, NULL, '2025-12-29 12:42:28', '2026-01-13 14:53:55', 0, 0),
(13, 1, '2026-01-19 13:44:53', '2026-01-19 13:44:53', 'qr_scan', 'manual', 0.00, 0.00, 0, NULL, NULL, NULL, 'present', NULL, NULL, '2026-01-17 18:56:48', '2026-01-19 13:44:53', 0, 0);

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
  `session_id` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `ip_address`, `timestamp`, `details`, `entity_id`, `entity_type`, `request_id`, `result`, `service_name`, `session_id`) VALUES
(1, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-07 16:11:45', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-07 19:11:45\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(2, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-07 16:20:22', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-07 19:20:22\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(3, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-07 16:24:35', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-07 19:24:35\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(4, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-07 16:30:02', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-07 19:30:02\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(5, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-07 21:52:40', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-08 00:52:40\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(6, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-07 21:53:32', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-08 00:53:32\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(7, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-07 21:55:51', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-08 00:55:51\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(8, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-07 22:09:23', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-08 01:09:23\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(9, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-07 22:10:11', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-08 01:10:11\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(10, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-07 22:39:42', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-08 01:39:42\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(11, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-07 23:15:01', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-08 02:15:01\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(12, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-07 23:15:39', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-08 02:15:39\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(13, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-07 23:16:40', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-08 02:16:40\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(14, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-07 23:21:17', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-08 02:21:17\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(15, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-08 01:33:31', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-08 04:33:31\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(16, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-08 07:12:59', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-08 10:12:59\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(17, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-08 07:21:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-08 10:21:26\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(18, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-08 07:24:11', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-08 10:24:11\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(19, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-08 07:34:49', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-08 10:34:49\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(20, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-08 08:05:51', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-08 11:05:51\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(21, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-08 09:28:38', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-08 12:28:38\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(22, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-08 21:35:17', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-09 00:35:17\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(23, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-10 08:38:23', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-10 11:38:23\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(24, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-10 21:12:55', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-11 00:12:55\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(25, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-10 21:43:06', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-11 00:43:06\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(26, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-10 21:50:55', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-11 00:50:55\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(27, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-11 13:29:58', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-11 16:29:58\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(28, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-14 18:40:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-14 21:40:19\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(29, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-14 20:18:30', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-14 23:18:30\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(30, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-14 22:30:34', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-15 01:30:34\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(31, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-15 00:38:43', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-15 03:38:43\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(32, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-15 01:50:25', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-15 04:50:25\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(33, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-15 15:25:52', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-15 18:25:52\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(34, 20, 'User Issa Adams has updated their profile information', NULL, '2025-07-15 15:32:44', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-15 18:32:44\"}', '20', 'USER', NULL, 'success', 'java-backend', NULL),
(35, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-15 21:35:28', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-16 00:35:28\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(36, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-15 22:37:29', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-16 01:37:29\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(37, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-15 23:48:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-16 02:48:03\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(38, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-16 09:14:02', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-16 12:14:02\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(39, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-16 09:14:27', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-16 12:14:27\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(40, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-16 09:37:42', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-16 12:37:42\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(41, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-16 10:50:45', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-16 13:50:45\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(42, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-16 10:59:50', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-16 13:59:50\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(43, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-16 11:06:56', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-16 14:06:56\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(44, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-16 11:24:40', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-16 14:24:40\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(45, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-16 12:25:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-16 15:25:26\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(46, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-16 13:49:33', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-16 16:49:33\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(47, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-16 15:36:53', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-16 18:36:53\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(48, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-24 12:51:51', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-24 15:51:51\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(49, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-24 13:52:53', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-24 16:52:53\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(50, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-24 14:15:05', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-24 17:15:05\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(51, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-24 15:32:02', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-24 18:32:02\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(52, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-24 16:47:41', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-24 19:47:41\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(53, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-24 18:18:20', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-24 21:18:20\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(54, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-24 19:22:04', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-24 22:22:04\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(55, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-30 10:39:14', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-30 13:39:14\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(56, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-30 14:01:48', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-30 17:01:48\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(57, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-07-30 16:03:01', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-07-30 19:03:01\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(58, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-08-01 12:34:06', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-08-01 15:34:06\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(59, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-08-08 01:17:11', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-08-08 04:17:11\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(60, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-08-08 02:07:09', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-08-08 05:07:09\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(61, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-08-08 03:27:05', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-08-08 06:27:05\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(62, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-09-01 19:03:59', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-01 22:03:59\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(63, 20, 'User Issa Adams has updated their profile information', NULL, '2025-09-01 19:08:43', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-01 22:08:43\"}', '20', 'USER', NULL, 'success', 'java-backend', NULL),
(64, 20, 'User Issa Adams has updated their profile information', NULL, '2025-09-01 22:56:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-02 01:56:03\"}', '20', 'USER', NULL, 'success', 'java-backend', NULL),
(65, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-09-01 23:21:55', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-02 02:21:55\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(66, 20, 'User Issa Adams has updated their profile information', NULL, '2025-09-01 23:21:55', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-02 02:21:55\"}', '20', 'USER', NULL, 'success', 'java-backend', NULL),
(67, 20, 'User Issa Adams has updated their profile information', NULL, '2025-09-01 23:57:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-02 02:57:03\"}', '20', 'USER', NULL, 'success', 'java-backend', NULL),
(68, 20, 'User Issa Adams has updated their profile information', NULL, '2025-09-02 00:56:50', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-02 03:56:50\"}', '20', 'USER', NULL, 'success', 'java-backend', NULL),
(69, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-09-02 00:59:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-02 03:59:19\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(70, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-09-02 00:59:45', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-02 03:59:45\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(71, 20, 'User Issa Adams has updated their profile information', NULL, '2025-09-02 00:59:59', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-02 03:59:59\"}', '20', 'USER', NULL, 'success', 'java-backend', NULL),
(72, 20, 'User Issa Adams has updated their profile information', NULL, '2025-09-02 01:03:05', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-02 04:03:05\"}', '20', 'USER', NULL, 'success', 'java-backend', NULL),
(73, 20, 'User Issa Adams has updated their profile information', NULL, '2025-09-02 01:06:00', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-02 04:06:00\"}', '20', 'USER', NULL, 'success', 'java-backend', NULL),
(74, 20, 'User Issa Adams has updated their profile information', NULL, '2025-09-02 02:47:08', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-02 05:47:08\"}', '20', 'USER', NULL, 'success', 'java-backend', NULL),
(75, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-09-10 18:00:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-10 21:00:03\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(76, NULL, 'UPDATE', NULL, '2025-09-10 20:04:16', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-10 23:04:16\"}', NULL, 'USER', NULL, 'success', 'java-backend', NULL),
(77, 23, 'User Crayton Kamara has updated their profile information', NULL, '2025-09-10 20:43:02', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-10 23:43:02\"}', '23', 'USER', NULL, 'success', 'java-backend', NULL),
(78, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-09-10 21:02:47', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-11 00:02:47\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(79, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-09-10 21:06:21', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-11 00:06:21\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(80, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-09-10 21:06:21', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-11 00:06:21\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(81, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-09-20 07:15:57', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-20 10:15:57\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(82, 20, 'User Issa Adams has updated their profile information', NULL, '2025-09-20 07:26:27', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-20 10:26:27\"}', '20', 'USER', NULL, 'success', 'java-backend', NULL),
(83, 20, 'User Issa Adams has updated their profile information', NULL, '2025-09-20 07:26:36', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-20 10:26:36\"}', '20', 'USER', NULL, 'success', 'java-backend', NULL),
(84, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-09-20 07:52:18', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-20 10:52:18\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(85, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-09-20 07:52:27', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-20 10:52:27\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(86, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-09-20 07:53:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-20 10:53:19\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(87, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-09-20 08:06:41', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-20 11:06:41\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(88, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-09-20 08:06:59', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-20 11:06:59\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(89, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-09-20 08:14:46', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-20 11:14:46\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(90, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-09-20 09:14:07', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-20 12:14:07\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(91, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-09-22 15:07:14', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-22 18:07:14\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(92, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-09-22 15:07:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-22 18:07:24\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(93, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-09-22 16:11:05', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-22 19:11:05\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(94, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-09-24 10:58:37', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-24 13:58:37\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(95, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-09-24 12:17:07', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-09-24 15:17:07\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(96, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-05 16:51:22', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-05 19:51:22\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(97, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-05 21:15:08', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 00:15:08\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(98, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-05 23:02:11', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 02:02:11\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(99, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-06 09:45:47', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 12:45:47\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(100, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-06 11:01:32', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 14:01:32\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(101, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-06 12:48:48', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 15:48:48\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(102, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-06 13:00:13', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 16:00:13\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(103, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-06 13:25:14', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 16:25:14\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(104, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-06 13:46:31', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 16:46:31\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(105, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-06 13:46:38', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 16:46:38\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(106, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-06 15:56:53', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 18:56:53\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(107, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-06 15:56:56', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 18:56:56\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(108, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-06 15:57:33', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 18:57:33\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(109, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-06 15:57:35', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 18:57:35\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(110, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-06 15:57:36', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 18:57:36\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(111, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-06 16:07:34', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 19:07:34\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(112, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-06 16:07:36', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 19:07:36\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(113, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-06 16:07:37', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 19:07:37\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(114, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-06 16:07:38', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 19:07:38\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(115, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-06 16:08:50', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 19:08:50\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(116, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-06 16:13:35', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 19:13:35\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(117, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-06 16:15:59', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 19:15:59\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(118, 20, 'User Issa Adams has updated their profile information', NULL, '2025-10-06 16:17:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 19:17:19\"}', '20', 'USER', NULL, 'success', 'java-backend', NULL),
(119, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-06 16:17:32', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 19:17:32\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(120, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-06 16:17:41', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 19:17:41\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(121, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-06 16:18:31', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 19:18:31\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(122, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-06 16:18:48', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 19:18:48\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(123, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-06 16:19:25', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 19:19:25\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(124, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-06 16:19:52', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 19:19:52\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(125, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-06 16:22:00', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 19:22:00\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(126, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-06 16:22:12', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 19:22:12\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(127, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-06 17:35:59', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 20:35:59\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(128, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-06 18:46:31', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-06 21:46:31\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(129, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-07 10:28:27', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-07 13:28:27\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(130, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-07 13:03:28', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-07 16:03:28\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(131, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-07 14:13:30', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-07 17:13:30\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(132, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-08 05:48:47', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-08 08:48:47\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(133, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-08 06:09:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-08 09:09:24\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(134, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-08 06:09:55', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-08 09:09:55\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(135, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-09 15:19:45', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-09 18:19:45\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(136, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-09 15:19:49', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-09 18:19:49\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(137, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-09 15:20:10', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-09 18:20:10\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(138, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-09 15:22:42', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-09 18:22:42\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(139, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-09 15:22:50', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-09 18:22:50\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(140, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-09 15:23:01', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-09 18:23:01\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(141, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-09 15:24:28', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-09 18:24:28\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(142, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-09 15:24:36', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-09 18:24:36\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(143, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-09 15:24:52', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-09 18:24:52\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(144, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-09 15:25:36', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-09 18:25:36\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(145, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-09 15:25:52', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-09 18:25:52\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(146, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-09 15:26:04', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-09 18:26:04\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(147, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-09 15:26:11', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-09 18:26:11\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(148, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-09 15:26:33', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-09 18:26:33\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(149, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-09 15:27:01', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-09 18:27:01\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(150, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-09 15:27:33', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-09 18:27:33\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(151, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-10 13:55:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-10 16:55:19\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(152, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-19 18:43:51', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-19 21:43:51\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(153, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-19 18:55:08', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-19 21:55:08\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(154, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-22 23:35:34', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-23 02:35:34\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(155, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-10-23 00:40:09', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-10-23 03:40:09\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(156, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-11-12 18:37:48', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-12 20:37:48\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(157, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-11-12 19:38:07', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-12 21:38:07\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(158, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-11-12 21:04:04', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-12 23:04:04\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(159, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-11-13 12:04:20', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-13 14:04:20\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(160, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-11-14 22:35:47', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-15 00:35:47\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(161, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-11-18 11:09:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-18 13:09:24\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(162, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-11-18 11:53:22', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-18 13:53:22\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(163, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-11-19 07:04:08', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-19 09:04:08\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(164, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-11-19 08:18:39', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-19 10:18:39\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(165, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-11-19 09:55:29', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-19 11:55:29\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(166, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-11-20 11:41:54', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-20 13:41:54\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(167, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-11-20 12:42:50', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-20 14:42:50\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(168, 21, 'User Albertine Wilson has updated their profile information', NULL, '2025-11-20 16:08:32', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-20 18:08:32\"}', '21', 'USER', NULL, 'success', 'java-backend', NULL),
(169, 1, 'User Crafty Dev has updated their profile information', NULL, '2025-11-29 05:55:04', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 07:55:04\"}', '1', 'USER', NULL, 'success', 'java-backend', NULL),
(170, 2, 'User Garrison Sayor has updated their profile information', NULL, '2025-11-29 05:55:28', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 07:55:28\"}', '2', 'USER', NULL, 'success', 'java-backend', NULL),
(171, 3, 'User Christopher Leabon has updated their profile information', NULL, '2025-11-29 05:57:42', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 07:57:42\"}', '3', 'USER', NULL, 'success', 'java-backend', NULL),
(172, 4, 'User George Kona has updated their profile information', NULL, '2025-11-29 05:57:53', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 07:57:53\"}', '4', 'USER', NULL, 'success', 'java-backend', NULL),
(173, 5, 'User Thomas Sneh has updated their profile information', NULL, '2025-11-29 05:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 07:58:03\"}', '5', 'USER', NULL, 'success', 'java-backend', NULL),
(174, 6, 'User Jennifer Davis has updated their profile information', NULL, '2025-11-29 05:58:09', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 07:58:09\"}', '6', 'USER', NULL, 'success', 'java-backend', NULL),
(175, 7, 'User Robert Wilson has updated their profile information', NULL, '2025-11-29 05:58:14', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 07:58:14\"}', '7', 'USER', NULL, 'success', 'java-backend', NULL),
(176, 8, 'User Amanda Brown has updated their profile information', NULL, '2025-11-29 05:58:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 07:58:19\"}', '8', 'USER', NULL, 'success', 'java-backend', NULL),
(177, 9, 'User John Doe has updated their profile information', NULL, '2025-11-29 05:58:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 07:58:24\"}', '9', 'USER', NULL, 'success', 'java-backend', NULL),
(178, 10, 'User Jane Smith has updated their profile information', NULL, '2025-11-29 05:58:30', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 07:58:30\"}', '10', 'USER', NULL, 'success', 'java-backend', NULL),
(179, 11, 'User Mark Jones has updated their profile information', NULL, '2025-11-29 05:58:36', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 07:58:36\"}', '11', 'USER', NULL, 'success', 'java-backend', NULL),
(180, 12, 'User Emily White has updated their profile information', NULL, '2025-11-29 05:58:41', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 07:58:41\"}', '12', 'USER', NULL, 'success', 'java-backend', NULL),
(181, 13, 'User Alex Green has updated their profile information', NULL, '2025-11-29 05:58:46', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 07:58:46\"}', '13', 'USER', NULL, 'success', 'java-backend', NULL),
(182, 14, 'User Maria Garcia has updated their profile information', NULL, '2025-11-29 05:58:51', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 07:58:51\"}', '14', 'USER', NULL, 'success', 'java-backend', NULL),
(183, 15, 'User Chris Taylor has updated their profile information', NULL, '2025-11-29 05:59:07', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 07:59:07\"}', '15', 'USER', NULL, 'success', 'java-backend', NULL),
(184, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-11-29 05:59:12', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 07:59:12\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(185, 20, 'User Issa Adams has updated their profile information', NULL, '2025-11-29 05:59:18', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 07:59:18\"}', '20', 'USER', NULL, 'success', 'java-backend', NULL),
(186, 2, 'User Garrison Sayor has updated their profile information', NULL, '2025-11-29 06:09:09', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 08:09:09\"}', '2', 'USER', NULL, 'success', 'java-backend', NULL),
(187, 1, 'User Crafty Dev has updated their profile information', NULL, '2025-11-29 06:10:18', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-29 08:10:18\"}', '1', 'USER', NULL, 'success', 'java-backend', NULL),
(188, 1, 'User Crafty Dev has updated their profile information', NULL, '2025-11-30 12:04:32', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-30 14:04:32\"}', '1', 'USER', NULL, 'success', 'java-backend', NULL),
(189, 1, 'User Crafty Dev has updated their profile information', NULL, '2025-11-30 12:04:58', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-30 14:04:58\"}', '1', 'USER', NULL, 'success', 'java-backend', NULL),
(190, 1, 'User Crafty Dev has updated their profile information', NULL, '2025-11-30 12:05:05', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-30 14:05:05\"}', '1', 'USER', NULL, 'success', 'java-backend', NULL),
(191, 1, 'User Crafty Dev has updated their profile information', NULL, '2025-11-30 12:07:56', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-30 14:07:56\"}', '1', 'USER', NULL, 'success', 'java-backend', NULL),
(192, 1, 'User Crafty Dev has updated their profile information', NULL, '2025-11-30 12:13:01', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-30 14:13:01\"}', '1', 'USER', NULL, 'success', 'java-backend', NULL),
(193, 1, 'User Crafty Dev has updated their profile information', NULL, '2025-11-30 12:13:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-30 14:13:24\"}', '1', 'USER', NULL, 'success', 'java-backend', NULL),
(194, 1, 'User Crafty Dev has updated their profile information', NULL, '2025-11-30 12:15:06', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-11-30 14:15:06\"}', '1', 'USER', NULL, 'success', 'java-backend', NULL),
(195, 1, 'User Crafty Dev has updated their profile information', NULL, '2025-12-01 07:42:28', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-01 09:42:28\"}', '1', 'USER', NULL, 'success', 'java-backend', NULL),
(196, 1, 'User Crafty Dev has updated their profile information', NULL, '2025-12-01 13:59:39', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-01 15:59:39\"}', '1', 'USER', NULL, 'success', 'java-backend', NULL);
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `ip_address`, `timestamp`, `details`, `entity_id`, `entity_type`, `request_id`, `result`, `service_name`, `session_id`) VALUES
(197, 1, 'User Crafty Dev has updated their profile information', NULL, '2025-12-01 14:21:18', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-01 16:21:18\"}', '1', 'USER', NULL, 'success', 'java-backend', NULL),
(198, 1, 'User Crafty Dev has updated their profile information', NULL, '2025-12-01 20:27:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-01 22:27:19\"}', '1', 'USER', NULL, 'success', 'java-backend', NULL),
(199, 1, 'User Crafty Dev has updated their profile information', NULL, '2025-12-01 20:40:41', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-01 22:40:41\"}', '1', 'USER', NULL, 'success', 'java-backend', NULL),
(200, 1, 'User Crafty Dev has updated their profile information', NULL, '2025-12-01 21:18:23', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-01 23:18:23\"}', '1', 'USER', NULL, 'success', 'java-backend', NULL),
(201, 1, 'User Crafty Dev has updated their profile information', NULL, '2025-12-02 11:35:52', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-02 13:35:52\"}', '1', 'USER', NULL, 'success', 'java-backend', NULL),
(202, 1, 'User Crafty Dev has updated their profile information', NULL, '2025-12-05 05:41:49', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-05 07:41:49\"}', '1', 'USER', NULL, 'success', 'java-backend', NULL),
(203, 1, 'User Crafty Dev has updated their profile information', NULL, '2025-12-05 06:19:06', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-05 08:19:06\"}', '1', 'USER', NULL, 'success', 'java-backend', NULL),
(204, 1, 'User Crafty Dev has updated their profile information', NULL, '2025-12-05 08:25:21', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-05 10:25:21\"}', '1', 'USER', NULL, 'success', 'java-backend', NULL),
(205, 1, 'User Crafty Dev has updated their profile information', NULL, '2025-12-07 17:51:44', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-07 19:51:44\"}', '1', 'USER', NULL, 'success', 'java-backend', NULL),
(206, 1, 'User Crafty Dev has updated their profile information', NULL, '2025-12-09 16:47:45', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-09 18:47:45\"}', '1', 'USER', NULL, 'success', 'java-backend', NULL),
(207, 1, 'User Crafty Dev has updated their profile information', NULL, '2025-12-09 16:53:51', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-09 18:53:51\"}', '1', 'USER', NULL, 'success', 'java-backend', NULL),
(208, 1, 'User Crafty Dev has updated their profile information', NULL, '2025-12-10 17:21:52', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-10 19:21:52\"}', '1', 'USER', NULL, 'success', 'java-backend', NULL),
(209, 2, 'User Garrison Sayor has updated their profile information', NULL, '2025-12-10 19:33:17', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-10 21:33:17\"}', '2', 'USER', NULL, 'success', 'java-backend', NULL),
(210, 1, 'User Crafty Dev has updated their profile information', NULL, '2025-12-18 09:29:13', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 11:29:13\"}', '1', 'USER', NULL, 'success', 'java-backend', NULL),
(211, 1, 'User Crafty Dev has updated their profile information', NULL, '2025-12-18 11:06:47', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 13:06:47\"}', '1', 'USER', NULL, 'success', 'java-backend', NULL),
(212, 1, 'User Crafty Dev has updated their profile information', NULL, '2025-12-18 11:27:00', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 13:27:00\"}', '1', 'USER', NULL, 'success', 'java-backend', NULL),
(213, 1, 'User Crafty Dev has updated their profile information', NULL, '2025-12-18 11:29:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 13:29:26\"}', '1', 'USER', NULL, 'success', 'java-backend', NULL),
(214, 1, 'User Crafty Dev has updated their profile information', NULL, '2025-12-18 11:39:01', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 13:39:01\"}', '1', 'USER', NULL, 'success', 'java-backend', NULL),
(215, 1, 'User Crafty Dev has updated their profile information', NULL, '2025-12-18 11:53:48', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 13:53:48\"}', '1', 'USER', NULL, 'success', 'java-backend', NULL),
(216, 1, 'User Crafty Dev has updated their profile information', NULL, '2025-12-18 12:14:52', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 14:14:52\"}', '1', 'USER', NULL, 'success', 'java-backend', NULL),
(217, 1, 'User Crafty Dev has updated their profile information', NULL, '2025-12-18 12:55:01', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 14:55:01\"}', '1', 'USER', NULL, 'success', 'java-backend', NULL),
(218, 1, 'User Crafty Dev has updated their profile information', NULL, '2025-12-18 14:48:21', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 16:48:21\"}', '1', 'USER', NULL, 'success', 'java-backend', NULL),
(219, 1, 'User Crafty Dev has updated their profile information', NULL, '2025-12-18 15:24:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 17:24:24\"}', '1', 'USER', NULL, 'success', 'java-backend', NULL),
(220, 1, 'User Crafty Dev has updated their profile information', NULL, '2025-12-18 15:27:33', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 17:27:33\"}', '1', 'USER', NULL, 'success', 'java-backend', NULL),
(221, 19, 'User Crafty Dev has updated their profile information', NULL, '2025-12-18 15:43:46', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 17:43:46\"}', '19', 'USER', NULL, 'success', 'java-backend', NULL),
(222, 2, 'User Garrison Sayor has updated their profile information', NULL, '2025-12-18 15:59:01', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 17:59:01\"}', '2', 'USER', NULL, 'success', 'java-backend', NULL),
(223, 2, 'User Garrison Sayor has updated their profile information', NULL, '2025-12-18 16:00:48', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 18:00:48\"}', '2', 'USER', NULL, 'success', 'java-backend', NULL),
(224, 2, 'User Garrison Sayor has updated their profile information', NULL, '2025-12-18 16:03:12', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 18:03:12\"}', '2', 'USER', NULL, 'success', 'java-backend', NULL),
(225, 3, 'User Christopher Leabon has updated their profile information', NULL, '2025-12-18 16:57:39', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 18:57:39\"}', '3', 'USER', NULL, 'success', 'java-backend', NULL),
(226, 2, 'User Garrison Sayor has updated their profile information', NULL, '2025-12-18 16:58:52', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 18:58:52\"}', '2', 'USER', NULL, 'success', 'java-backend', NULL),
(227, 1, 'User Crafty Dev has updated their profile information', NULL, '2025-12-18 17:20:32', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 19:20:32\"}', '1', 'USER', NULL, 'success', 'java-backend', NULL),
(228, 1, 'User Crafty Dev has updated their profile information', NULL, '2025-12-18 17:21:32', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 19:21:32\"}', '1', 'USER', NULL, 'success', 'java-backend', NULL),
(229, 2, 'User Garrison Sayor has updated their profile information', NULL, '2025-12-18 17:23:34', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-18 19:23:34\"}', '2', 'USER', NULL, 'success', 'java-backend', NULL),
(230, 1, 'User Crafty Dev has updated their profile information', NULL, '2025-12-29 11:22:20', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-29 13:22:20\"}', '1', 'USER', NULL, 'success', 'java-backend', NULL),
(231, 3, 'User Christopher Leabon has updated their profile information', NULL, '2025-12-29 11:59:25', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-29 13:59:25\"}', '3', 'USER', NULL, 'success', 'java-backend', NULL),
(232, 1, 'User Crafty Dev has updated their profile information', NULL, '2025-12-29 12:18:35', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-29 14:18:35\"}', '1', 'USER', NULL, 'success', 'java-backend', NULL),
(233, 2, 'User Garrison Sayor has updated their profile information', NULL, '2025-12-29 12:25:22', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-29 14:25:22\"}', '2', 'USER', NULL, 'success', 'java-backend', NULL),
(234, 1, 'User Crafty Dev has updated their profile information', NULL, '2025-12-29 12:42:27', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-29 14:42:27\"}', '1', 'USER', NULL, 'success', 'java-backend', NULL),
(235, 1, 'User Crafty Dev has updated their profile information', NULL, '2025-12-29 13:06:50', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-29 15:06:50\"}', '1', 'USER', NULL, 'success', 'java-backend', NULL),
(236, 1, 'User Crafty Dev has updated their profile information', NULL, '2025-12-29 13:13:05', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-29 15:13:05\"}', '1', 'USER', NULL, 'success', 'java-backend', NULL),
(237, 1, 'User Crafty Dev has updated their profile information', NULL, '2025-12-29 13:47:49', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-29 15:47:49\"}', '1', 'USER', NULL, 'success', 'java-backend', NULL),
(238, 2, 'User Garrison Sayor has updated their profile information', NULL, '2025-12-29 13:50:41', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2025-12-29 15:50:41\"}', '2', 'USER', NULL, 'success', 'java-backend', NULL),
(239, 1, 'User Crafty Dev has updated their profile information', NULL, '2026-01-08 03:49:20', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-08 05:49:20\"}', '1', 'USER', NULL, 'success', 'java-backend', NULL),
(240, 1, 'User Crafty Dev has updated their profile information', NULL, '2026-01-11 13:15:47', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-11 15:15:47\"}', '1', 'USER', NULL, 'success', 'java-backend', NULL),
(241, 23, 'User Crayton Kamara has updated their profile information', NULL, '2026-01-11 19:06:01', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-11 21:06:01\"}', '23', 'USER', NULL, 'success', 'java-backend', NULL),
(242, 23, 'User Crayton Kamara has updated their profile information', NULL, '2026-01-11 19:14:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-11 21:14:26\"}', '23', 'USER', NULL, 'success', 'java-backend', NULL),
(243, 23, 'User Crayton Kamara has updated their profile information', NULL, '2026-01-11 19:28:05', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-11 21:28:05\"}', '23', 'USER', NULL, 'success', 'java-backend', NULL),
(244, 23, 'User Crayton Kamara has updated their profile information', NULL, '2026-01-11 19:53:15', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-11 21:53:15\"}', '23', 'USER', NULL, 'success', 'java-backend', NULL),
(245, 23, 'User Crayton Kamara has updated their profile information', NULL, '2026-01-11 20:29:13', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-11 22:29:13\"}', '23', 'USER', NULL, 'success', 'java-backend', NULL),
(246, 23, 'User Crayton Kamara has updated their profile information', NULL, '2026-01-11 20:38:38', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-11 22:38:38\"}', '23', 'USER', NULL, 'success', 'java-backend', NULL),
(247, 23, 'User Crayton Kamara has updated their profile information', NULL, '2026-01-11 20:49:17', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-11 22:49:17\"}', '23', 'USER', NULL, 'success', 'java-backend', NULL),
(248, 1, 'User Crafty Dev has updated their profile information', NULL, '2026-01-11 22:13:32', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-12 00:13:32\"}', '1', 'USER', NULL, 'success', 'java-backend', NULL),
(249, 1, 'User Crafty Dev has updated their profile information', NULL, '2026-01-13 00:51:06', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-13 02:51:06\"}', '1', 'USER', NULL, 'success', 'java-backend', NULL),
(250, 1, 'User Crafty Dev has updated their profile information', NULL, '2026-01-13 13:42:17', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-13 15:42:17\"}', '1', 'USER', NULL, 'success', 'java-backend', NULL),
(251, 1, 'User Crafty Dev has updated their profile information', NULL, '2026-01-13 19:58:44', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-13 21:58:44\"}', '1', 'USER', NULL, 'success', NULL, NULL),
(252, 1, 'User Crafty Dev has updated their profile information', NULL, '2026-01-13 19:59:39', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-13 21:59:39\"}', '1', 'USER', NULL, 'success', NULL, NULL),
(253, 1, 'User Crafty Dev has updated their profile information', NULL, '2026-01-13 20:00:06', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-13 22:00:06\"}', '1', 'USER', NULL, 'success', NULL, NULL),
(254, 1, 'User Crafty Dev has updated their profile information', NULL, '2026-01-13 20:04:10', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-13 22:04:10\"}', '1', 'USER', NULL, 'success', NULL, NULL),
(255, 1, 'User Crafty Dev has updated their profile information', NULL, '2026-01-13 20:04:41', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-13 22:04:41\"}', '1', 'USER', NULL, 'success', NULL, NULL),
(256, 1, 'User Crafty Dev has updated their profile information', NULL, '2026-01-13 20:10:55', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-13 22:10:55\"}', '1', 'USER', NULL, 'success', NULL, NULL),
(257, 1, 'User Crafty Dev has updated their profile information', NULL, '2026-01-13 20:12:45', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-13 22:12:45\"}', '1', 'USER', NULL, 'success', NULL, NULL),
(258, 1, 'EMPLOYEE_UPDATED', NULL, '2026-01-13 20:12:45', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-13 22:12:45\"}', NULL, NULL, NULL, 'success', 'java-backend', NULL),
(259, 1, 'User Crafty Dev has updated their profile information', NULL, '2026-01-13 20:12:53', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-13 22:12:53\"}', '1', 'USER', NULL, 'success', NULL, NULL),
(260, 1, 'EMPLOYEE_UPDATED', NULL, '2026-01-13 20:12:53', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-13 22:12:53\"}', NULL, NULL, NULL, 'success', 'java-backend', NULL),
(261, 1, 'User Crafty Dev has updated their profile information', NULL, '2026-01-16 15:05:02', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-16 17:05:02\"}', '1', 'USER', NULL, 'success', NULL, NULL),
(262, 1, 'User Crafty Dev has updated their profile information', NULL, '2026-01-16 15:09:08', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-16 17:09:08\"}', '1', 'USER', NULL, 'success', NULL, NULL),
(263, 1, 'User Crafty Dev has updated their profile information', NULL, '2026-01-16 15:12:27', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-16 17:12:27\"}', '1', 'USER', NULL, 'success', NULL, NULL),
(264, 1, 'User Crafty Dev has updated their profile information', NULL, '2026-01-16 15:20:39', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-16 17:20:39\"}', '1', 'USER', NULL, 'success', NULL, NULL),
(265, 1, 'User Crafty Dev has updated their profile information', NULL, '2026-01-16 15:27:21', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-16 17:27:21\"}', '1', 'USER', NULL, 'success', NULL, NULL),
(266, 1, 'User Crafty Dev has updated their profile information', NULL, '2026-01-16 15:29:02', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-16 17:29:02\"}', '1', 'USER', NULL, 'success', NULL, NULL),
(267, 1, 'User Crafty Dev has updated their profile information', NULL, '2026-01-16 15:29:16', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-16 17:29:16\"}', '1', 'USER', NULL, 'success', NULL, NULL),
(268, 1, 'User Crafty Dev has updated their profile information', NULL, '2026-01-16 15:29:32', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-16 17:29:32\"}', '1', 'USER', NULL, 'success', NULL, NULL),
(269, 1, 'User Crafty Dev has updated their profile information', NULL, '2026-01-16 15:30:04', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-16 17:30:04\"}', '1', 'USER', NULL, 'success', NULL, NULL),
(270, 1, 'Employee Updated Their Profile Info', NULL, '2026-01-16 15:30:04', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-16 17:30:04\"}', NULL, NULL, NULL, 'success', 'java-backend', NULL),
(271, 1, 'User Crafty Dev has updated their profile information', NULL, '2026-01-16 15:30:40', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-16 17:30:40\"}', '1', 'USER', NULL, 'success', NULL, NULL),
(272, 1, 'User Crafty Dev has updated their profile information', NULL, '2026-01-17 18:44:00', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-17 20:44:00\"}', '1', 'USER', NULL, 'success', NULL, NULL),
(273, 1, 'User Crafty Dev has updated their profile information', NULL, '2026-01-17 18:44:43', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-17 20:44:43\"}', '1', 'USER', NULL, 'success', NULL, NULL),
(274, 1, 'User Crafty Dev has updated their profile information', NULL, '2026-01-17 18:56:48', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-17 20:56:48\"}', '1', 'USER', NULL, 'success', NULL, NULL),
(275, 1, 'User Crafty Dev has updated their profile information', NULL, '2026-01-17 19:01:17', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-17 21:01:17\"}', '1', 'USER', NULL, 'success', NULL, NULL),
(276, NULL, 'UPDATE_BUDGET', NULL, '2026-01-18 11:06:04', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 13:06:04\"}', NULL, NULL, NULL, 'success', 'java-backend', NULL),
(277, NULL, 'UPDATE_BUDGET', NULL, '2026-01-18 11:11:43', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 13:11:43\"}', NULL, NULL, NULL, 'success', 'java-backend', NULL),
(278, NULL, 'UPDATE_BUDGET', NULL, '2026-01-18 11:18:36', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 13:18:36\"}', NULL, NULL, NULL, 'success', 'java-backend', NULL),
(279, NULL, 'UPDATE_BUDGET', NULL, '2026-01-18 11:18:49', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 13:18:49\"}', NULL, NULL, NULL, 'success', 'java-backend', NULL),
(280, NULL, 'UPDATE_BUDGET', NULL, '2026-01-18 11:19:22', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 13:19:22\"}', NULL, NULL, NULL, 'success', 'java-backend', NULL),
(281, NULL, 'UPDATE_BUDGET', NULL, '2026-01-18 11:19:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 13:19:24\"}', NULL, NULL, NULL, 'success', 'java-backend', NULL),
(282, 1, 'User Crafty Dev has updated their profile information', NULL, '2026-01-18 11:24:36', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 13:24:36\"}', '1', 'USER', NULL, 'success', NULL, NULL),
(283, 1, 'User Crafty Dev has updated their profile information', NULL, '2026-01-18 11:40:33', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 13:40:33\"}', '1', 'USER', NULL, 'success', NULL, NULL),
(284, 1, 'CREATE_BUDGET', NULL, '2026-01-18 11:55:45', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 13:55:45\"}', NULL, NULL, NULL, 'success', 'java-backend', NULL),
(285, 1, 'CREATE_BUDGET', NULL, '2026-01-18 11:55:45', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 13:55:45\"}', NULL, NULL, NULL, 'success', 'java-backend', NULL),
(286, 1, 'CREATE_BUDGET', NULL, '2026-01-18 11:55:45', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 13:55:45\"}', NULL, NULL, NULL, 'success', 'java-backend', NULL),
(287, 1, 'CREATE_BUDGET', NULL, '2026-01-18 11:55:45', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 13:55:45\"}', NULL, NULL, NULL, 'success', 'java-backend', NULL),
(288, 1, 'CREATE_BUDGET', NULL, '2026-01-18 11:56:32', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 13:56:32\"}', NULL, NULL, NULL, 'success', 'java-backend', NULL),
(289, 1, 'CREATE_BUDGET', NULL, '2026-01-18 11:56:32', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 13:56:32\"}', NULL, NULL, NULL, 'success', 'java-backend', NULL),
(290, 1, 'CREATE_BUDGET', NULL, '2026-01-18 11:56:32', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 13:56:32\"}', NULL, NULL, NULL, 'success', 'java-backend', NULL),
(291, 1, 'CREATE_BUDGET', NULL, '2026-01-18 11:56:32', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 13:56:32\"}', NULL, NULL, NULL, 'success', 'java-backend', NULL),
(292, 1, 'CREATE_BUDGET', NULL, '2026-01-18 12:21:52', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 14:21:52\"}', NULL, NULL, NULL, 'success', 'java-backend', NULL),
(293, NULL, 'UPDATE_BUDGET', NULL, '2026-01-18 12:23:37', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 14:23:37\"}', NULL, NULL, NULL, 'success', 'java-backend', NULL),
(294, NULL, 'CREATE_BUDGET_REQUEST', NULL, '2026-01-18 13:20:34', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 15:20:34\"}', NULL, NULL, NULL, 'success', 'java-backend', NULL),
(295, 1, 'CREATE_BUDGET', NULL, '2026-01-18 13:21:00', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-18 15:21:00\"}', NULL, NULL, NULL, 'success', 'java-backend', NULL),
(296, 1, 'User Crafty Dev has updated their profile information', NULL, '2026-01-19 13:42:14', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-19 15:42:14\"}', '1', 'USER', NULL, 'success', NULL, NULL),
(297, 1, 'User Crafty Dev has updated their profile information', NULL, '2026-01-19 20:46:22', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-19 22:46:22\"}', '1', 'USER', NULL, 'success', NULL, NULL),
(298, 1, 'Employee Updated Their Profile Info', NULL, '2026-01-19 20:46:22', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-19 22:46:22\"}', NULL, NULL, NULL, 'success', 'java-backend', NULL),
(299, 1, 'User Crafty Dev has updated their profile information', NULL, '2026-01-19 20:46:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-19 22:46:24\"}', '1', 'USER', NULL, 'success', NULL, NULL),
(300, 1, 'Employee Updated Their Profile Info', NULL, '2026-01-19 20:46:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-19 22:46:24\"}', NULL, NULL, NULL, 'success', 'java-backend', NULL),
(301, NULL, 'CREATE_ACCOUNT_PAYABLE', NULL, '2026-01-20 07:55:41', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 09:55:41\"}', NULL, NULL, NULL, 'success', 'java-backend', NULL),
(302, NULL, 'CREATE_ACCOUNT_RECEIVABLE', NULL, '2026-01-20 08:05:38', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 10:05:38\"}', NULL, NULL, NULL, 'success', 'java-backend', NULL),
(303, NULL, 'UPDATE_ACCOUNT_RECEIVABLE', NULL, '2026-01-20 08:11:35', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 10:11:35\"}', NULL, NULL, NULL, 'success', 'java-backend', NULL),
(304, NULL, 'UPDATE_ACCOUNT_PAYABLE', NULL, '2026-01-20 08:12:31', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 10:12:31\"}', NULL, NULL, NULL, 'success', 'java-backend', NULL),
(305, NULL, 'UPDATE_ACCOUNT_PAYABLE', NULL, '2026-01-20 08:15:05', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 10:15:05\"}', NULL, NULL, NULL, 'success', 'java-backend', NULL),
(306, 1, 'User Crafty Dev has updated their profile information', NULL, '2026-01-20 13:34:50', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:34:50\"}', '1', 'USER', NULL, 'success', NULL, NULL),
(307, 1, 'User Crafty Dev has updated their profile information', NULL, '2026-01-20 13:35:55', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:35:55\"}', '1', 'USER', NULL, 'success', NULL, NULL),
(308, 1, 'User Crafty Dev has updated their profile information', NULL, '2026-01-20 13:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', '1', 'USER', NULL, 'success', NULL, NULL),
(309, 2, 'User Garrison Sayor has updated their profile information', NULL, '2026-01-20 13:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', '2', 'USER', NULL, 'success', NULL, NULL),
(310, 3, 'User Christopher Leabon has updated their profile information', NULL, '2026-01-20 13:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', '3', 'USER', NULL, 'success', NULL, NULL),
(311, 4, 'User George Kona has updated their profile information', NULL, '2026-01-20 13:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', '4', 'USER', NULL, 'success', NULL, NULL),
(312, 5, 'User Thomas Sneh has updated their profile information', NULL, '2026-01-20 13:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', '5', 'USER', NULL, 'success', NULL, NULL),
(313, 6, 'User Jennifer Davis has updated their profile information', NULL, '2026-01-20 13:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', '6', 'USER', NULL, 'success', NULL, NULL),
(314, 7, 'User Robert Wilson has updated their profile information', NULL, '2026-01-20 13:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', '7', 'USER', NULL, 'success', NULL, NULL),
(315, 8, 'User Amanda Brown has updated their profile information', NULL, '2026-01-20 13:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', '8', 'USER', NULL, 'success', NULL, NULL),
(316, 9, 'User John Doe has updated their profile information', NULL, '2026-01-20 13:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', '9', 'USER', NULL, 'success', NULL, NULL),
(317, 10, 'User Jane Smith has updated their profile information', NULL, '2026-01-20 13:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', '10', 'USER', NULL, 'success', NULL, NULL),
(318, 11, 'User Mark Jones has updated their profile information', NULL, '2026-01-20 13:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', '11', 'USER', NULL, 'success', NULL, NULL),
(319, 12, 'User Emily White has updated their profile information', NULL, '2026-01-20 13:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', '12', 'USER', NULL, 'success', NULL, NULL),
(320, 13, 'User Alex Green has updated their profile information', NULL, '2026-01-20 13:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', '13', 'USER', NULL, 'success', NULL, NULL),
(321, 14, 'User Maria Garcia has updated their profile information', NULL, '2026-01-20 13:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', '14', 'USER', NULL, 'success', NULL, NULL),
(322, 15, 'User Chris Taylor has updated their profile information', NULL, '2026-01-20 13:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', '15', 'USER', NULL, 'success', NULL, NULL),
(323, 19, 'User Crafty Dev has updated their profile information', NULL, '2026-01-20 13:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', '19', 'USER', NULL, 'success', NULL, NULL),
(324, 20, 'User Issa Adams has updated their profile information', NULL, '2026-01-20 13:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', '20', 'USER', NULL, 'success', NULL, NULL),
(325, 21, 'User Albertine Wilson has updated their profile information', NULL, '2026-01-20 13:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', '21', 'USER', NULL, 'success', NULL, NULL),
(326, 23, 'User Crayton Kamara has updated their profile information', NULL, '2026-01-20 13:50:19', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:50:19\"}', '23', 'USER', NULL, 'success', NULL, NULL),
(327, 1, 'User Crafty Dev has updated their profile information', NULL, '2026-01-20 13:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', '1', 'USER', NULL, 'success', NULL, NULL),
(328, 2, 'User Garrison Sayor has updated their profile information', NULL, '2026-01-20 13:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', '2', 'USER', NULL, 'success', NULL, NULL),
(329, 3, 'User Christopher Leabon has updated their profile information', NULL, '2026-01-20 13:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', '3', 'USER', NULL, 'success', NULL, NULL),
(330, 4, 'User George Kona has updated their profile information', NULL, '2026-01-20 13:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', '4', 'USER', NULL, 'success', NULL, NULL),
(331, 5, 'User Thomas Sneh has updated their profile information', NULL, '2026-01-20 13:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', '5', 'USER', NULL, 'success', NULL, NULL),
(332, 6, 'User Jennifer Davis has updated their profile information', NULL, '2026-01-20 13:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', '6', 'USER', NULL, 'success', NULL, NULL),
(333, 7, 'User Robert Wilson has updated their profile information', NULL, '2026-01-20 13:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', '7', 'USER', NULL, 'success', NULL, NULL),
(334, 8, 'User Amanda Brown has updated their profile information', NULL, '2026-01-20 13:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', '8', 'USER', NULL, 'success', NULL, NULL),
(335, 9, 'User John Doe has updated their profile information', NULL, '2026-01-20 13:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', '9', 'USER', NULL, 'success', NULL, NULL),
(336, 10, 'User Jane Smith has updated their profile information', NULL, '2026-01-20 13:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', '10', 'USER', NULL, 'success', NULL, NULL),
(337, 11, 'User Mark Jones has updated their profile information', NULL, '2026-01-20 13:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', '11', 'USER', NULL, 'success', NULL, NULL),
(338, 12, 'User Emily White has updated their profile information', NULL, '2026-01-20 13:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', '12', 'USER', NULL, 'success', NULL, NULL),
(339, 13, 'User Alex Green has updated their profile information', NULL, '2026-01-20 13:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', '13', 'USER', NULL, 'success', NULL, NULL),
(340, 14, 'User Maria Garcia has updated their profile information', NULL, '2026-01-20 13:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', '14', 'USER', NULL, 'success', NULL, NULL),
(341, 15, 'User Chris Taylor has updated their profile information', NULL, '2026-01-20 13:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', '15', 'USER', NULL, 'success', NULL, NULL),
(342, 19, 'User Crafty Dev has updated their profile information', NULL, '2026-01-20 13:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', '19', 'USER', NULL, 'success', NULL, NULL),
(343, 20, 'User Issa Adams has updated their profile information', NULL, '2026-01-20 13:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', '20', 'USER', NULL, 'success', NULL, NULL),
(344, 21, 'User Albertine Wilson has updated their profile information', NULL, '2026-01-20 13:53:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:53:24\"}', '21', 'USER', NULL, 'success', NULL, NULL),
(345, 1, 'User Crafty Dev has updated their profile information', NULL, '2026-01-20 13:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', '1', 'USER', NULL, 'success', NULL, NULL),
(346, 2, 'User Garrison Sayor has updated their profile information', NULL, '2026-01-20 13:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', '2', 'USER', NULL, 'success', NULL, NULL),
(347, 3, 'User Christopher Leabon has updated their profile information', NULL, '2026-01-20 13:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', '3', 'USER', NULL, 'success', NULL, NULL),
(348, 4, 'User George Kona has updated their profile information', NULL, '2026-01-20 13:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', '4', 'USER', NULL, 'success', NULL, NULL),
(349, 5, 'User Thomas Sneh has updated their profile information', NULL, '2026-01-20 13:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', '5', 'USER', NULL, 'success', NULL, NULL),
(350, 6, 'User Jennifer Davis has updated their profile information', NULL, '2026-01-20 13:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', '6', 'USER', NULL, 'success', NULL, NULL),
(351, 7, 'User Robert Wilson has updated their profile information', NULL, '2026-01-20 13:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', '7', 'USER', NULL, 'success', NULL, NULL),
(352, 8, 'User Amanda Brown has updated their profile information', NULL, '2026-01-20 13:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', '8', 'USER', NULL, 'success', NULL, NULL),
(353, 9, 'User John Doe has updated their profile information', NULL, '2026-01-20 13:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', '9', 'USER', NULL, 'success', NULL, NULL),
(354, 10, 'User Jane Smith has updated their profile information', NULL, '2026-01-20 13:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', '10', 'USER', NULL, 'success', NULL, NULL),
(355, 11, 'User Mark Jones has updated their profile information', NULL, '2026-01-20 13:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', '11', 'USER', NULL, 'success', NULL, NULL),
(356, 12, 'User Emily White has updated their profile information', NULL, '2026-01-20 13:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', '12', 'USER', NULL, 'success', NULL, NULL),
(357, 13, 'User Alex Green has updated their profile information', NULL, '2026-01-20 13:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', '13', 'USER', NULL, 'success', NULL, NULL),
(358, 14, 'User Maria Garcia has updated their profile information', NULL, '2026-01-20 13:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', '14', 'USER', NULL, 'success', NULL, NULL),
(359, 15, 'User Chris Taylor has updated their profile information', NULL, '2026-01-20 13:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', '15', 'USER', NULL, 'success', NULL, NULL),
(360, 19, 'User Crafty Dev has updated their profile information', NULL, '2026-01-20 13:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', '19', 'USER', NULL, 'success', NULL, NULL),
(361, 20, 'User Issa Adams has updated their profile information', NULL, '2026-01-20 13:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', '20', 'USER', NULL, 'success', NULL, NULL),
(362, 21, 'User Albertine Wilson has updated their profile information', NULL, '2026-01-20 13:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', '21', 'USER', NULL, 'success', NULL, NULL),
(363, 23, 'User Crayton Kamara has updated their profile information', NULL, '2026-01-20 13:58:03', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:03\"}', '23', 'USER', NULL, 'success', NULL, NULL),
(364, 1, 'User Crafty Dev has updated their profile information', NULL, '2026-01-20 13:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', '1', 'USER', NULL, 'success', NULL, NULL),
(365, 2, 'User Garrison Sayor has updated their profile information', NULL, '2026-01-20 13:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', '2', 'USER', NULL, 'success', NULL, NULL),
(366, 3, 'User Christopher Leabon has updated their profile information', NULL, '2026-01-20 13:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', '3', 'USER', NULL, 'success', NULL, NULL),
(367, 4, 'User George Kona has updated their profile information', NULL, '2026-01-20 13:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', '4', 'USER', NULL, 'success', NULL, NULL),
(368, 5, 'User Thomas Sneh has updated their profile information', NULL, '2026-01-20 13:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', '5', 'USER', NULL, 'success', NULL, NULL),
(369, 6, 'User Jennifer Davis has updated their profile information', NULL, '2026-01-20 13:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', '6', 'USER', NULL, 'success', NULL, NULL),
(370, 7, 'User Robert Wilson has updated their profile information', NULL, '2026-01-20 13:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', '7', 'USER', NULL, 'success', NULL, NULL),
(371, 8, 'User Amanda Brown has updated their profile information', NULL, '2026-01-20 13:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', '8', 'USER', NULL, 'success', NULL, NULL),
(372, 9, 'User John Doe has updated their profile information', NULL, '2026-01-20 13:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', '9', 'USER', NULL, 'success', NULL, NULL),
(373, 10, 'User Jane Smith has updated their profile information', NULL, '2026-01-20 13:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', '10', 'USER', NULL, 'success', NULL, NULL),
(374, 11, 'User Mark Jones has updated their profile information', NULL, '2026-01-20 13:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', '11', 'USER', NULL, 'success', NULL, NULL),
(375, 12, 'User Emily White has updated their profile information', NULL, '2026-01-20 13:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', '12', 'USER', NULL, 'success', NULL, NULL),
(376, 13, 'User Alex Green has updated their profile information', NULL, '2026-01-20 13:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', '13', 'USER', NULL, 'success', NULL, NULL),
(377, 14, 'User Maria Garcia has updated their profile information', NULL, '2026-01-20 13:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', '14', 'USER', NULL, 'success', NULL, NULL),
(378, 15, 'User Chris Taylor has updated their profile information', NULL, '2026-01-20 13:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', '15', 'USER', NULL, 'success', NULL, NULL),
(379, 19, 'User Crafty Dev has updated their profile information', NULL, '2026-01-20 13:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', '19', 'USER', NULL, 'success', NULL, NULL),
(380, 20, 'User Issa Adams has updated their profile information', NULL, '2026-01-20 13:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', '20', 'USER', NULL, 'success', NULL, NULL),
(381, 21, 'User Albertine Wilson has updated their profile information', NULL, '2026-01-20 13:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', '21', 'USER', NULL, 'success', NULL, NULL),
(382, 23, 'User Crayton Kamara has updated their profile information', NULL, '2026-01-20 13:58:26', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:58:26\"}', '23', 'USER', NULL, 'success', NULL, NULL),
(383, 1, 'User Crafty Dev has updated their profile information', NULL, '2026-01-20 13:59:40', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 15:59:40\"}', '1', 'USER', NULL, 'success', NULL, NULL),
(384, NULL, 'CREATE_ACCOUNT_PAYABLE', NULL, '2026-01-20 14:02:24', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 16:02:24\"}', NULL, NULL, NULL, 'success', 'java-backend', NULL),
(385, NULL, 'UPDATE_ACCOUNT_PAYABLE', NULL, '2026-01-20 14:02:40', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 16:02:40\"}', NULL, NULL, NULL, 'success', 'java-backend', NULL),
(386, NULL, 'UPDATE_ACCOUNT_PAYABLE', NULL, '2026-01-20 14:10:25', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 16:10:25\"}', NULL, NULL, NULL, 'success', 'java-backend', NULL),
(387, NULL, 'UPDATE_ACCOUNT_PAYABLE', NULL, '2026-01-20 14:12:50', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 16:12:50\"}', NULL, NULL, NULL, 'success', 'java-backend', NULL),
(388, NULL, 'UPDATE_ACCOUNT_PAYABLE', NULL, '2026-01-20 14:15:42', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 16:15:42\"}', NULL, NULL, NULL, 'success', 'java-backend', NULL),
(389, NULL, 'UPDATE_ACCOUNT_PAYABLE', NULL, '2026-01-20 14:20:43', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 16:20:43\"}', NULL, NULL, NULL, 'success', 'java-backend', NULL),
(390, NULL, 'UPDATE_ACCOUNT_PAYABLE', NULL, '2026-01-20 14:21:28', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 16:21:28\"}', NULL, NULL, NULL, 'success', 'java-backend', NULL),
(391, NULL, 'CREATE_ACCOUNT_PAYABLE', NULL, '2026-01-20 14:34:44', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 16:34:44\"}', NULL, NULL, NULL, 'success', 'java-backend', NULL),
(392, NULL, 'UPDATE_ACCOUNT_PAYABLE', NULL, '2026-01-20 14:36:52', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 16:36:52\"}', NULL, NULL, NULL, 'success', 'java-backend', NULL),
(393, NULL, 'UPDATE_ACCOUNT_PAYABLE', NULL, '2026-01-20 14:43:54', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-20 16:43:54\"}', NULL, NULL, NULL, 'success', 'java-backend', NULL),
(394, 1, 'User Crafty Dev has updated their profile information', NULL, '2026-01-22 09:28:56', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-22 11:28:56\"}', '1', 'USER', NULL, 'success', NULL, NULL),
(395, 1, 'User Crafty Dev has updated their profile information', NULL, '2026-01-22 10:04:27', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-22 12:04:27\"}', '1', 'USER', NULL, 'success', NULL, NULL),
(396, 23, 'User Crayton Kamara has updated their profile information', NULL, '2026-01-22 18:44:30', '{\"module\": \"user_management\", \"operation\": \"UPDATE\", \"timestamp\": \"2026-01-22 20:44:30\"}', '23', 'USER', NULL, 'success', NULL, NULL);

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
-- Table structure for table `biometric_access_logs`
--

CREATE TABLE `biometric_access_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `visitor_id` int(11) DEFAULT NULL,
  `biometric_type` enum('face','fingerprint','card') NOT NULL,
  `access_type` enum('enrollment','verification','identification') NOT NULL,
  `success` tinyint(1) NOT NULL,
  `confidence_score` decimal(5,2) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `additional_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`additional_data`)),
  `access_time` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `biometric_access_logs`
--

INSERT INTO `biometric_access_logs` (`id`, `user_id`, `visitor_id`, `biometric_type`, `access_type`, `success`, `confidence_score`, `location`, `ip_address`, `user_agent`, `additional_data`, `access_time`) VALUES
(1, NULL, NULL, 'face', 'identification', 0, NULL, NULL, NULL, NULL, '{\"reason\": \"No match found\"}', '2025-09-10 21:12:12'),
(2, NULL, NULL, 'face', 'identification', 0, NULL, NULL, NULL, NULL, '{\"reason\": \"No match found\"}', '2025-09-10 21:18:39'),
(3, NULL, NULL, 'face', 'identification', 0, NULL, NULL, NULL, NULL, '{\"reason\": \"No match found\"}', '2025-09-10 21:40:03');

-- --------------------------------------------------------

--
-- Table structure for table `biometric_templates`
--

CREATE TABLE `biometric_templates` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `visitor_id` int(11) DEFAULT NULL,
  `biometric_type` enum('face','fingerprint','card') NOT NULL,
  `template_data` longblob NOT NULL,
  `template_hash` varchar(255) NOT NULL,
  `quality_score` decimal(5,2) DEFAULT NULL,
  `enrollment_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `biometric_templates`
--

INSERT INTO `biometric_templates` (`id`, `user_id`, `visitor_id`, `biometric_type`, `template_data`, `template_hash`, `quality_score`, `enrollment_date`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 21, NULL, 'face', 0x2f396a2f34414151536b5a4a5267414241514141415141424141442f3467485953554e445831425354305a4a544555414151454141414849414141414141517741414274626e5279556b64434946685a576941483441414241414541414141414141426859334e77414141414141414141414141414141414141414141414141414141414141414141414141415141413974594141514141414144544c5141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141416c6b5a584e6a41414141384141414143527957466c6141414142464141414142526e57466c61414141424b4141414142526957466c614141414250414141414252336448423041414142554141414142527956464a44414141425a4141414143686e56464a44414141425a4141414143686956464a44414141425a4141414143686a63484a30414141426a414141414478746248566a4141414141414141414145414141414d5a57355655774141414167414141416341484d415567424841454a5957566f6741414141414141416236494141446a31414141446b46685a5769414141414141414142696d5141417434554141426a6157466c6149414141414141414143536741414150684141417473395957566f6741414141414141413974594141514141414144544c584268636d45414141414141415141414141435a6d594141504b6e4141414e5751414145394141414170624141414141414141414142746248566a4141414141414141414145414141414d5a5735565577414141434141414141634145634162774276414763416241426c414341415351427541474d414c674167414449414d4141784144622f3277424441415945425159464241594742515948427759494368414b43676b4a4368514f44777751467851594742635546685961485355664768736a48425957494377674979596e4b536f70475238744d43306f4d43556f4b536a2f327742444151634842776f4943684d4b43684d6f476859614b43676f4b43676f4b43676f4b43676f4b43676f4b43676f4b43676f4b43676f4b43676f4b43676f4b43676f4b43676f4b43676f4b43676f4b43676f4b43676f4b436a2f7741415243414867416f41444153494141684542417845422f3851414841414141515542415145414141414141414141414141414177454342415547414163492f3851415142414141515142417749464151634441675545416749444151414341784568424249784255454745794a525958454846444b426b61477849304c4246564a69637448683841676b4d2f455751314f4359354b692f38514147514541417745424151414141414141414141414141414141414543417751462f3851414968454241514542415141444151414441514542414141414141455241694544456a464242434a52453245792f396f4144414d424141495241784541507744775573415a74524e4f30786a6e43353372614d5a534d635734636d53512b57325a4b59583845354b6a794e73344a54346e554b4c53543770375532616553346971776955364b504c714251772b7969536b756a414e4b75657348504a72484557536258627264645a5132324f61704f3357634e50315367734a743353573553577562524347534b4141544e375161376f6f6e6a7342784a546e54626d306d4f733856533430305979552f7435686658524933735a5137707a58344b437a3135504b5847517068336b52314f42584e4c6d4e4c52335362615a5a4b617730376e434d46327a44354274414e576e4d733065366158376a5252476e47416b554e44624e6b35546d50414e48495353416e674c6f32554e7a7630527a4d576449597750534b51724146424f32657537536d6763414648584f2b6f77396f7362617071356a47377563424b4a4c46476b77484e44684f64486962472f4c61556e58612b3948354839705564725157414e70527452412b575a725978643452594d31503654704a4e5578306a614563664a4b6b79473843384c5176304566544f697777742f2b51693348334a7956513753346e436d6335456477774e73576d2b594f4f4553596c6f415565516744484a56542f6a4f63754c2f56684f6b667659423749626146676849306469634b73503643517462664755563859736252616130426733424f5a4a7542776a72324e654c5a4469585674326e616d7549474b77752b3862534775484b563141342f52527a63384f2b6d4f6351333454325358486b4a6b67334375416b62514658614b7a36356d6e787562756f44434b434775394b42743774775572515162635665374267736f4436744e424846326b33626838726d41413333522f476b3850633045635a5133335657696c7744666c414f3475786c4f55752f5857344e7042723133536b7532344630536d4e73504f465058724f776a5a584f74704746784250736e6b44665a4e4a78626b554c48756c5045586e517934624b497945494e33684765774e417a6152725142597756522f51396732783535534e64764f6579344864686347427079564e61633834484b5275466a684e633970654b78536535687579634c68474e77495532614c794941307476756b424645464e4c747a396f4363396f4e41496e692f344562613741776e524e4a6353416e746f4557694f4f50534b566333452f5547526f326b556b6142516f35543748664b6130552f4977722b78696833464a58687a72744d6654525934546d2b7276536e39587a54474d71384a2f6b4e4c64784e464c756f456431784c67334a776e754866514a4b496f38707247432f55634a306e754f365a6d374a546e565a397a54354358594841537464736145775a4a73306c38757554592b466e39527a4d702b2f4e3167704a534d65794558674f724a53754e7439696a47683441427968594479455a6f74706f49446e4e61666c587a63384b773178635a61614d4a736732754745566a326b576349472f774178784134434c575855534850426a42484955592f6a7530726d6b59424b356a53476b486c46757a452f563158776a52796e61413743454361394b63304336504b6a44346e317569746b70396c465a493177497531426b76665454534c4542523476756e4c57335872507442594154776e2b6c774a626147345563384c7241376b4241707a54734f654552707347676d67677337464a757a51466c4b673875414f516d766c7249704e645a634351666f6b65334e556b494b78323574726e4f735533435541434f7433354a574e466536754a706f647447636c4e4e4548735570446235796b4c42757370555934595a524b55454372354b592b3348415436415a6e6c536367674e41674a6a58437a684b773032796e4461572f4b7155794f4a7172776d41486930706266756e3751306335527047756456414937584e45654d6c4232746350556e4d6a446637734a555964764954684a2b616157324146776273787945344a44334d786b693031677033756e456b6b454e4e4a346445507841326936444b6162546d43754d306c49595738306c5947673564677051786d535839566f2f44656e696c6475654158444f566b3376444844626c615077394b356833446c56665174664565754a6b5a45425457392f637168667143445a6f4253657461687a7079585571796435444f45666b5a5830535366647755423733456f4c4348453063703933676c4b4442577533636e4b6533614f636c5234326330625346323132334e7036654a78654b41374a4337596363465264336f37326e7365434b504b5630786935726e636f752b78565a556347785a46414a3754536b65694f4a4c61504875756130426f70495a4b3458463472684f6c68586b6a6863776c78796c44687473726e4f41794f4535547770426277694174712b436768396e34536e315974555a30677775595458435444526b3275383041664b53616139703367684644735a47554d7638415475376f627043344643635050346a61653330743551577441626b6d303970707675456849557642435769367579474730655555534e32305556574f446d73774f55317a7937464c6934423168635874412b55615053375337756d33734e556c61515459545846746e634461446477367869303975446d2f716d4d6f485048796a623275776a44774a3254796e62334e6a7962544831615235334e78794534446d4f4c765575652f325346314e484174426b4e6e434e496665617646496a5077345556763461524134686d302f716a424c683566366b79575538424d614d354f453578616543435559647272633455416d4f64327a6163373035446b7251435261434d39514755344f4c5735504b57555a6f4c6e4d4a6a3930615a7761776a2f41436b6454576d386f55646870424e4a4132775158464a576e73645453376c44634338676b5953346165394a5335726d386b4a6c707234773455567a477459434b534d647a6e68493532342f34524b5836493457776c4d44693041415866644f614c616330454d6b6756614e50366c646630545968357430612b556e4135536767634532677244646d31786264326978746131324c4254414135317034634f78547753732f76447150736c4944384959343452647044625369334e6274494365646f4f454e704c6a59744b4162504b41653537654f567a6a62454d4e354c6b3570446a585a534167366e6371514859744d66486b55757941514f46535467536250644e4a64524b56676456726944743435534f4f59535261554767547955304773565355673138496b4d6d397a755253497958594b49744e49464a6c414e526851666675544d37735a534e34704f62594a526777397041712b55704265374741686a4c6b567470345a596e6c6a754c556977425a436a6730362b3663357872495151766d3232716f4a6a787537424d73316849586e62564a344468514241466c506a497249736c4e307750644864474745455753695149386a77773174563130485565764c56545468726e5a77564e36613759665a50437158315855443779525843687a50334e776e61686d2b5a7a3346416c3967634b61583149787445455a4b357469537a33374962584f7341634a7a325073565a536b4a4961614638464d6a642f554f4162377073596452734a7761514d436c57594433676832416c4c7472634e7370415233796e4d3233376f4f484e3951462f6f69504a464473687562746543467a326c314731466750746f2f45556a6e4e716b787a434769306a71344b6546707766654f796348324b48434778744f774572514e325161523954505951485a5376645847435531394f474468493045697879457a4f61367852355367566b384a7579785a65415577754978646f744b775777345a4e556b3341472b51676755692b6e5a395570536b635a52774535726a584270414d64656f4730724a546b48736d654a4c7a6a434558625534757475516841586537684944736d446d6d32326b736b59776b61477462674c73467152354377754f343255346d333534584d3267653648493033365544427854687a6844733736484359304f59306c4e41653532634e547738506c643671796b59386e4254486b676d724a584e6154782b615a5963545473384a31674644654b4944545a51386c314647456b75666a4151783676784a584e4f796b4e70704d59654d75716b7533593433684475354d676845664d3177446173684a574f4233636f67645147554175546734624b484b4347652f484b356a374642527a754e657754326e474f5568594e493448746c4446336b4a6a6e553669516e6c3930457978307773444b595141304a585866756d4555636f47484d62566b3253567a3438335362645a4352387847436a44683549444b4b6a50334e66626368456b4c69797746484c334f4a42464a77366c444d665a4468665479486a364a496e32326879454f52337275714b704f4453534270776e427a5332364e6c526a367375345369625941434c53716f72486741324f4567656470424b62767471357277342b796d4870344e424c484951366a7768797648484b614b35425251504b754c6747696768344c636e4b6636514f624b514a35676137766c4c3567736b4a704765456c3971544955504e59796b4d6c59345378693270486a47516c674b39337073684e76636b64774d70666f6d59735a4246457078326b5568416875436b42424f446c4d434f5a5a4659534d613775567a70434b546d484e6f4b694e6f436a796e42744737776d6c344934584631594755744c53757138556e4f484638495135796e576476776a54305a753034614c537661576977554a6749796a4d634b494974564147313266596f7253346979374b44513335546e63304453415938336675457354334876534336514239576e4e4e50515363787a6a79624b624b51374247557346556b6c4739314d4351306a526e4743692b6f415979553052755a524a744c756358326e434544447934306e7646675a776f376e504a39317a48504c367643416b46725130556e73327462666442667541354359346b56754f45686f7a79484f704d65346767585361486252615377545a7967435033476b6d4b7a7975446752786c49357839694167512b5031336e4953337342376c43594130336e4b624961766c4c5445592b7a32524837576a446c4761384e626b5a4b654333366c46423232796d3047534a724a505551634a54367951634433534935306764674a576b6a6b495a6a445341306c4741465535427a4453346c314159536d6a326f70744338464e653474493269796d5974304b374a5774424f53536b632f30426331356f556969436b6872567a6470427063584174794d6f524f336a6849553974676b684f4c69346f515071373537496c414e78646f454c5a49733153353261545153516359544775647678776e42614c734743436d75495a6b4c676261666443336d7875474544584e49625a4e72743442734c6e5046344b514e4a6477694442435847696c637756594e4642334865573870376235636d564f42762b3350756d53784e424262796e7563346e415376634e7647556a306e6f62466b5a39304a706f34345432305252796e427257746f6842776a58352b4553516967514d714c762f71625268465962497a776846706173377134536c6f636234536d374a4253416d2f556d437441414e46444f637554336b41583251533972754456495565353549706f776d466f3772764d497232393031373933484343507375464159516e4d4e4539304f53567777314f395a6f396c5568364e4531676153346f4d68703974434739344a717154626466776c5270336d3779527479456f65317739514170447373374a4e7765434b7a384a55315852486243654b50714b3764755a6b5a586244517a68524155553445306d747761536b466f776d676f39412b3232326b2f74346f706d2f484b53397a75634a6b5541673554325a764755776b6730546165344f4451576b42495963425335774a4633684e47356f743146633467354272345430734934332b5357506e3553484977453679327579576734676b5a43574e6f4176756d68324355376654624152716a445a6668464631525447477a5a77694e49374a687a75314c6a5a49706357703131776c53775862544d444b356f744931354a6f4a647a67665a4363454f34746f646b786f4e30654570446d6d7555684a4956344467787779354e6c4a44634c6e7563427475306a58554b636c50445251435833534d4855344a736a6744684f6963433459544e4f67464336775538344e6a434778312b6b704353776938704a6f68646e315a544853555147424b313975395461425432744264696b45514278795570615747786d3036523461467a486b6a636a51534f6e456b6d6b313433443035543267437a3770746b585745794e7031414534536b6258443554475362536479653539305251515a3233484b6675394646434c3857554d794f49356f4249466b63512f425857587547334a513350424949584d6347757530734258744950725337697874414a474f664a4a54525955695346357168534b71496863366954796e785366376a534b2f5447774e32564a673072576d3541437050416d4d44786262545a533567736853764c4966364f45796141794e5270496b62393939696e32513369796b446475414d70775938693831374b6c4f4c7a5176684f596179463162686b5a4361576b63476b415132426b5a5374473574455a54474f4e414645633843683353427a50536370376a6565366a75424c38473754347858346a53455963357844536151476c786362777044326b33747945774d786c4f455675476b387273466f44676c416f63335354654c6f3454774f61774132304a72672b3661453879625262516b624d4e3365796761614147386a314a41782b373454704d35534354303062514c5247756f305368616a344b3450424b5631574f555944574e4e58776c4a39737078342f776847796343676c54686a6d626e576e4d4a426f684f42734a51306b5a464a48524d437235396b30734a6b2b45506474647a6c456a63614a4b654a4a4b433174444b41576a6265334b4d397863636f54693459764346593575305971796d45376278515434704163455555796139316e68586744494a747754515a515153665369435446414c6f7943543770417059306576756d4f4a492b5538354246305578684e357130616341635862714953674670766162537663347957557233754c71646849314f776d736e4b4b30317955416d73674a577677535641484a467067424c693672436158414377634967653067556e4137484958466c437833584f4173453458423454744474744463445a533769344a47676b6e62776e624b476555704e446e764941415133754c6b38736f2f4336514372425477456a66584b65624a3551324e776e62735a52674661646f4953454f78374a704941526d3059387059444d31796c6a42467043426545724152394534447a7563445a53744a4461584670504b5555526b55697748734848756e534461526c4931746b56776e5062756342616367647664595433416b5935536c6f627a6c4930754a6f4e4b3054687059346e6c4957304b376f7232686c45706a69505a5459614f39753470592f78414a7a73464d413957464957494c53415062756d793035324d454944513677654169754950484b6162446d352f456e444453515577416c684a4b65316a646f494a4b416179334f396643635a414451796d50793672704a744863705341353072726f47676b5a49653663324a7663576b65327a6759544747477a4a6e684844527451515774504b6b426f4c41535367673550775531527979686c316c5374742f564d647058504e3842427742724e3370556d4852324475645a54346f41304476536d686a574463426b4b6256794177776867706f345477535452534d6e334f49716b72334e47657752705754537661305a484b473137726f70375868777662684b3762747363705579462b306745387152485161713256736a7655526850696d4e414570424964572f68535357474d415659555277706d354a48494c495064412f437546504a47554f534f77542b794d434155566f4a50315145474c32536c764a49734b55574d62646a4b444a573343433049454f794c42396b6c452b354b4b306a7345674c513433616f465a2b4542495855534f5572647a754f467742424a49776946596378374130676a4b54306c76796d75634361724b527a53476a736e704663327370304a424a394836706f61346a4a776a784e41464a555962494b776d625768746c46643665636f5452766563595241526f4761475632385636676e624b645153477432307169633361345731436b7736694b434f51304e4e55754c643442396b735645574d676669434b626533466749627737645659537363576e615578534d6932754a646c4f6c615774776e5076465a435a764a64585a41444c6a53566741792f39556259513347554e385a2b6151595a494a4a62796d376d7562366852546d7441775678614b70334359434c6d744273576d68774c72596e6b674441744b4743747a55514767357955787232746436736864496179526c436254696755392f4a634f457a38527969756a41614d326b6347676744756b616f634b48497049356f4c525353775738326c5a4b44673455595962774b41546d4373424a4e594f4f456b5472467041616a644a4b7a6a4a584234752b366343434f614b436348466f493454326e4765454f7a37576e4133796748467a51436d743952796e414e72314a484f47414f46576e684d416b576e52446d304b5141432b364a47384772434e492b5167664b364f527848464263533163306774776a51554f4f36696a6e4946494e43766c4c472f4b414b446d71584f61657961446e33525745574c534c53744e4d47636f6a5274494a4b486a636e2b59446b68554e4f635758614b776c7770707967456774734a305453505666436f7a704c4c71654d6f5242752b79652f63546435544745672b70496a545a47563232717a53664d3459513744674c4b42456b5747353443516d78697251347965447769686a64743930685352795a326e4b502f4147356f494c51316f7675694e62757945616b3130594e477a61594748666b34434c4d5467566a34545731757249436571454477473031446c6557444365376130556349456a77635661415553426f426f5770756d755a75585571344e7367566c57576d5a736a424a796b56475941797853353737625154584f73386f6b64455565365771434467426e434b346b7377344963734e384f5147767078616c5164437a624a6433614c4c4654623359396b786c6831306e484a35533045676b44484674344b4949374a494f45317a47304d4c6d625269384a676341626139304d36514e6464382b79377a476253425a704f6a314c53366943556875456357686d336d6c482b5237715850493178464d415846735a6236514c515768746933415a414b6538694e6e4a4a55567368457a724f416943567050714a51626e7959735a58434a373262726f4a425266384b534d436762434351674e702b55386b46742b7965576b4f4e42436b394a42716b346546696b72484152487973326b6c41443245355433374874726b7067474f514f66616b68396f45624147707761374f66795477594958414f41756b554f4e67714f4730633361494a4c52674564623830567a476c7272374a323467443258456734756b6b326d4f634845304f454e396e384a70504643375451416249504b634c48426c416335547a68744a7557693077754d72736d676e544c35686165794738463371464a5a71426f454c6d4f4948435553344278626d6b72514738637048757449792b35565975464d6a724f3741513379587755393767422f315158456c773441516449393471694d706a58456d6a776e674e4469585a545846752b787770496a334f3230522b61614d43796c4c6a756f38653652354a63414468454d4a7a79363978783251673761635a5233786a765343576a64366579594633466f47345568754e75357775665277536b41412b516c546972706f47456d4b733870683968796e466f4c6263614b5670596534683742384a6741496f34534d645934584272724a5043514b316f41766c50616535545746786277425334483347556763446e34536834584351624b646770474e4a463168414f632f47516b50434a74734330313761344b41614d56755438456a3453416e766b4a576669514471614d326c59333247456862594e705933647579594c7473707a5273796d4f39305272685646505158646e4349773263386f5a41374a5775465935546855624258444c7154576d38326e744e4f74464951444f30684b525465614b6130376e3269486259796e4b59567549535a756a616b5346725732796b794a393375544155686165454352344241434c4e51794f4647427331535643657839734153745a6b4558535348595141526c5063647670764155456673397372716475774b4347484546454c69427574556b546361704d64365466644d44764d504e464f76614c753031517957794c736a366f62474f6351526c4c49624e5770756768724a34536f734730326e495a754954706f37414630697953686732745564722f41462b6f344b696c68475245636b726e376e6b625352536449533367703238686c625354384243345677327442757967376d453547565951394f314d6a5136534a7a47483356746f2b695141427a3257666b70616631724e4d387835347366435039326b4a4778707461746e54394f772b686761666f6a78364d4138414b6676467a347257504f6c6d78755955475746374862747072757433397a44714730454a4230396c6b474e7466524833562f354d5047306b5959663053655538504a387433364c6466366444564d5941666f6b4854364f476856396976784d4f385048346d4566564c47647734716c744e5430754f5565735a2b465236377044346e45783158736c396d643473557234693467696b4b534239457449777037744e4c486b734a436a76456d343230674b694e676a635236696e3764727742616b5167426d65557964316a485a546f4b4759747870523534397773496b4d676b6151546b4a31626d6c5053315843454633713554794177347970543432746a336431444d6f3331616f576c457742717370306433753553736a7231646b526832744a516370377a755a595141626477694d634366384a514e7269367346556d30743241463148754d4a3748583241584f64374a45615744386b67626e41704f6153446136557546496c427279617273686e61473065556470414757352b557835336d693066564b30424f6a414736776d6c2f71417230726e3244585a4b51484e723256516a714a46304b5348476177756154564263433434634d4a6e7a51583769376a43444c6767446853486b37694257454d5649547859535545356863425251334173786c476335316c754579336358684364634d6a334b356a484f4a497775416474776d65593848613034535643534e4f343543454c44725479303773726e48734534595a5071525236717750716d6251362f644934466a555742564e71375853754452647068634251706339706b4746426c6a49507745723547675675537341444b4a796b454c61743146465043376a7441484335324757463068394944516c4f304e4638707945473251583631496a666a484343413038496a4451794d6f7746664b344449796d6c3549796c66524b35787474414a427a53617a686447343771744359536242434b3176736768616f384c674b7941754133443543357537756a41577953416e554c414b3433676c645863706739704150776e45444f31497744616b47445a3454423064384a2b62776b41394e684932377a646f413744594a504953427763374f41687868316b4868464c4b4639315569634f4162527a6844634b4870355261706f726b70586a30684f773057553031416134646b62553856536a4e47666c5346684464574f55527277343037435342704c525864456646747a534a437058426a573133393033655774727375634e3166436538414d4162524b6f6777344532477057754762546e5673775056534447317877564b6f6342756546597850706e70374b4f496d686f7a6c506a64367141737030484f33534f753037625a4141756b39724875654d5546613648514e4477374a76335756384741615070386d714933656c76765376744830396b446d32304f4937715870345131744e46414b5331683238465265322f50786d2b574864734a584e41474169787364374b51786772384b6931724f666655614f456b676b5955754c543474764b4c4777752f43465936534a30644f41796b31764d2f69444870696562436c3662525867675a552b4f4b335a5a68584f6a307a53775847612b4f3663525a6a50663665317634576931476b3032614c56743261445445657078613533414462705248394c5a7550422b61562f6862474b6b307a7149614c56644e413766366d2f7174784e6f325253454276367173366a6f77534456576f394b794d6e4a70326745454256327636654a5757326756705a744b416347694f79695451594e386f3343764d5965625354516c784976365a55446475655143625732314d41414c534f5653617a7037584864457976656c707a5750584766696e5977737a51796a78696d3353624c36483748436975424b706c39513557754e6a68516e7774442f6c576365336832554b65476e32304a386e55574e31436962434b414132786c42634c4e444252614c575561545244615a7575774370414a63414c42436a527843522f713455714e67594d6a43634f787761305a53415864484b556e6361616c446474554d7030734e327541345236627348756d626e4145455861344559734b5955446d625751554a774f41705467484130456a49692f44476c782b454c5269796d35435169674d5955317567315a474e5049386644535542304c376f746350696b2b5378466361645954796344643354746f6161345079754d6278524f52384b6978486b6163376545427251327a6c545a47376836634b4c503652386f434c6e656e4f736d7270453343724151547565376a684b7738464e4d4641707049424733756c6131753032505637704245357a53357034537852486d6a776e6274744567496264784e50435938376a5250436f45652f3132467a774332724a5457526a63624b4a7341774353452b67706d78324d6c4f344745302b316d6b396a4d477973346f495763384a774e756f4968614251434751476c42303975446e684a4a65344135616941417373444b595478614e49316f4f3747416a565a51364a4f43694d626a4a79676e46753434533030444a796c416f7073687367424961554e4179467a586471546d6a46396c784151434175493453737338387051307462677034794b724b6349686459584d46344b536a654572476b4f75307749576d76684f394a43544a4b55756f384930435274326937585933576b615337684b4151654c4b41345876776a6c784948434757455a534d4a4c7546656b6c6c70455a6337325562645a785a52792b34397144453037694c6f4a615157704630516f39625464492b724a76306e436a676c77467061754c4c52754a694f4d6f6762492b374f4648306d42335531726757344f5553346d77786d585536734a5331752b776b63513367575572535344596f713753436d4e75394a54474137685355454e4a7569564a30735738477348334b6779357859763552366141504c2f45554f454f336c7649566e6f4e4d337a41353762537438564a6f2f544e4c366430787a374b386859306762564861316f6251464b6241323241414c43394e756545714773437371785a475377643147306b597753727a534e5a74794d714d31764a69745a70484f6459756b562b6d6341414f56635267566874424e6c62752f434b5370784430634a5933314b31686a6136717443676949494a7970734e4135556669346c5151527830636d384b3330375349514f3362352b56546b6a46752b5661395064766a615875623651514c563864656f3669617947326a4352385449336d32323271566e706d4d386762584e6c487533692f69304c574e61414d4c566c4a36704a59474f634f342b554855364e6b6a52385a70486d6c414c69334155615855566d2b5561654b66714854347a47357a514138647135575a316d6e64475354564c583678356664595646726f77667843316e5653617a6b7a512b776556436d616232316858477059304f494170514a6d6b45306a5239564672394d3132513057716955474c306b4c5454526b6a4a5544566156726d45386c584f76347736355554694c4242525252626e6c4959664b4a334132557247455633746154786a61687952322b32484b5578754e45396b57614a7a5a624155377066512b7139564947683047706e424e626d4d4f322f72776e6f78577867586a434d636a6c6276707632552b495a5348616c756c30726638412f4a4a755036414c5439502b783365436452314237336a744647476a39386c4c377a3856396138685a476355336c58335450436e58657059305853645a4a66424d5a61442b5a583054396e33677a6f5768337779394e672f314344506d534e44334f487662726f2f52656a4d3037474141585178585a4f396638546a35633656396a7669725768766e6166543656707a6373774a2f515774646f5073424c6d41395136304776377368687344387966384c33734144674c6b665953592b59764766325a5265453954435935354e52424e686a6e7441736a4a2f7744506c5562644647332b304436426652483271364a7570384c53546e2f354e4d39736a666d7a74492f66396c344e4f335a4962436375756a6954714a2f684c5544706e57644c71584d612b4f4e337261526474504958304846304c6f386b586d77394e3059383042312b55334e72357730376875786978532b6950413271667266437654705a53584f386f4e4a497136782f6856312f2b66453938352b496e555043335174532b7452306e524f4978666c414c472b4b2f7372384f6453306b724e426f6d394f3157323254516b31667357385556366a5045535356587a303045764a77735a732f724e3853645a305533544e6471644a4f327049586c6a7679565557376a6c656f2f624e7034762f414d6b644b7a38637a584f4e446b627a522f51727a4f5547504943364a64694f6f61364a705a3671483055527832795530345253397a766f6c4559646b59556e68484e32684e346251504b6338566a63536d48746e4365675a3747624153615554617a63514c52533431522f684d59435354566f454d32306545726e692b436b6354754f354d424e6f4370636261434575344675446c44625a596c61302f5251656e414f4842777566654f3651753267674f746379514842704f306a376f5745384e473045706763303870322b78513455673761426c4944523554484f394e64317746316545774e7574647451794d3834526f774e71514d4c6a77694d6f48314a70487153467074414663425668494841387057696d7051306262396c65416f326e34584832744e414a584f4e595142476b41664b6343443279684d79455a6a51426b35537748416744686435674276756d754f4d6370433232325559523753585a42524d4159434131344741694d4e484b4166764a543978494a3454485542674a7a4c654457436d57493873674f434550626b56674a5a4d4f6f726e4567443253556e616434613041715341772f56524e4c744d5a33667170635451477079454737427274377053584d484e32756b4a34446365366530626d2b6b576d6d3042385a63344771436b77764c53476f524c67434f55534b4d757a65556a6c5434497958324d7134305149464b7230635477385a734b36676f4143737248752f7872782b704d4c4e7a7149566c706f777852644d79364a56784178706143514c57546f353850303866777258537461305a4e6e3255534545746f44415579456b4371545671533252726a5135524139745563714c54724a716b7459344b6a70664f564f6a63317746492b445642563046335373644f4b47636c537642414c49745364504d474f416f34392b43677952686f5935684a63623366434e4153386a634d7062677a576b365143595077677475774c3452746548454f4a4a2b425848756f2f53354841787461303244566536754e5a444a4e4357734f3170357a797569585979766c5a5056782f6b436f4d72647a63444956377174453463754746567a7841634c4c6163566b2f7146397771335573334e4e71776e59376353304b71315433676b56534e4f4b765677315a76495663346332706d716b63353542554e784e6b4a614d52705977545a554b52755458436e794d73386f4d7244524156797337464631434555584e74516f6d47383556314e4758416742566d7a6134396c747a646a6d373579726670576a69314e4462622b39723248374d5867614762707a6e454746336d734877546e392f35586a76683258627251436173557655504355703076695452766b4f31736a2f414333482f6d46667951744f754e3438506d795057496f474f445352337970384f6e624836714835714c44465263624e443243754e4741786f627966646566377253332b716f4f476d385152544141435565552b7679412f65763057695664314c5374646f33466a414873634a41514d677164432f774179466a782f6341563163585979367933543179356371537a2f4149363652714f7465473954704e472f62714d505943614469447756383436707a34353378616870624b78785934487351614b2b726c383265506f57662f6b3356414252476f666e38372f79716c2f6a5834372f414252777a5274654c64512b563946665a2b3379664348545779656c2f6c337437354b384438466153476678506f57612b6a7074356353654c41777666394474696a2f6f76426a5042427349367669766b586a356d69387170366939766c79473855655550566169785736677339346831376f4f6e796553346d52314e41396837714a367731344e39724c4b36747058484f3754415838687876384177764e70416478334c582f6150316364513677364b4862354f6c42696274344a2f75503672484863396d56724c2f4376706a6d343446495751377674543238315a545a4846676f5a566768446276736b633568493267576d745a7662374a726d426a735a4b526569454632546c414263486c72526b6f746b4e7530447a4331396a4b4161397073683167704236546a4b3479457948643353467733664b52714e37747252534a48626d33616134436861364f4f7367344b6b4632575368434d373977556e627446453870574e6144515442764e574552764741687944496f6f6a486e476153447468427368634769393170386876766134595943674f65305949584e786b704e784f4b70647373636f416863446b424b326965454f4b6d3437705361646a6c50414a754736754534634a6a41346e314937576a386c51424c7330694d41504b654774414e4a4130636c4b673667426a686467354258484f416d73615134324551484270353770375251537462517969686f78684d67514154674a775a3350436339753030467a576d724b4d44687a665a4c5a414f507a546d3761706466706f6d6b38434849346b3543516a67416d6b2b5a674273464e4e6875437077303354786778344f564c6143316f4235554c53467a57324d3272434d6c3162734a7771627673467445464c434347464f654e70786b706f635469734a6f4d6134462b30307063514463674b49794f3543347164434353425756465679732b6e357243746f49775056514a565a703761417262535738696c6832333469773073546e566a43746f49614174433045424e45384b7a696a467148524f6268575237514b7970476e6a41645a7775613041636f72484e465a556e39524247446c6349723534547a4d78724d304532505574656142436d31584d4c46474e7878616c7852335733756d4e6a44446675724852784e7264512b464d72516f307a68474c4952494e4d357277657965397875796679435047384f6259543076566a307a30756a65584145504754785330306b624a6f336b625767593969737430375653365a37697778756137424432332f7744537647362b43534e6f44716637555674796a71576d7530413246377655336d315439586275683278734a6f3244384c522b61504c416b6b387764386a4b714f70534e44537875316a542f616e6243786b4a6f6a7935564f7469627577744c72504b4e5736677158574e6a74327732466c2b726e347a657167335078674b464a43304f6f46586d70414c434b56544e4363306c6f745170592f5651436a79776e4e685453317a65794849435657737271706577676d6a2b5372745730413447566353733952745665756a4e2b6c6163566a386b423663384e31416f5a587130634c39503037516173736332576738687834504c5635526f6d374a674433393136304e59645a345a686d64676b6745397359585a3866764c6e313750306e554456614347654a74736e614a4b504974576b544e6a626342372f52596a374d395579626f7247752f2b574235692f4935482f6e77747a73446e5a4e726a3634792b74726643757038627357306a676a6c524f6a502f6f79774737686557355530304b6252727453725944393336354c48564e31444e342b6f77712b502f69467175584c6c5a4f5868483276394e2b36654a33794d42326170676d42507677522b3337723364656566624c30317570364c7064593176395854793753372f67634d332b59434f6631664639654a5250644867456a354339432b7a76716d763668724a644a35784d724747534d754e412b34574363796e565957673843395362306e78446f74524a525a7638742f7731324c5635726275624871327631506b52447a326d4e39384f2f6c5966786831734d30476f66485732474e7a693570354e5970656e2b4a2b69786459365959584574654842386268793177475079586766326b7879394c365839306d4e537a7541787757673253507a41536b6d75664e655261384579456a6b3555497550436c36676c7a7a5a55522f305635366b47526f2f7477553067624e7276784b51786d342f4b624b473768584b4b454e6f4e727051576b554353564c6351506852354a76566b3453414d6d375a5a7767744763493068383030684562545671696a6e454567566c4e413956705467326b6b6664556b616b65386758534a4339745763464d494e556e52737a5849575950634c7a5a5454753359744b347573426f5478754a6f6f42753364575345726f78596f35536b62546c4b48412f56505431305a504252433067576b32697363726730316b6f30744f4730674c6d376479593667506c4d3355614b416b55436158415536786c4e427741696c767070764b65672f6b576d6b6e736b5934315365775a53304542497832526d305755684f59513678776e676b56664365676f416a4b65613554482b707741547837456f6763306c794c356a526a6b6f6541457530444f55794f7948576e4e634c6f706f6437726d6b4538576a614c5374494277453651417454396f4173424263586271526f43634c4e494d676f34527047752b69433678795561452f514f473033797062726f556f48547a57367861736142625a35396b345663535330316c49312b4b326b46637731676f6762625355794459446442572b67697943716d45373577472f6d74446f5979316f505a523163567a4e71543556566664573354496271315868323831747457326c394d51374c6d37726f3438713445766c73613170474564737a5767467843705779486d38496332747942536a4733335855765547744944526631534471517179414b5645484f652f414a4b6b51615358556359616e4f55662b6c314c6e366b5a734e4f464e36653531412b36716a302b534e344147466f756d774e2b356e4872427050366964314a2b387563356742737255644e6a4c34476c7778537a2f54394930794e4c6a5a577a305777777361304368794170764d6a546e74446b67795274744f6a59414b496f4b324551633273576848545a7942537a7870396c645176436b784d6b4a7661646f7a616c74306744613267446e6a4b6c736945624c63634a2b6a3749426b6b624737625942354b702b74366c30576b635148467a73416a33576a6c657a5951336c554857673254546c76653774564a716230792b74316b76394d62734473653669366e57686b646d2f6f45665773747447734b6b31684c6d6b417176726a4f3942366a716e6464467259354b745654347263643130674d63575074764350716d39335767335276502b56486c59327a5256552b615633344c4b4a464c49662f414a4c4253785537302b566c757051745245517039692f644d6d5a75484363384b2b71683065313463746c34626766716449442f415072594b57546d5937645257763841426b6a335276303859466e3145482f7175332f48752b4f62354a6a3062374c43332f554e646f79636c676c626e754d482b522b6939506859396a414e2b374f5634723459314936663472306a354357744c2f4c6552374f2f3730765a4942356b3531424a444350534c777376386d5a304f4c73546c5664614a6a6e30633762746b6746443250384134565a782f6846634b50314b507a644849316f3951794373754c2f516c726b4c53753361614d33667041744657704f565a346c3041366e304858615277767a496e426f2f34686b667541724e63673379724e48524e70756e42443657673864644e50532f4576554e4f786f62454a4e3859482b3132522f4b7a6b5a6348577231302f73665358685071413672345a304f6f655358756a327633446c7a63483977734c397448687a2f41466a777a4a714e5045447264462f5659474e79356e397a66307a2b536e66593931417a394a3165686b5071676b38786e2f4b372f7543745a31534f78494d6b467046483548437a757975657a4b2b4a584e614847304b5672584830674b32385261654f4c716d746a684261786b7a77306577745535394b30316c31636f443659655461467642666a6c466543353130673743586e46576739644d66545a555237765651716c4b4c437745586169765a626961526f313130334347476b6b32696762426d6a615447773255394767693347765a503256574c4b3467684f4c747458796c7071486678615863372b304a316769715375465551634b544d44694436686c466963624e7070615338486b4a78736e43434f636651554672383543567a4477436b6177316c415038414e425073665a454c79326768736a616370573036776e674862543677456a3437425042534d6347416a75754675424a54684841674158794537665973464e6252616258426746497069734a49744b3058655572637335704e417a534377376552684f424c736e684a74424e486c507230664364474544733434546952566c4d6131784e414b776a3654714a595249646f5a386e4b4a716b4553416d676a45307a4e576e4e36644a75394f666c5350384153356e44306d794557564e6945574838514f4677645171364b744e4e304c7157726673302b6b3145682f344979567275672f5a4e312f582f414e62714f6d6d304f6a614c644a493041313943624831704f6330704c5741593874475368756b3958707756374c345a38452b4849626b366c48714e59372b324e3767472f553074376f66422f685461517a6f2b6b32386b6b63666d6e396162356e304767312f564a2f4b304f6b6e314d673545544336767172754c774e31655752724a50496763545653504a492b4b414f5639425261316d686b66707569515236665374416f434a7554582b465153364b627a69347363484f4e676b636e367175654a2f51386e31336754714853792f7744393170356e4d35614c61663841702b3671686f6457365879687035792b773267773872364c364e3465644c493461364f4c645737632b6e41663930756f3650444757794d31556373546e553074493271727850345031354642396e50555247782b763163476d4a356a61504d6350725241545976417a7a4e74647133534d427957786876386b72335458654639524a7037686b6a4a49346334412f797133777630467656757053516564746868473657526733586d714831524f4378343931376f4f6a36644e707870576b4f634476736b2b314b504777413043747839714767302f5476464c394a7064785a4841776d7954546a5a2f696c6a51776237724b35766c733174784d534e4f33483462552b4f4e31414159514e4c47533570716c6230316a514d577561746338634e4d313057516f6a64454e78505a575545316a616e4f684a646a6b6f68667274487034774236515663615854784e4e73417232555451364a386b676274646e337774466f2b6c736947352f50765a576b32693834674f6759546530426331675943426858495a4348566a38305058644f4c49664f69466a6b31325476502f4335382f554f456252366556626150553174463151437a3830736b527955356d704a6f3848345746362f6a57633632656e314c5845626e5550685434706f70654f41735842716977376e75394b4f4f73426a6742596f7053726b31746e7659324b37566271396274464d4f62554366714c343943325776365a724a2b6546562f77436f746d7664676a32543675484a71786d3172377a68566d763142653342425064436671515163717031656f6675394475564536322b43384a4432746530335671766e307248476c493038557378416f6b6e324375394c30754e6f7655754a482f44797435745a6453526b70756e74637737426c55387654435a6173744830572b6e69684469316c556944706d6e6b674a4453584868583966454d524230316a434e704a2b714e7174464673746d56623633542f646e4674555171353867616257563856696a6d696532793170776d4d6b33436a7972707a6d764a2b565661794c796e6a594d4a5336755478466c5a6b6c586e6736625a314d6877356a503868565733637979705051707a706571526b4e33682f6f71364942376a3946302f77434e633659664a4e6a5739526559646579526864597034643867396c37746f3278366e5277544d6b652b4e374139704a3542433850314f6e6b31476b38307363304e41352b7139633841616e377a345630514a7438625445372f41507153422b314c6f2f794f504e632f4858385838596f5632374a5830476e634c48644a367249724365754b654e4b722b6a537566464e4734663841787649483056676f4d446d7739546b68326b4352753865332f6e4b6e4c58644a7935637551486b763231614c5a724e447257745039526869635277534d6a2b53764c4467354339322b317a544e6d384c43563244444d313237324273482b56344c714335726a374b7037472f46324e35396b32754d5869714b4156743145626d55666343782f43396736673135613633444756383865454e5435486950706b6f6473323668673358564175414b2b6a4f6f427059533037545874797073523150396e794a3971756c4f68385a39546a4443787270504d5a6a6b4558592f4e5968386842347465762f41472f61634e3854615a395676306f79652f714b386a6b61576a42464b6f78376e6f4433454f42464434545853754a75754631594b455165415530695375496a3341433147645a6153697463585730455768754a614b7130666973422b7155733770376e4167554143753356683155556165596a6e4c2b55386b486b384a6a2f414d66704361396a72734a2f6f567232674e37576b5a6b55354a767076466c63306c535a2b3347445353774c534d7375395363414c4b514947453264324678625444566b7269614e4a34474c345468424e706f79637038564f504b5138354365774e4764714157526d306a4b51476b2b74785845414869796e6f4c46546769594f4577506f3764744a514144616e514b4e6f5a7a6c4c474134476a525164783742476a616142474655416b59424e4f5374466e62616274494b4978776a4963657959656a665a6c344531766977532f637842444243344357655938483241475356376a304c37472f446d6e322f77436f79367a5775376776324d4a2b677a2b3638632b794c7879336f485548526170722f756377326e792b5154337275767148515346725775753770777454626338585a5a3745545265426644656a5a73307651656e3177485068447a2b7074517458304c5148586e52616252614f4a6a47427a396b44527a2b53334544747a416358585a5a6867652f71327531412f43352f6c744e39674f552f6a74766c5a3145626f2f756f71456c6f485a71792f6a6e726d6f306b4566533950744575737739376a6c726477422f584b33626737666e4a4b383947675a34693633317257616f61687a3458434f48797135614b736a3277503158547a452b33794d6e70394a492f574347426865626f625174617a5348537874624d5979357834335a72364a2f676d43505554616932447a5932687a5845646a7a2f414955326270326e366c5039303145397a79574750594f2f49434e4b5255523958365848624a644b3572676163596868337a566a4b54716e5578715a4e4d64493073303052446731395758576b3076687a576150562b5a72744f596f324f32334b4b446a3865363130656d30756e6c755052675175794e374f5538676b596a7265753157736b4c4a476947482f77446a6265666b2b367439463066546150547766366c714a784d38626845316f32734861314b30577336413357797a3958696c6650472f304d5930374b48783965453757545264663132706c306f6443477342416b505059492b3338554a316e55394f693658487039444b4a5a586a317563447661652b666457333264434b446f6d7164355a336d623137525a71685379656f30326b305537346462495a35426773674e55653975492f6854473951316654744e4e4430714f614a6b7a616178347477642f7576334358584f7a7735334e655a2f6164717676586a6e71377762614a6467503041437a4d6357357749566c31397233646331786c7a495a6e46782b65366a77414e504334506b6c6c7876786453596d434e6f4a3553506e743255795353686546436c314133304b745936323858656a6342493178567331374c44673441724a36665674596265634b796736766f495a4775316368617763686f736e364a386c34326d696d3267624832446d71566b6457396a665536322b3142556651646446315175505274447239515744314f62486252395437706d6c367a46314175476d696e63576b427732456b48386c305434376d7337314e57476f6e61346e6268532b6c64524734785450473034626676374b696d6d5a64575748326467726f535933683957416c6c6c5079706e586f76753835613456593344364b6f62714b4e717a36377244713942475259634141362b5352335751644f35727345726e2b546e31707a354632646452712b65553854376e6a626b4b6e67635871664130696c4f5971625768366c72486e70656c424e674e726a69734c4f783635346b7263526c5755704a30345a794651616b65575365364f765975654c66373162547a61413251756b4276685673657074745769616558644a67672f4379356e702f62573636437a2b695a61466469557a5739514c6e6c73653362373931453158554777394a68686846467a4148556149376c566a4a6957333358626d4f665a61744979586d7972336f3541662f5661533041304237724a78535071775354384b393650714a49573770576c77374138306e7a6f75514c7846474879586b3479547a61782b7141424b756572366d515350715a3576334b7a3838784939564659397a31707a6c424d6859617450624948744a4a46714539784c72374a574f41557a773947634c6451377030493876557853415a59344f2f517267625a37464b535774752b4676384146663841614d6534394f2b39524e304434576c7a673650483569316f2f736e316a54423144534567467232796a3878522f68596e6f415a4a30364630682f384131676b2b3969315a654164577a53654c413344667644585241632b726b66775636507a65384f535431374a796c5341595844417a6c6564497456645761364c57614c55744a6f53686a2f67482f774150367132554871346337526b4d726464692b4d4b56412f7a49575038416357726e34596935637551536a3862365837353455366e46566e7958504831626b6677766d6d6551754133446c66566d7369452b6b6d69504432467636696c387364516766703535496e6a314d63576e38697135622f44365470372f414339524534476948744949375a432b6f43356b326c442b53357536783868664c45414166593558303130475561727733302b664e763037442b7754763466795a4b384d2f7744554c6f5358394b315762496b6950304645663558686a67532b725830682f77436f4852537a6547394c7247416b616166612f7743477546582b746671766d3534496c494a70456e6a6d372f644465306878396b787a42394c557168396154547463334134546b784f6f336c736a424e354b6a6167315146715539344c7748446852353562666749564458526c724134472f684d4675427769734469306b6e43447539564163704853522f6979556b6f6f5748576b5070646c6338427a624b634a516d3735556e546b4f626c4d445157335352727a52734b414e39454a7a7948556c61346a74796b6f6b6e63677a72334e7372674337345373626770484d4a46676f4a3371766d30634e2f7034355564684f2b7255686a77425251446d63575375633748704670704e6e436330555541317a6a69734a7a54664b5938454f54325949736f495578304c764356704b346d32304572445156777a36344f56306a536154643134434953647553676c6a30615961625761655a7a4e374970477663333341494a432b327569645167366a706450714e4f397232534d6139746578432b47394d3473496f345875503243654939553358616e704d6b704f6c386e7a4967633753446d766a4b6d6e3131342b6b704a7a446f587562653441676643673950322f644932656d725546302f6d3664394f494a6165555070387a6e524d426f732b452b4a2f576457756f594959704a5134656c706351426e41574f2b7a2f4146735938503841554e5133446e79536d2b39686f722b567075705469507057714f64336c4f326e7664646c355434596c314557686446362f75636b676348663237787a2b75503057386c7345362f346d365a6e55424531304555385a504261434c2f3671595a39543037377671784358616b6b76622f776b483270526d6a5644555445366a55414132307465646f2b4672656a5377362f6f2f3354576166664e4538322b5442424f6248367137352b6958316c395a316e716e556e485536317a69316e34514730317630555055645636684a705778506e63596736396f77746e3470643076702f6837376c484749355a6930736530575452466b6e2f774135574c486b4e344738437a524e576957663854315a7251394a384b366a7176523464634851334a5a70354c63416b5877566553394f3033532b6779616550612f55794541504971336334487741712f777631317357676b683175712b3736654f6845317a54667a774d685174523158377872335346376e5257517937794f3245704c56792b6164463078756f696137655979546d6d6735392f2b796c5436345178792b564a356d714941334f614d2b2f305652444e484132597a736d644f78784965312b30692b3343646f337868725a6f3471613133446958432f6b71703534572b764c66456a4a52346736674a4254764f4e34566674324e2b5663654a5a665036397235416432365a326632565738586863487a582f5a312f485045535a35496f4b6f317a4a6d4863774661535054427835556a376b77743951437861566a394344504f3250556c3757453549777050582b6c733072343336505565664335746b336c70396972742b676a69635453483931443341452b69386858786a5045627774312f722f53324f3066522b7061725452535033756a694f436141766a324158743332545339503654306a586452363572645048724e5a4b5850456a687549424a7575546432764c7448704e48703368376261654357476a586457386572366470675851614e726e6637704875635366315856506b6e317868654c4f746a65654a764648686a567a756a302b696d31447a2b4a37594d452b2f7149586e33577573784d316a423037524f307247676877632f6475503841793844364a3076566e5375426a6a6245414d426a51304b6e6d44705a5847724a4f53537076636138537a39453176564a5a3477306b4e614d6b41636c516f77365231396c492b36305056796a36665445472b7935752f572f506f326c694c434d4b3130674738467742554e74415a5576544f61446b724c7278747974395670324854744a47773159727573747232447a48446c582b6f3141386f426c31536f3553485335436e39563964564c6f6e416b6759537750444a4e7a734b7a6c69747070566b6b527370794d724d577a4f71524f63774f6130766f4e42634c41576d365434574856572b622f71444d3874674848362f394668495767455879465a61633235726f3558785367346578786166314336656574632f63756f2f6a5453753650312b585152547950593172584168315866765879726158512b48644a34586e31304869756638413151513732364d746f2b5a5834434f65652f357176312f524f6f3955315231447048616953674e373344635258377168366c306e56524d734e4a636579333473694f7142702b72366b7946706558337a754e6c503147746377584930742b6f704f364157644e31766e366e5465624977656c726e55416666677066454f726e36724d5a4a4774614b6f42765a6333795761303436754968316a58315478535042506e5043726f4f6d76636233666b7038656e4d664f61575535302b62622b724a6a37626c4861512b50504367366345676a68544e5064376174612f48355230314853395134364f4f4d6d7341633871584876366631545161364e342f707943536838454b7636646f74544b30426a4459474f79644958744a6a64596f6b48345870382b7a3178572b766f534c564d6c61795150614748352f512f6f6969566876613764584e4c4b654539537a552b48644335772f716557474f507930312f68583530386247626849476b6a73764d37336e7247386e69574a49356d756154794b4950644236593465532b456d3351754c54394c782b7969514d736e645a48754368644a4434757361746a6e4169526a5858656248742b7172693666556b58693563755649493837576b6e674331387464596c457576314c674b612b567a675061795639544c773737522f4155335359707571644e6435326a3346306b5a773649453976634a787238585756353742572f432b6b504173766e2b44656c764242506b6758394d6634587a544753317764563931394d2b434e4537522b46756d514f634c6243306d73354f6638414b757a772f6b2f367a2f3270364e6d7438463958686b6134686b447051472b3752592f6866494f72494a4468796372376d3631703279777952534e746b72584d64386734587844316549773671614143746a334d7236476c4d59583831414c336b5532715132467a585661505a5932694d714e744470536249636966715a48544d442b4855564761484131562f4b6b7938354756486b73455a497461616f325278474d414a674643776b4e4338325631324b41555542757478704b572b6b416c4d4c5331316b70577542775565685537694141694e486575567761484d463453674475624b6b38504e4276796d6b6a6e756d373664547631546e427071696e515a754c676154723947557061414d59516e7578384a45644566555432524c7a5934516f7a5977455a68786b424c4164754149704c6b6d3754486d36704f5a776d4330624a35543235466b4a4153426c633033684145613673306c6964764247326b6750776e78676d7a644b355041586a48756e625844756d693348684f44367762744255574e774e41396c752f736f366d33702f6a4452506c6347525342304a63546a49782b3677624165526c54656e79766a3144535357305151523249537766723755307a7636494875457a6f32316b63724d32325130666a7373313449363265742b486446717752356a32625867663768672f52584d445a494e6649346d6d794157505968484b65765046727248587070573048467a484158785a4864656265474e58714e4230317a576775686353335932736e6e4b3943664a76486c7546736467324f793839385061575974315767596636734d7a6d67574d592f374c66693547663938577831556b756e332b575932697244674d6e34376f636d7363783063326e767a6f364250373139456d6c36664a70355a50767a685a7747682f422b565a7936646e2b6d547a304876614e72434d6b2f56614c6d66314b3666707a346b30686e367935345a47366f6d774d4667316b2b366d776545394c7074573130387352303748676c7842446e41646a374a664138756e31665235346e482b70464962596638416152642f79727550716567303748777851766157506177742b586363724c7132564f66324948694750377a3047663841705274454c64385a6143647466396c526548394c44714f6e4f6d617935324f6331784c67414f2f483057673861547a5264446b686972664b38527549423479542f4156586f39483931384a746b6b6a4d656f76315979343771736a2f414d77713536384f616866654e504c49644d3649766849747842323577632b3677766954787a72644a3934365230654f485436566b6a6d53534274766632492b50727a68627637724a397a4c6f6f582f41486a64754c794c394e646c343131754978612f55506350544b39306a623767754b506b3254563866714b4a6d3161566e726459556545376a786854344962794176503772703446694e554b526e756357304d4a7a49534b726846386b6b5746445846644b48506f456c444544776143756f64473277534c4b6e5261534d454573566339484f464244705a5844414f56597764504457322f4a563049347742734649526158766f634a2f632f7046612b45504f316f716b6a394d324e6f7772676163427537616f66556e41523177564e364830566d304679575678613268776f2f6d6b44504b6548687a4b377162304a4d50694a4a2b464d69494a72684a704e5067456857454f674c38305150634b4c6461386f7a336a5a7455422b4855567035656d624941357a5143715457514145304169654c31453877384868524a6862754b5235624347353753414479716c5266544959664e766232556a54524e635332532f685030674171753673767537534d44507771357250726a555951616e547333615a32345865306c51395471487661664e446737395172654b51786e62494565545378544e736a6c617a706a65474b6c6f754a776868704c7374777448712b6c52376a74734651333651746342742f4e52634f6334725778374d6755455574446f79616f71776969414a4477454b65506265336852617554566333304f55714a78387757454a376242776878796c7544796e7866533635783662305855517430476e655341335a546934397837714431715454545042307257332f63576a424b7a4f6c36704c4777526e4d5235482b5666394b5979616362794b494a6f72302f6a376e55386564337a65613266326336774f306d6f30727a623433626d74396d6e6e392f3557386739556275396536387738477973306e6968306254625a57756a465a76762f41495871326d38755a6844513574653635506e352f774274622f486639665434492f38413235494871643771744c5444316e5353634e634378785063316a2f48364b3559335a674531374b48316467647041342f2f7265484b4f4a68327035584c67647a515277526135576c797276455549314851656f78455748366434722f415071565970434151515259505a427838704f6157754244636579326e683337517571644a685a4449396d70303062513052794e79304432492f79732f77434a74432f706e58646270434c455572674b3972736673716878755448433138644e6d7839464d366d337133536f745870747a6d79733373397866492b6f587948347565325478443146776a4d526471482b6769693350422b563946665a48726e366a70477330546e5a307a32766a2b4775752f334338712b33794b426e6a4e736b63666c7a79616472355256427833454233374b66726c6333584e65577957476e494b41357071366f6f306f4a4e6f526548594a796e4969427661387868336442657832304f4a2f4a4832764c6a6d676f736a6e4278424a522b474649334e726d4541472b536e3768744e38704842704639776d5154776431464a3564464b5475636c4c674f2b554b55686b504254624a4f4535314f7175556d52537a4d386d3845384a477644536b4c6734345374466d6b455237374e44684f61327878684e322b6f304b52624f7a43434e42414e48434d32717762436a754e6a504b644758554d595441772b696531754d476b4e7a685158575350597041386b6a4254385932386f4c5845386850447933464a6d4f426a4b51464d33754465456a6e594363704a4c51346b5a776e42704a55566b6834796a6279617969304a5551446553704d4d6a41636a68567538336c4f6249627a7769556e732f324b2b4c6f756d363933544e59344e6731447759586e6873687751653266384c3335756f696b3138544e683342707578686645554f6f324f7753766f7a37462b723952367a3043633951635a7450706e434f435a2f3469653762376759796e50314533665873636b4d456a476c704454387279787a4877654a757265555332466b354c3968323772397633573636647173487a5364684e44765378327631506c654c2b72736a6a4d6a43513437526969416257334d42384d7347703154496d5848754a39524a64574f53744a34515a753163725a695377734a41417763382f6f7331345868387a7244544c7463317763413065395973666b7652644f58466a474e417343714a72487371362f31546e395a726f576d6836504e71706d76644b313049416f565a3358522f5439314e31656b7258527936765652526a55454f4a426f4d416f437a37716e36693356617271386d6f68305678524f49323767576973456e6a367147646644474768326c592b63476e506c625a50354a5a6176476736763142756d6766464a4b2f5751436e4d653330357a2b2b4666394a31476e6c303065795979794f7038704f51306b636638415a5a44704f6e5a31575a78316a48745951545557414665614b445551504d50544a574e61374a45773549474f45374d4a65534d3832642f3450497238547a6e394f3638422b3062657a78424c705a427078393247332b69326d357a337a374c326257533966644e736736664248473168755752324c2b4b4f56382b654939532f576458316b3779647a35584850315766657a6c5850745239506c33474662365349764141474654365155344c5139504c5142664b383772396476484b513244614d3865794d7a546b4467674b5247797943465a6d49535241554c70486a52565174473667704c3469305a4b6b526156724831776a6a54626a6b34544e43696a7369314c6930774273424545445745557054614841374a553563514a32686a54374c4f64566b7a523557683669532f4149464c4d36366a4b624e684b4a363756376866757250703269336b627554776736654579534e4147435675656b6161505473613530593367636b5a53567a4e5630665435473176595237577258706247787a74612b396f494a726c546e4e64714845354a39765a4830335335582b72593750776c57736e697a38514e3065723073486b53573575376348386a6a737342315051745a4b636d6c724e586f7034686746337541465461794e7a685247557575726237424a6b597a5851474e704a345655346b44355774312b6d7470336730566e4e62707470747430696570734f304c3772494a5767306e71614e7757623041327a414c5361563155434c576b6d4a4531656d42614868446a4c6d563343744773337856564435556562542f414f304a366e366f7a6931786f685270394f327248436c6555514362796b444e774953744c46592b467034436a54514571326b684c546a68424d5a4a5531555547706a4c635a566249783464645957683172614a4e4b716d44736d734a386c3062446c6f57773656433869773674726552335752306a67365a726137393172644f2b6477696867494479634c30503841476e6d754435726c46676e64704f703658556b45694f52727a2b52425875756e6a66756a6348463057327762353972586a2f57594752364a307a47436f794361396a697633587058676e582f41486e7735704875424a444b4a35344e6634542f414d6a6e7a552f4857675a75733767414f794872595450705a49682f654b35704659385061434d4a79357056416450494f6a6a414e3752745035493672756c79673676577858772f6658315669716f6375584c6b42345a39734f684f6e3856756e4637645445312f474c48705038425947576d6a4339742b3258702f6e6449307575594275676b324f2f35586639782b363851314c71656156796248527a663957332b782b643750456b3066445a4e4d3448504a424248384b322b322f77414a7536783462643148545241367670774d6e2f4e482f635038724a665a31726d3654786830325235706a70444553663841694248383076654f745378766764704378726d794d4c58672b78776e312f4b7936313850794f614d646c57794f506d2f415633346a304a3666316657364d325075387a34386972414f503256475775335a4745352b732f77723564394449434738677546424c494150772f6f68683175794b43717772434f49756a676f54584550494756496551546d6b7877445462525351674963413675365531646b4a434358574b536b354671564b563461317771375374502b345953754464334b357a534267345548706a52627a69676c4946344f516c413235737043573773494937647547615848384f4261624941636a436377594648386b4131674a50434e5234716b316f4a7568536348456a4b434f326b56776c49766b70746d71586248446b345148666747446161357834484b6551434f467a574535724341566d3469696945656e736b456663466330472b55416c6b5a4952474f33437a68495275776c61304e726c41507630304677744f633062634a30624342546b5148524d47397435424f56394e2f59363044774a6f797870703770485a50487149723941463879786e2b6f4b50432b682f734d36673262777a50704338475454546d6d2f384c68592f653157462f4870665333747948526b693151654b644b656c366c76556f7742484f52464943545a646b672f6f466f756e763253504e672f4371507444663576683050494f324b5a6a335679426b663557334e786c366f4f6864656a366431507a58526c37582b6b676335572b304f706d3631413878785361646d366e4f646a35465877764d656b36714c5339526a31576e6963387442444134306249712f352f56656761547147726b664646484a74664a54584e49766b482b466450332b6a362b6638413037544f426833347132506162507952617866554e575a5a675177526e6b6769737259547a6d434f526b2b326d2f696357304438685a65545273312b7345624a5762474e4a7470732f52506a2f77436c62616b6445627139524933795a6e52456345486e3376345736304c705249305274613439374943382b693667656b5353513175637a41732f6e6c62446f50564964627042716f6e58744961384556746457516c314b63762f41464d367431396d6768314c64612f79337363474e455a7a52474458357235726535386b37334f4a63584f4a4a50664b2b6b7464424672485361765578414f4565794d7539733548367235776939543348504a352b7135766c386a58343537345041326e414b3930624251564e42476431327254544f4972474678645633792b4c33544541685773626851614d57716a526b55434372434f7142425562563573533649353749724733775646613437714762526d3869796e7163466f42796138574b4277553533703542534e4c58386a41567a6d6c5656314c2b6977754a2b67764a564e6f4e4d375654354149764e7166315a37335045594246487633552f6f304c493233747033632b364c35344f4f6475305853644b6276627462744b7558786d426a43584e4a50623257623851654c756d3949612b494f644e7175504c6a3562395432576130766a563272316a4779307748466e4b6a327236376e4c316a537a426c4f4645664b3176516570616553507935484e6249445176754b586c2b67366e464e477830636a484e4942464f764374494e5a3677576e6a32553864665337525a392b636568396231576e5a427474726e454771634c4377505670497a4f33796d6b41697a5a73332f414953546134446c337135355646722b717877376e534f4457337934712b766c6e586d446e6a365249316d6e664b33415648724e493467744c634b7a36623475365735336c537a4e5a4a774c77442b6643734e544579552b5a453572676367673245706b564c396d485a707a444f435268584f6e757752776739576a455a63527969644a6476694149796e7a31616e727864524f334d396c7a5143434d46424232436b2b41397956566861613779364e415746464451312f4b6d366a6135766f623672736e335551744753634a45484d4c4f43677648367037794f79464a494130327074564666726d2f75716e564e7071754a366b7a61724e5732685255793064666948703345544e4c514c425776364b544a713477365178486e6350345750694653416a43323353756d6e55524e654a5774645737314c302f38414665663838616a5878422b686e6849487162644848797276374c4e523533523534416377544768374277422f6d316c3952715a4964504e453976714c4e6f494f62532b4165704f365431375a714157366657625762674c7031342f4c4b36506d352b334c4c34373639635a45366a76656338443253374a426b504a7273555a4a61382b6374645673593872725736362b384d794b2f77426f2f77445031566d6f6e5547314732646f39634a33666c33557345466f4934497457546c793563674b6a785a6f503954384f363753675739305a637a2f414a686b6675463879617a617a74564c36743142496866514a394a342b692b552b6f47357050546a63612b4261766974766a6f2f687153482f57394239354f7a542f6547655936367075345a58306a71744e464379326b754a7a5a587a41775530674372432b677641327664314c776a30313878443547782b57353379303158365572372f42387235342b327a6f3530506a485553786b4f6a3162577a4e50464771492f55582b61387a6447356c324c58305a2f36684f69476270656936724133303656786a6d6f634e64776679492f6466504535496561794575623477362f554d62695436634c6e656f444952584232665a43327442395842396b3752545a576d496977434433545a484134704763473763456b49526257564f6c4148436e5a34536c7041786d302b675847786c4a5663716161674e3358644b392b3044763945516144554f65326d472f6371577a6f2b6f653269513338306a514c6274752f77416b7870736346576736504b4d636c4f5053356d6b415950305268617278525a387041647175597569484470486b443452763945593747383132515778526c34464331774c62746143506f756e5a47524b7a63377362556d5070756d4559426a434d4c37526d6d754253377135576f4854394d4141596741694e304f6d6143504c6166714548396f79524a642b454650447941476b4c5774306b4147496d6a386b73656e303546694e7537364a6c393479446e4f613668644a2b646f717774636450486534527472364a476157426f4e78744e2b345348326a4b4d4976756c47567133614c54304b675a6675416b4f6a67762f77434a76364a3458336a4d4d4e6370786b4c735774454e427039316d4d4a5a656c3661536978675a37306e5042656f7a34426132374339622b7752376d395a3177334859644e5a62376e634b4e664338376c36517748446e55747a396b782f30767850705845327956336b6d7a37325035704d2b624b39356a65597053624173647a796f7669726471764465724c38454e44674c396e4171547132734d735a5070645649505559664e36644e4536784873647832775672776a72395a727733306d4c5764505a50756b5a7147792b6b663275412f774336336653756e78626d54524e4231305a6f6b767737333577764f764476573559394e70394730527359446d516a31444e6c626e7065715a4c45646b725a794c4c686e4b75364a594634756b4d6e545a334d32695272774a476733512f3870597a704d377831434a6a4a7a4535787263425a566a725a4750317572696c506b683779576252687677715672664b6e4468653570734f43726958437156314945362b6665387666756f765039314b303065726e6836452f537873637946306e6d4754697a6a2f6f715137354a507165537269654b6150544d696e662b48674e2f77417030534e74393538376f6b556a48626473514d6a6e4f3954635a587a35453361397a63386b4c313357612f5748706f307a4a482f645852744a62597078724f4b786c655436794e3048554a6d4f4142336b343446352f7741726c2b626e783066486d704d4c64754c4b6e52476947674b4a70794e6f376c536f69546b72683664697a676b4457674b5a70354e7a774c70564949625755654b5431425a5975587866467a5756534c484f4341653971715a4c7571796a6951304346554b724b61546452446b46327245625437714f3658467144714a4c42505a61547046527458495861674f4c727275704f7131446d364d6868356232564e71352f565149526f4e55777344586c5a395732716c794d5831505161716656756378704a4a77422f3055502f52756f4d6354355a4835384c31587050563944303935664e48356a65616247484839315864643851616257547566703949324268347567342f554443326b7a6e575632316c2f4476336e707335387878702f49764257393075746b325731313273564c726d795079304b393652716f7941487549374c50726e374e4f6239553358366d646a584f4d7076354b776657395271745850626e7563476e3074396974563179634e4c6d786e6350645a3173674437653148504d6776643638556c61727647386e3657746e344e36707249592f4a6e4c78474467487439464b384f395636544532534c71576a4d6850344a474d42492b742f39452f38413971645135326d49717951423256586e2f5853357558466e3154556232476750566d2b34517569794f614352664b6761695a726851645a4b6e6142336b78674867714f49313675726c307071334a305578414a3543674f6c33436a6161326262335774527130383050716a52485a42654e7a724b4243384537695535383350645a30346137446a6643697a4f613431534c492b2b3669797641616135576174446c6331746c566d72634875777055727345336c515a542b7171524e44307a64326f6130397941746f7a54506a6247642b3636736579796e5259684a3157446343356f64754948774c586f4f6966483551446753576e323458712f346338317766505a7030656c6a653174396858354b503171516165474b54537461307364526f3539372f41437239314b6d31442f4e44496d4173376c433672417a2f4145307641702b3739523772723735324f6558313674306a714c64626f4e4a4b543635596d754e2b395a55353872596d67796b4145304b2f5a5937374f356d617a772f43306b37395049364d333758592f5972567a73635a4766334d2f774271386e7665626a706b32445346723448315467576e48354b4a3053597a394e6a63343251535033556d4e6e7064366468492b716939476a4545632b6d4a39556368503142794371357577717346793563674f587a663437304c6442346e366c4147426f45706530446742325258354666534338572b3344516d4872576a3172572b6a55516c6a694f376d6e6b2f6b5171352f576e7833313564766330344668657a66593571444c34646d674e6630707a332f77427774654d534f41507756367439684d674d6e566f53614a4563677a395174664d583337473438536450623144704f7330637251364b6546386267666b454c3430367270446f4e644c424b4348784f4c48412b347756397a616d454f46446b7235522b33486f7a656d2b504e573646745261706f3141487354672f754c2f414455795977727a6e55376e4546676f4b47386b3868534a58504249414e494f304f6f4b5a4b7a744d6154322f4433535376615343456473516130692b55467a44474475463377687044413873667535537547357438495476634a7a4830434477716b306c71786f456e7146684670746e616f54706a6a755563532b6972576459337359454e634465567a647a704e32434546726d2b2b55554f7867306a552f62526e754246464978674c64323669684f64664a424b5958476753554671514267354334456b304d714f5a527861356b68466d303554314b4c794d454a474558513451764f39424254504e44526a6c4f305770527369674549687a536d6665533171633255536937796b426f334775637271494e754b43306c7272547a495842454b6e766d496341436c4d6c4d71696f7a7543625147796b6b69384b693159427864486a6c4e59397735796f766d3031465a4d7743796370424b6138754646577651707649366c704a6431426b7a442f4150384151564c484b434c34556d423764796634664e783950616f44554d6a654d556248356f6a647a6d4546747472314433576438473954643144776e7064544948656130466a795279576e6e39467149704742684a335a396c7278662b4b7431354843303664376d3753317a484670763342576c3646725a6d75426a645234425652726f3976562b6f4d65636d5a7876366d2f387179384e614f5753563461576c6f7866797452453262535453367354756158416e4c6b576252546133564672474d4c6d697a3274456471573656376e6e314f6973454439314b3666317a706b55356b2f72736534555274732f4f623930536847365a306c2b70457269414245376137634d3771756c6273304d54744f5a4e5530524349383441503157613066563954704e58714a486a7a57794f4c7470645763306633514e5a3137583630624a6e68734f3678453055422b664a5237707a7a3958477644444e35447041336456454833586e66692f526e5139646d5948467a4842736a48455553434b2f6b4662545436575764735770634c622f614366622f414c724f66614c484a4671756e5453444573546d332f796e2f7573766d6e6a58343750736f744d2f4753706b636e61315877754730465334584e505a656258616d683432357955356a38714d586a7369524f59546c54696f73644e4a627866436c6d596271374b726963476e30707a356475536152445762355147383455505550334442776f736d71347332454d792b594452796a5478456e684f3830625564725874645255787a6a3335514a545177696b5767356e79712b5745462b564961346c314f4f45594e757162754b7558784652596443317a7867693165616653517874484e2f5656786337665261517030557259346d676b6b706c316f2b706a6a3255356f70564773696a62774c566e50503572573046446d5948473053656c4e5662496748324251546a45357a6a746352616b7659516141544475617450356747306b546d454f4a756c5a746d7167537171463542736c474c79666c593378725078624e6e786b70786c42484371343347724f48424f38343979557054785a52366774786545566b2b624b70544d3636436b527a75724a5374455754707756484d6f4e675a514e344c636c41632b6e595370576e53346356486d496456496b72384b4a49394f5157726e777a4754727a49425a5932773038484b31756c476f4d7233426f39584c6541716a375039727676516647484f667444584558565866303557706d446f7238707538413563416158732f343876504d655a3839337058615961755856466d345976424141483642544e52452b545479774f395734652f634b51325a7a6f6875473064306b4f6b4f726d49686d4457675a424234572b2f786a4c6956396c4773416e31756e6459464e6c6f6a386a2f68656c78544352776f626837727976777a474f6c2b4e7a70354775445a7757747338324c422f597231694e6f59774e614142384c7a76386a6e2f5a303858773951395135756e31735570783576394e782f6a2b564c5662313848376b31347757534e4e2b79796b7856575a584a4775446d74634d6769776c54446c6776746c36663937384c74314c51532f53796732503972734839365739576338656455306e542f432f554861707a665845356a476e2b3578474150352f4a47346650362b614a325537364c592f5a4e314c376a347630725845434c5541774f7a334e562b3678576f6d4468545432522b6948554f3173544e47783739527642594978627242777459364c4e66576232744453613765394c35342f39525853706e75366631574e684d4c476d4756772f744a4e6931377642726e793664686b5a546977467a666d73685a4837516f3950727644505664484d3176396254763278386b754178513937552b787a587838647a4e652f645134555134654d46574d35387470357635554130545a4b71732f36376473766b6f4a643574354f455534775268646261494177556d732f41434531314170376e41453434516e4f474c527152793441635a5374666a6c52333258477545735a6377353457626e546d57364d37557538734751625564686464326c334f7a7650354a596b647267667770306a6a7372756f766d55336864464b514862695461422b69427a5767456979697879427871714369377148776e3873473030557a677864636c44686353476e4a5157677337386f6862766a7538706d3479326141776e774e4c4c63545346414d4848434d79526862524e464f415a736872335362334270724b474467674a73596363376950684243682f6d4e2f7767534e4d542b4c74464731746e684b37317479634a77492b34766467634a30625843795466776b6a49593832697563306d6879556949486b486e483152395071746a77434c55475141594b566b675952747178376f716e3062396b756f2b392b446d74724d4d7232667766387263615a6c526775424b38502b787272386d6e367737703769504a31544451396e675746376e70395148774e595236674b573378337a476c6e6a4d4e30626462346a367a414e4f4a48795269534d437261514b782f35325476444770632b4b6142375777466a533331526a63583968373455754e3530506a614634414c4a744d643139364e6c55327431722b6e6462316e6b596b3345744c3268314232652f31562b32344a505055375864486b31496635636a577a4f7947565735557653744c445072575254435533593948592f5077703354745536545678537a7a4f473134633578504f63725164613678304f6e76365a706e6a5679303137774b424632652b6630542f47596350513949317243576c7a2b396e43724a2b69616a714f75637a7030455a7a564e4e414433507370386655644f4e4c764d6f443274797748396c557a646231656d644a4a6f64513648646737514f46563061735045384d2f536e364c524e47774d6879476e42502f414a6c594c7864715a4e5644434a4358694d6d6963316131476931585565713635736233506b6b666971712f2f4b554c78626f59494f6d617549786e7a2b342f2f6a494e332b3337714f2b665054347675734641384274646c4d68645946595666467a57464c69726b727a6250586f53706746424f465543684e50707530766d444b6855754a506d4143304a3068634b4a74523353456d68776e41456b4336524a702f59634d4a62384c6d74326e46326e517532344f57726e507332304973584f6a4833796556304f6d6d314a39444c62645772485161447a763673763442323931633661434f4e704441425a546b307256547065684f613447597449396762566b656e777845466a42616c626e42314163496f6a664c2b46704a56546c477138644e6a6b6b46674b66707569364e7a5476694c6e2f56544e4e6f6e372f58592b69735957466a53414c49576b34307674696e50542b6e514e4a5a6f69397778636a7a53445070394b372f34394841306531632f6d725855527665434d2f6f717a554e644868796630473670395830364d6b6c6a51333443704e5a7070474f774c43306b72336472516e466a3738786f555748724c4d334d4a334376684f612b31616137526951467a4b42564f364a3862694b4a555a5469537739797563636e32516f33587a79467a6a584b6c5570424e74646c4738793232436f5a7963703758306b704d61386765365548636f375a505545514f414a4e56614d5253616c316a32555864664b4a4d346b306732536141576e4539523039462b7a34434b4e6b726e687248687a48412f42752f77425663617655524e3130686a6135774233437a6731374c496441644c354c5979484144414861317047364f527a634369766134357952356e65337033562b71365a6e726a442f4146473974565369394e38555151794f386e54535358566c3572394b5566722b673876525734356662525830554c706b663366546a5a2b4b715079744b6e367266546459643154783130703063456a4873653038683142704a5038416c65304d315a6b4a324d7a7941665a65432b47356675586976523672554862475a64726e582b454f73582b36392f30735a5a453079466a6e2f7743356f6f4663482b54665936506a2f434763744133744e397746552b4a746130644c6b5a47482b593474465656642f77444376533045676d3748437076454f676b6e67612b46706c6b593850322b39646c79382b58317066567845335a4378707a5141546a6c4130757269314c66365a70772f457877707a66714564555563736e347a38453654784e7076366d706e68315441664c6b4472614365786278583057735849564c6a354d362f774244316e524f71366a702b7561775478484c6d4732754234492b4372447762346d31586862555376302b6e676d4570472f654b6469367033626c656f66626430526b6d6c307657493853526e794a6363744e6b48386a2f4b38576c42447243326e736262396f2b69764450574966453354547164464d364e7a4842736a4e744f5961427950387152724f6861576551546176664e4f42683563515239463544396b2f56483648785844452b5574683162664a634233642f617663356d6735744b7a4b77366d56386a66612f7742486a3652343331304d4c4e6b5577624f31767475352f6346656479784f624e7a6a325876502f71503658494e56302f716b555941634470336b664273667353764470476872687573702f77413058435041325542616978377435705333506154585a43633175624e65314b4b4b695445687854646f65423768506657354e785743706b534862694f4b54327578564a6a534163326a6262466a684c474f464a64516f703758652b53686b454772464a484f4c65795a5743504935505a4e4c6734553055556742654268506f446b5555696b49356861305755725467556e6e31746f384a72496948556e69714d304e32354e70513456776d5a48704e464f6533614152776d526f6562776153732f483253744742684e3275442b4367444f6674774f55736238573743344d62747431326e7873334442745051567044754f36655978744b357264707675694137736f306c644b417a3670596e625262736c5370324355647139304238624c41396b6c51435a3465346643464c676730555a7a4c50736e466844514845496f78725073754e2b4d4f6b6d36756175662b45723655306a586561646f7877766d4477484b64503470365849613269646f5035342f774172366736646a554f4469546642576e4639586e696b38627953364456644e31725768785a765a6e6a73632f582f4141714f6671444a6e763145756d45736a386d3363443234576d38654d6c2f304e306a6163324b566a386e6b33575031564c46467074587067595a5247782b53306a4e2b785779666235457670476b306e564765527049335153376478446e5950304a586162777a71352b6f6d4152797365327a64656b443376684230424f69316b6372484f33524378523557793654314954776c38446e32655775786e324b50527a502b764e52484b3253574b6263484d6357754873516157673845394f5a72757154517a6b2b554953376d6a6467594b683676566d6671476f644a44746c65387566665933776c3073387731413870706f63375162437132346e4d72573666704d485364515a5964306a674454336d6942332b466c4f716832733165714d6f596676473576474f4b7457765765737747415178797a506d4a4458467a6147327635565071706d66645132494630774f34313755706e76367157532b764c5967512b766242377161306b2f565264555133577a434d6257377a51396861504344747963727a2b356e5474347577635874744463346734524134426c494c7235437a7178474f7a6c535745455a56653135335570734a77415649457a59417770454959545235515a53786f476372744f7a4f34384b704e50374c7a54504447625351706b45687a51745530546935777a51567a6f356f346d316878507371356964715778344c4c4c63716230375677785367366a65476a494457336172432f6334317755706d4963334a4e64715730677a577369316d6d633862546a32716c4f3073544a576d534f52674469576d7a6b66464c4961585551746d486d57306e676b57466436505736647253524e48562f376879744d56506a2f71776b45634c76366d3046562f57483647574d655748683366474641367272474f64624a4137324b727a71725a6e4b6e394b38574f6d5977786c7a52527451706f5335684943653755427a75365a50715166534d4e555743797949557252644530712b654d416e6c53745338744a4a555a303174796977705547534e726272756d3162614b49534338696b32526c446c59324c694a4b484e5075456a5841636a4b4c4d61474546746e4b574b765172434334566848654d49556163374952694c54436e61534e732b706a696353504d634744387a53464b665a532b6a4d493163623732755964774b302b4c6e657045642f6a315a6f307a77487878786c3366614b42526f4e45367653397a4e3243546d767955486f3852464f65374135567a706d756b6e4a6134686d6262376865785049382f714b2b546f326d4c5435736b6b333164514830437a5775476c686e72517565356f773450392f6a4331326f676c303952516b2b6f32306b3844355544556449624d39686445304f7958466c306671712f536e2f316d64624b3662544349787341507142716976532f7375363264543070335439584c656f306f74706363756a4a2f7741484835685a2f58644b6a6d3037517a5931342b4d4b6b384f612f7744306a7230453167744c764b6b616543306d697566357550747976693558756f4e6a6c4e6d6b4563626e6e674252524b397241397252355a4149424f514573735a6d67334f63514f54384c7a656e54696e312b71476d31304771594275336873684135616556704651612f52695452536c6a7244576b6e3350745373756a546564307a54757345686f61612b4d4b2b666553366d4a71356375544a562b4a2b6e733670304458614e3764336d524f326a2f6941736676532b563951307365513638476a395639654c35742b302f705a3652346d31554c5741527a4f4d3064663758472f77436248354c54692f78723866766a4b365055796154565254776d70496e423754374547313950394f314c656f64503032726a6f785478746c4242766b57766c6c726875794b583044396b665657645138497877456a7a744537795843763765576e3946706677766c35785566625430702b763847613359304f6b306f4770594c396a6e396956386f7a754f346d7556397839556862716f35325368706a6577786b4875446a2f4143766933785030782f546574617a52766f65544d356e31414f4645766d4d3537464849374e6f526358472f5a476b614f2f43433062536134575a47386e4b53514270776258466a7934454443567a442f634b5141337333666879694e61647671544775324431634a664d4476674b6657626d6a6e616e674535505a634767414a6235414f46576768635738436b352f7161435530754246457272734141706c695647316f5a6435396c3230795a4a716b427277333852744559386b4642644663326e443354355475474546376935743573496a5262636d725331496b6267316d6546786b44686a6c4e34625478674965344633704b59536d7544325534326b42324446726f514e704c6853526a397a713543514e395a63445a41556f5962614534304d43797545684141327067554e636367656c524a77575345396c4c44794f2b454b656e4e736d676e6f6c51624c33575453496271675535327a623665557362622f414247766c467079705853354852544d6550784e634844386a612b714e4871504d67303873524e537361356f48794c58796e425166795376704c774a717676486872706b376e6269496731333147452b6236307432654e48314a6831765364564450526235627356374377667268594c524d4a306363686351617a53394563572b53627a66503057483646393368316d7230327442324355736a5a796561722b4630387a786c4e302b4c554d4f3052746b4a4179585a73703057703163553749325379774d6c6342365352646d6c4f44594948415274653045384f4843663161476158527776677931704c6e473649776e61664e61462f514e447141356b554d6b553752666d754e676d3834744c6f744248306f503265564e714a484459587434413967706653395a467174464871434c4c685477332b31773552473637545436694f4f456830786164754f33644c5436735a48785870323662585154537446797474376d67386a2f73704833485452426a6d4232776a63397a7173666f6c38623667445836614e7a51514937494879662b796b395630386d6d307342594147534e7743666930564c794c785447316e585a337778434b46394672514b4641562f68516f33664f46707648326a45554f6831455942494c6d79664630522b39724a5276733872692f794a36376669363848635331324467704a48554b3930684941736c4d4c37584e49317463313148436b787550505a5132356659527734324232565957706243584f4635537953766138426f49436444694f6c49593852734a634162567a4957616243485375466b6857326a62356642736c516f70476c6e6f4174534e504a5478754943755a692b632f7136307a584f4842797049684c5867455a5572706274504d305974316469724750534e6d6674616656387075726e366f30476738786c6b566637715a463052786a446a48365863455572585236475a7261324768384b7a624471477862697968324a434e72583763794d6f336f3830704d4562476c785044734b34302f68434d5173624c4c483568736e614d667570685a71412f6648453677623355534550585354616c6d3779327462644573766c587a662b73657237347976584f697836476152734d6d2f5961506239466e4a597943515253312f5659332b5a63684a6365625761366e4b794c306e743355394631597235324e644551514656616a547661776c6a683943706d716e2f414b506f4f4657756c63573234715a367937792f6830555839427a6e2f69436a4f6b4f366a776e6565357a6174416536757958556a4c544a584863665a43446e64676c4c3978396b6f64744241555139456a4b4958456349545848625a4f55686b37586c41306b6a6a61306e67335266664836687a6a54596d6a746553636677566c5336354b5770384a5450696b66433255784e6d7231567752662f414658542f6a5358706c3874794c2f2f414647545342305751344f7177727a7058566a4b4c414963787671645744372f414b724736317232367039764d67424933652f79726a6f426d4263473749346e433350647741502f414c5870534f4b31716f4e536455577973506f726a3554707070574e394e6c76656c5764423162747338446d30432b326d2b794a315055756a63596d4f4941475345724d54756f577636684a435347502f466b6436564471594847447a6a5a61446b6f6d6f6c334f39776c6c31473752474c46636b567970362f446c3965316547395933717651656e366f353351744c2f77446d416f2f757257467a5873496143426b55566950736d3669795877394c706e4f6f366556314e5073632f7741327470352f7074726176753743387235656336645536324136794e73656d6342676e393141384b6c374736765476794750426166672f7744312b36744a59337a327835414137685654493336487842425472686d6a4c584538336638413949356d486234766c7934726c524f586b2f3237394e4d6d6c366431426a4c324f6441397739694c48384839563677716e78583071507258682f57364b515758786b735073345a422f564f584b726d3564664b595a7464626c752f736a366a4e6f2f4644644d31395161754a30626d3969345a622f6c593357554e7a434b6330306671456e53656f536148567736686e34346e695166554731744c7266753748307a4b4359334135763474664c48327a64496b30336a66584f47345254375a6d45393747663358314f335751367252786172545343534b5a67653177344949586a583237644864714e4c704f724d61372b6954444b523748384a50356a393148343565612b6652703347327534516a70586977565a756552654d49514963564e384c56613643554f477a6a3554585179672b6f59566c677670644b317257676b6b704356534f6f737762534d6154794d495a6473434e4738794e5573394f634b486f796867344f4b4b4b584e6256636f626a764f426c4261614e784f654537364c6d626d6a6850414a4e716f64706a576e4a4b65313574456333674134546d735930632b704261536937364a476a2b6f4d6d6b5859375a59545130676775544a4b394a62546b463757672b6b5a53764f3575416c59317532796b6d6e6b674e414a7234534e4162524359485737384357334e4e415745413970334f50616b59416b5a55656753446b464861634149307a5a4c634b425458734c6f36376f6746753477756335706474376f5461726e4d63313233393055417547323132702f7075474f5532376143436a46512b4f34334433587576324d3951477036507139473867694234653058324946342b6f2f646545672f4b33333252395447683852787365514939555049646675543666337044546d766f725474624a425a484b7775753035306658645332556b4f4a383172766b352f6d2f774246742b6e4f725474494e697a7a32575638644e6564666f48784633716135686f664e2f35585438667250725a556653367336716430524f353157666636725564453059476831634d384c6d74633344336a4a73486a396c6b7644445333716a6f584d446e50626b3358476638417176516f4a693574415a397270615877534958536a463033705771426336567a35663651474d3765662f505a5274506f39557a586a5957527544647750616a79465461337145377570506b6a6a494c585731726a75414953617257744d72484856616c37697a6137315542376a364b594f7174756f6175475457774f6c624635384249473059494b304c344939553248373347787a6f786973313946696f394c714f70794e4f6d6b5942473330676972482b667a5768304d6a756e365630657033456e414a4e6b697662736e3964456d52433857644968367030665736505273444a41336456416d77624836315836727773744f2f614f51614b2b6770656f77614a7869644d31723374333177612b71385038414530624431665561714d4e5932643566745a774461782b6634396d74666937793468376262546b4e7749343454524a6d3753794f33634c6973645a30594c547945646e497a6851326267373455324862335354456942353331325235546465796a7446486853414c627968704851763275436e746532526f4c5452437232747a585a4b48655762437155574e466f4e55364d67744e48345777384d395330384f6f333677456755346438676a2f46727a53445762446b4b3030585659782b4d384b355435746a334a2f582b6d6b2f3067776b596f69712b56306e5774464a4758417444766348464c787833566f706d46766d57443771504e314d783461373931704f7447535058354f7661614e775a4751654d6a494f4643316e5734486152385657377a485063372b422b3638746a367158747037372b70543339514a4758656c50374331653959367035306a69777572352b697a4f746e644d666c4e6d366777413256577a363846354442513931505643512f5a48483633666b7172565468784c52776c6c6c6339316c5235473262575767534d6a62594a536e6a4b4664414159542f414f7a6d7155327073436333314c6e5861547a43485a584678494a4b6354534f41504476795355676e4c6b7368727555734f434d62756c41433057696a657867446248794643384c614c377a72424e49304f696a4f576e2b346b482b4d46615a2b6c75662b6d3067663751752f7744782b4d6d7558357570664566314f71386c573267336d417376306f45476e446e6c68464f2b657974644c7070494a6a4547623433443866433765656e4b427057794d63344e64675a422b55665546386a446d79526d3066557368307a7a487638415547325479536864506c302b6f746d3437674c70775261654d3949586559573168465a46356c4d43737570614a725847526d47675a41586548346d6d57575567753269686a68522b6e66466c396c3072744e346a31576b6b413279776b6a367463503841424b39694c51514d4378777646444a2f6f76693370327659372b6b53504d42356f34642b78425873636b77684c586c3174634d4c682f794f5064644878337a45717332716e784b377939443572522f556a63484e64374b514e6659707251586642555765435858777668653867484646633871316c6f64513356364f476476456a513548565234576b63656d65524b33624c7033756a63507a5675726f6a6c787975584944356e2b306e704c756c2b4b2b6f52565562332b657a474e72732f7a6178742b7243397a2b33586f2f6d3650526456694759334747596a2f41476e4c542b76387277365275782b46707a646a61585939702b78375753617677374e704a483233537a6257416e6872686466533757673863364e6d70384a6457676c59484d64705a4d5633417348386a5338742b797a72374f6b64634d576f78707457424735772f746466704a2b463639315668313854346e436f694e726838634656307837387234386d394f4477564663446543414664654c656c5339473635712b6e793564412b67372f633035422f51716b4163527a52396c6e31366d3078334e6e4b3577336345705148423343624958416a6150716c684b484641486c456a654267704448364c504b59317064796b7978496357376654797569757334516d75326d753649306c3132555951747449394b6447316f7937685232674138306e4f4a645142776d66315341576832416d3336363451793676776c634c4c724a514a42684a757866434948412b7945324d56646a636e4d473445385569486f7a79646f49774530454677724353695730442b53594979446b35516c4a63326d354b534e764a4e35534d4c542b4932516a785a6161495470474f445841567945306b44366f6b6a6146347442455a6537646643527563357a426253516e4d65484464776c6c4e6a6257556b4d5a426f38494c413954526144566b6f4c41476854337842316a736f4c326248454257634e4c674855727277317168704f7236475545414d6e59346b357231444b6f5a5858614c302b514d6e61352f414e71663675507272706334624d31746630335a2f56522f486d324453364e3944633651306134782f352b6970664257746231587770704a77643830544248495362732f503566776e2b4c39512b62516162654c45556f4e6646482f73756e34372f77414c7171765236347764516a6b5a472b52354f474d466c7933505478314471455a3876525477647958444948357243644936712f5261703038656e696b6c655141546a594c3742656e7764576d3278736864766d64596b46436836526a2f414c71366d56543951613351364756756f6a644548596334744e754b7855326f694c7a35663453634331364231446250412b48556967363741494e487373423150546c6d6f38754a6c75504730646c556b735456393044724130706a4563666d62687449474133352b5671394654355148744f3578757137664b786668317531775a4b41476a4a44766462545252736d6c6864746273616261476e463975455971586643367a70505448797936682b6e33764668396b6b6365793838385a6a7047723037346f644e7531414e62326a59576e33774d2f51726664585a71597035347444744c357931354a645162585036724b61336f386d73316a524b787363727678764757696b65583954374c72794a38526963577647516e4d633362786c62663752756a77644f306d6b6e6759304576387437674b335973667773434a4154545635337a632f573437654f3967774e486847684f3532416f7a63484b5043346859726c57444551437536444532323243704452376c4772684733752b45515659446d6767703141443670336c6e43446d6b44593867684d386c74656e436b7777475137514d71637a707042703168564b56385568424475366561637a6b32744442305953575477464b683642432b7a54676668584376555a4f674142776c4d6c674464777452714f674d61306b6730506456632f5447744f503154764f464f74564432336d304578473871776b30705a786c416c5957696a7970564b694f4261633551336b6b3452355757506c4369416f67705744516762646c4f6344764648434935674a76684d6561627970737776304f5675306f4c695154374c6e76354279554a354a484f4539543049334a753036434b545661746b4d56467a73354e5542796f385a4a495977456b6d73643171756c36566d6c30573441746d6b6143362f66325776782f4839716d395a467630694b4853524e6a464e626432666635567a45594779655948734249377557596c664a354655516664423034644b3759486b6656656e507a48443166645858556455396e5557506863433045477762446c4c31335733524e6179414558773775465677364f627a413035614279704d6d6b477737774e335a4f43524662725a3570793656376e5063636b39315a615454794d74375a41317a78584f5647366430756154567333732f6f6a4a63542b696c61746a3464553572425959634834544f7a7a5668727735756d794d4f34527643306b544250436472535348456e75466e704e593537584d633469754168614c565451366e7a4767304c422b6252346c662b4d4e5444397a684c43317a325355506f526e2b4174783048585439543850644e6b6538756336466f4a504a49776634586c5856692f55674e61336a50304b336e32543677447045304d784c6a70705341442f74634c4837327554352b64353174386636334f6844594767796a31464738384e6b4a61434335517456716d50464d42447632555961726137483472586e32756d51377047714558694b574d4f754c554e4f306d786b57632f757451734872704878612f53616b467478796878626445693176476d77434f43742f77426d6f766c6375584c6b676f2f476e53783166777a31445356626e784574726e634d6a39774638717a67377372374664775638792f616630686e522f464f7369684452424d66506944654148636a386a61766d723539385a54547965544d313761645242326e67306546394a644f314c656f64473032726a6f736d6a624a6a354672356d597774654356374c396c58565836726f6332696b6b3350307a36594b346a494644386a61763968647868507434365152724e4831567670624950496b722f4148444c542b5973666b7649532b6a584b2b6d7674583664392b384739514161485069594a6d2f473032663274664e486c375a43657957654d374d416b6c73455a43544f327762547077306b67424359434d646b524e696e4453445263697471506c414872645a4b4c646d6e666b733061592b33535946497062735a5a355453646e47536b326c3574787050534b4469794c543856665a4a5673707053786e61505545427739584745356c42796158416a42796c594d5a534174323743563131674a47696a77694231345164446933575465416e62786563707a4c6137497755517344724c6630516b6a61633330684b4c426f4839452b4e6f326e424258524e325755773539674379536e7841415a4a54484d635464476b3653674165364d4248744a4e6730467a482b716b367248736e73624732723551484548754d4b4a714b336d725531353355476b306f57745a7449707873706c4a36697974494668497870734570623957556a6a3341776b326a33583747756f73505174626f69386561325153675879446a2b6635573436316f54716569367077424c68455841443347522f432b63764250575a656d645a302b6f593474597831534e2f33742f326e396c394f7a463033526a4b77553930424a623246744b322b506d794a366a4e3941304d552b683030327a2b7351636e493549746254706d6a626f5a57616d4d766577744c534838432b36383436463171647363656c5959343432744f307547622b5376524f6d64557252787349593068755a41363764377261792f694e5176466d754f6c306f6d676131776b647473444178384c4b644b31676c31356d314f346767676b5a504745627176555a74646f48775273425948335a4f6364316e3946716e6162554e655259427368587a7a6b5275725071576f614e62495953397243634232442b6930766850714d68365a715a70795179413757676478566d766c597271757266724e652f555547373641413741634b3130506d51644f767a5147504e6c6c3043663841365230582f7743586f656b6e6a6b695a717953532b503841434277716e56645366435878426a53343053362b5068527568797953364d4d6b6542444133645736734b673633314351517564764466554f50345763754b2f5642396f33572f7673554f6a4d4f78384d6863352b2b3778565653776b637059435659646531666d367478643669545a4b7172424f437558352f572f783350453247527a7a754955754e2b4d6851644f3433584b4d58374343376863316a654c625476746f374b664757626655446170394e4f313546454b786a6b744c47764f4a5448626a674b52473047747942706e415765364e486c357370565377306f472f41567a464875417456476b327449563170505667703833307576784b6a6a4c66776a4258517a797854554451764f4661615267324e756a5153366d4f4634486d4861527851573835593371564831446d616969305a71694b564871645063726752625172746f5977633439304855426c57773361712b6e7a6a4e79777444767734565472595148476c704a323463542b69714e584475737250724930696866435859764b526b49594465537245787472324b6954307733797337542b75674f614f2f436936675677464b65384546562b706c2f5a4b33522b49386d4832557835334f44514530794e4e7564696c4869314e366b6242597458784e7248727061365668686e592b386a4b314464564359577563633177466e4a51484670594f65794e46464a7470742f7176542b4c69637562753274486f3956472b5267654157754e4937756d743038706548323335352f4e554d4c5a594742784871485a647165716169534d7875636471302f7243332f414b314f6d3157346264346342675a34546457396f41334f4964325753457373446743584e504b6e53366c7a6d736449363038506e706f5975725477736130305142514e5a5168723353366a66524c72732f4b6a364b50373570376163713336646f687068636d62354b5737567851366b6d52376a4530747a7765796b394c3037356a4b487632466f42487970446f6d6e554f63534b6365794d39724e506b486847346d2b69517744542b747a724b6b2b4239554e4834686c306f662f54314453305837747950327456776e453541335571366551365072576d6e61397732506137634f77764b792b53627930347556374d3577635038414b57474a6e4a4f666c524e4e50484d31766c50425a5149495049556a65304e4a63514b342b5635746a714a314a346e307234396a62614c424330486858566a563943306a7a65344e3245486e30342f77733436534a77785670664275704d477231326a615341486d526a54396150384168616648374d54303343516b42746e68444d75324f3356616937354e512b6d696d6f784f6e366d5976615752416b72787a3762756a79734767366b473277376f5a54664275322f79663258744d6252477a3155443357522b306d42765666433276303064467a57656179787957352f6931664b2b4c362b614a4357443357732b7a5071673058694f466b727932505541776a4f41343152723667425a436478456877615861505575673144487832484e6348412f5132745a3556647a583064314f42757030736b55773352534e4c5844334277766d44786e305a2f52657536725275486f5937644766646879502f5068665466533959337158544e50716d67564e45325439526e3937586a50323336642f774471576d314f77466a6f7977764875434d4839516f766c5a583878354c7575577346466547336c7643474d473230456b6c75634134355257555a3830434b4e6e32525177315a474578374138373238707765614c5841724d5954793358594f467750714949355842786143434d664b5930426f753046673757313353764458415a54574f62732b5531342f774275557449384e484c51453479444453687363514b345469304f634465557a784961305356367154793362776243413031335257764656616b6a584f39564a375a4b7a65554e7a77415256706a61636546524a624a6950784245624948506f41714864637152466c7534576d6369515a435236416b4c413457564861347464646d6b5a7267306267624b4254366f556258454e4c526d6e6536484a4f4a42673055496b335632676b706c6834326b45494f7659584e7355756263663451535536527764435352366b68503156676e6351354f7577516d764c6273706f4a4a2b4552746962306c336c36706a7a523275447150426f3276715070765676384132656e44785458524e33412f4c52594b2b56644f39724a41443358304434586e64714f6861435a35737568625a2b514b2f77414c5755757476696a6539734f716b6245626a6138687039786546714f68645645544843526f65446b4e4b7a6e56644f6450713334706a79584e2f56503655486b6b6a49487975755859772f4c36745076442f766444444848505a524e5a45493579477644726f344b6c57313767484f6130337954776f5568614a33655952743745492b306e344d787a414c467132314d7348334b4a734c58436862695479355a773679426b72773654414b67753630316b626735782b47714c334249315136694959527665414f774a57643674315a7a6d6c752f634c785a5763316e55587a754a736a50756f5470533931676c5939664a6e346631776255542b61386b684a453330384a4774465755385947467a6458572f504b52702f534d5661644d54737369304b4b334f396b57664552724a557961755244683142696c73634c52614359534d4469566a3953357a5859745766544e595247316f543635794e4f626a594e6342526162556a5430585751715853616e494469702f774237624741526b72477863366c58634c7172614c56766f6e42352f46522b466d644c724136694f5659517a6d743131394535426131736572444f445148796d54363173754161507573333935634264345178716a752b56744f6d5831327449366477464567676f6b5a416a753757654f7566747955734f75653347366755723271637076554a79586e6141417158567975446a6e4350714e5358754f346756374b756d6c334f4e4c4f2b726e69504a4c524f536f63316c704a4b4e4d3972435334677174366a726d4d614b5035496b3156376b6a6e4861306c78565871354c4f463075704c34584f613669717754486337635655345a2f6654355a546b45554547496c73676378314a736b676b4e444b35766f717771352f5764615452534f6647307575363555714637684c6b6b664b68644f314c4447304f7241566e47396a7637515636504c6e36715a70745158544273726936385a5578765434354a51397849463353716d4f473831685342314d52307953795068584c6a477a3355767234595377746f50485a56514e674175557557756f50486c6b6741636c4d476864473474646e324954315539697a3642726a7033625831734237712b3668314b46326d4c5933744c6a6a4234575a3038516a59513457536f327149696d4666684b6b6176764e61364d4737504b624a7252494b4c425955665475594957754a7756306b6b4949424850737173314f596c616554754146433672493474613441664a4350484d30524552306f54784a4c4849436241797073564b332f4149553172702b6b61647777513359536535474c57686c6c4c6f57676e4e3557443841617876334c5536642f34325362786a73522f7742517461312b4c7643387a3565667230362b626245727a757a4d6e3351756d617558532b494953343531486f507a664837674a7064592f703464334b444e464a45364857463259587463443944615878334f6a7638413965693661463070446e4530667a553632524e6f6b42517450716d48544d6644626d75414c53506e4b523878654c63747576316e7038306f6b5077465861706a584d633131467276535237676f7a356148776f38737a5144645a5569506d50784c6f6a6f4f743637534f77595a6e4e474f31342f616c5641753344414b332f327436527738536d61426a6e656643787a6e41583668592f6742596150517a43554f6c4f31767374704e2f485239704a723244374f4f6f756d384c7851752f46413938663558592f5a7972664876547a316270576f307342486e754963797a676b48677243364b64326a3144487846774c5841696a53394c36664b4e527149334e41496351515438724c755858506574664f4f716764464b356a326c72326b68775049493749625732374e5957362b316a705038417066697a56454d44597453477a73726a49395837672f71735033746f564936385a77754c65796544656545334950484b63472b356f71495a58677562534749364e6e4b65353159626c4d615344366b47574d315941584f44686d30384162736370647463384a55676e62685237496a4469306b6d335a7a64646b7365317a514167485a4f52776c614863684b30427543634a72337533674e34514b6656744f376c49783166566358597a53356e42724b61425331723233644832546f6e554b764877674e6f63703747332b47776e4b714432436366756b61547579454a7a69336a6c6332516b305557697a547a6d36704b304f7641535741654d7051346c31384a466951303032317741646c6f51532f7452704f615330574f443251574b2f563335687851514134396c4d31644f4f416f7359424e556a6362543846307a5136567535652b654333745a345830445336366a752f697a53384269394d774e344258722f6744716a64543077614e7a77487832474e762b32724b71553763586657354779466f42424955667032726a6938786a6d6a65464236704c736e6b707a58553467454737565250726e4e6558675a4b322b37473837557a716e554a4753764c584861546856582b72366b6b3234467144714a6e54747036686868736a736c652f424f423379756b65586479624b484d31315a4b566f7853635056677243316335734461416142547a594961305545344d627975646b35776f7458395957384a3862675277683544686931495933633456685461715448516b37385770726d5848514755786a614f41694e615365634a796e2b4b37557874326b486c567a70504b4944624373745778776b4e3931446d69477a504a576d615871527064635775463864315a5261316a77585742585a5a356732476e464f595378312b3669386a3759314d47757477326d67724b50572b6b414f5753693144517975364a4672794862655237702f552f7472622f665762414e796a6e5745756f4c4b6636695775796a4d366e627234532b702f614e534e514c487174464f716178746b34575566315367433342534e3671352b483865366e36302f75304532744c6e656b3455485561376163473156763667302b6d2b56426c314e4f49393155355465302f553639347a75745665703165382b73704a583232325a554e343347794b5666565056534c3878754468446f746151376a3553776b7869696d366d52704756556e69496a6c35442f534d49736269546b3555636b693975516e4d3745345534754c50547663307479725675764d5947317631564c70377751705a4c6a564c53664a597a3635316352616b53507577455237643475315373446762436d736e387550315a43364a386d78483038585053705341577179696e6f6b5063466b493965595a7241394b74547251364d4f425679796f7a463975446e6a314b463164374737414479713248586e666434545a39514a44754c676e70353473343539756c41736d6c3057706157326330713173752b50614468476143316e437255346b50316d53474f322b366d5161746a5944754e6b68556b376554564b58302b4e72326775492f4e54756953786465444e554739664d643032614e7a4266754d6a2b4376534934586c725176486d616950516457696e5936327365317848353558704a38536152306258776c7759636a634b777550352b66572f485766725361566a4742336d5545487144324f30726d74634e704e6c5a7954727235526352424372395672703344385a7a7941735a7831623432746c656b2b474f72786e705459584f74304a3233386371547165727873424d6a6d7462376c6559394e366c4a7034334272774e78732b3671756f6457694433506162665a4a2b53756a365733316a6250783654715046476d456862464c762b674e667571377150694f563044684535724c377435586c722b70797663647541665a5766547a4b344238736849396c705069694e7133366c4e4a7259795a586c783933465a375751784d59532b7972535a35653074625a564e72692b512b57473252797465655265717048794f6964664b3949384e366779614454544d4133466f4948735668703944576c76634e2f4a57673843366a2b6b37546269664b4f3457654154322f502b5668383369766a6d2f706e32785279645536627064555948746d3068496b4e63734e5a2f496766715634336b4f726866522f56496d612f537a365363346d6a64485a37574b587a3172394f2f546170384d7771534e785937366730566e7a31712b70724c4d6151415847796e344a796d6c767a534737474f536f316e6f7761304531796d47693731634962584f44725474394f733864776c365a4b3952494f457279513237517849486b674130754c6a5253427364754f5268476a63413844684e694132376e4a3747373344594c4b6f68586b4f354f453361514d5a55714c5153754f6366436b74304a455a446d30556a5670766278796d78746475414e30744270756e68774163696e525278762f41416850546b55546f334532317049537874654d75424873744246706931784c514b5247614150424a6253576e4f57586675447170493172392f34624b31726446466475614d496e334b50654e6a5735532b797078724b6d47516a6351525355746474424950364c58487037536367496a656e73493275614b375952656f583072474d747a674144536b374b424761576a4854527649326a623270632f707761366730424b6446394b794d2b6e6336396f4e4b50446f645339776131687a7756755736466f626c6f4b4a486f32744847552f73636c5a665239436b4c675a586a36426158705768476a4132444e33616b7878414f345569427742395358325563647a69532b386f4d38594d5a6f5a55783777573065454930576b464c376a4a565339726732776b614457556655674e2b696a2b594c2b4535316f2b734935346163666f6c4e414139304b536936786c4a49374649717346694a736b6c4b346a6c716a5253554b425467374f456b794a4e6e42495259335a736d6c45336e386b654632373253785638544970323374354b6b786b4538306f6b4e4e647744616b6967665a504330567a496e6b3768616a54365a725275614c2b4564683574466357756252567a72436c5545734f3939317832512f4b494a775663534e613369724b48355263306b5a4b63756b7257786d714b484a4364325031566b4251707a6143464a366a5451716b4c5557474b38453255517867444a556942676a663632386f726f57796668547774566a326a335447672b35705335394d576d7868433230564f4439416b4c6d6b6d36434647347542335a4b6d6b42776f3849626d744841546e686d736c3874676f5a584f654a48574735584f725a6c7555776b386a434e6857464a42487135554f5945754e4843504b3632354e4b4a4c4a74373455326e7a484d3341692b456357374a43694e3151497032505a45686e335078776c7176786161636c7251704c41536255574367327961556d4a3265556161517730306b707074774e4a4e796645647276677176734d304c62674277585739687136556774334f7347676b4d666335434a335a53764542456b6a63326b613138727242526e78676a41776d784174666459484b306e7949764b626f5a42426d55335373343959486a30526c7850734543505836522b6e657a3773794e332f77447466356c532b6e366c726d6568677772767a786c4f6261592f54366e56696f6f396e7937436b61666f57726133317a74723443736f5a5351442b796b5179766b6b494f4173762f652f787239502b736a72644c3930317579563236714e33797070316a5245417734435a347659575452754762354b6f6d544f61526e3072546e723766714f706c613352366d647a51413667724f4e3544414a4832566d4e4431437931754b377130627247544f4457756f673931704f53314e6c4c714c5746564d2b6b6b73756372637332303741734b7331657163317a6d68324670497a366f4d454c39324732306371796a3173556364427876696c443047734457766134575346573669784963315a5665487a66477330756f59574567326d79504961352b334a37716a305772617941744a3952553175724c34646f34724b555462507841366a715845456759566a34426e61656f79415675325a423769315239546c44576e4b483061642b6d6e6a6d6a64546d6d316c38765032692b4c5a587165734c335342776f414c796e37534f6e4e302f57764f6a777a5573456e48393344682b77503572307a54616753774e656548437773763439307633726f72337362636b4468495038416c34502b442b53354f5038416a653366492f2f5a, '7490fd5a3a226924023f41fd3e6dbf547c33877c6007ffdf142638889c0a0463', NULL, '2025-09-10 21:06:21', 1, '2025-09-10 21:06:21', '2025-09-10 21:06:21');

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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `budgets`
--

INSERT INTO `budgets` (`id`, `name`, `description`, `department_id`, `fiscal_year`, `start_date`, `end_date`, `total_amount`, `allocated_amount`, `spent_amount`, `status`, `created_by`, `approved_by`, `approved_at`, `created_at`, `updated_at`) VALUES
(1, 'HR Department Budget 2024', 'Annual budget for Human Resources', 1, 2024, '2024-01-01', '2024-12-31', 500000.00, 0.00, 500000.00, 'approved', 2, NULL, NULL, '2025-07-07 13:16:01', '2026-01-18 09:57:29'),
(2, 'Finance Department Budget 2024', 'Annual budget for Finance Department', 2, 2024, '2024-01-01', '2024-12-31', 750000.00, 0.00, 750000.00, 'approved', 3, NULL, NULL, '2025-07-07 13:16:01', '2026-01-18 09:57:29'),
(3, 'IT Department Budget 2024', 'Annual budget for Information Technology', 3, 2024, '2024-01-01', '2024-12-31', 1000000.00, 0.00, 1000000.00, 'approved', 4, NULL, NULL, '2025-07-07 13:16:01', '2026-01-18 09:57:29'),
(4, 'Operations Budget 2024', 'Annual budget for Operations', 4, 2024, '2024-01-01', '2024-12-31', 800000.00, 0.00, 800000.00, 'approved', 5, NULL, NULL, '2025-07-07 13:16:01', '2026-01-18 09:57:29'),
(5, 'Office Supplies - Finance', 'Need to replenish office supplies', 1, 2026, '2025-07-24', '2026-07-24', 500.00, 500.00, 0.00, 'active', 1, NULL, NULL, '2026-01-18 11:55:45', '2026-01-18 11:55:45'),
(6, 'Software Licenses - Information Technology', 'Purchase new accounting software licenses', 1, 2026, '2025-07-24', '2026-07-24', 1200.00, 1200.00, 0.00, 'active', 1, NULL, NULL, '2026-01-18 11:55:45', '2026-01-18 11:55:45'),
(7, 'Training - Planning and Development', 'Budget for staff training and development', 1, 2026, '2025-07-24', '2026-07-24', 800.00, 800.00, 0.00, 'active', 1, NULL, NULL, '2026-01-18 11:55:45', '2026-01-18 11:55:45'),
(8, 'Consulting Services - Human Resources', 'Hire external consultants for audit', 1, 2026, '2025-07-24', '2026-07-24', 3000.00, 3000.00, 0.00, 'active', 1, NULL, NULL, '2026-01-18 11:55:45', '2026-01-18 11:55:45'),
(13, 'Cases Files', 'Files to handle cases catalog', 5, 2026, '2026-01-18', '2026-12-31', 450000.00, 0.00, 20000.00, 'draft', 1, NULL, NULL, '2026-01-18 12:21:52', '2026-01-18 12:21:52'),
(14, 'Intern Stipend - ', 'Needed for interns use for transportation and feeding', 1, 2026, '2026-01-18', '2027-01-18', 4500000.00, 4500000.00, 0.00, 'active', 1, NULL, NULL, '2026-01-18 13:21:00', '2026-01-18 13:21:00');

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
(2, 'BP-2024-002', 'Green Grocers', 'Retail', 'Jane Smith', '456 Market Ave', '+0987654321', '2026-01-12', '2027-01-12', 300.00, 'active', '2026-01-12 22:21:37', NULL);

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
(39, '5206', 'Accounts Receivable', 'asset', 'Money owed by customers', 1, 6, '2026-01-19 09:11:10', '2026-01-19 09:11:10');

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
  `current_headcount` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `name`, `description`, `head_of_department`, `budget_allocation`, `is_active`, `created_at`, `updated_at`, `max_headcount`, `current_headcount`) VALUES
(1, 'Human Resources', 'Manages employee relations, recruitment, and HR policies', 2, 500000.00, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00', 50, 0),
(2, 'Finance', 'Handles financial planning, accounting, and budget management', 3, 750000.00, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00', 50, 0),
(3, 'Information Technology', 'Manages IT infrastructure, software development, and technical support', 4, 1000000.00, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00', 50, 0),
(4, 'Operations', 'Oversees daily operations and process management', 5, 800000.00, 1, '2025-07-07 13:16:00', '2026-01-11 18:57:04', 50, 1),
(5, 'Legal Affairs', 'Handles legal matters, contracts, and compliance', NULL, 400000.00, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00', 50, 0),
(6, 'Procurement', 'Manages purchasing, vendor relations, and supply chain', NULL, 600000.00, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00', 50, 0),
(7, 'Asset Management', 'Tracks and maintains organizational assets', NULL, 300000.00, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00', 50, 0),
(8, 'Public Relations', 'Manages public communications and media relations', NULL, 250000.00, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00', 50, 0),
(9, 'Planning & Development', 'Strategic planning and organizational development', NULL, 450000.00, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00', 50, 0),
(10, 'Transportation', 'Manages fleet and transportation services', NULL, 350000.00, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00', 50, 0),
(11, 'Health & Safety', 'Ensures workplace safety and health compliance', NULL, 200000.00, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00', 50, 0),
(12, 'Revenue & Tax', 'Handles revenue collection and tax management', NULL, 550000.00, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00', 50, 0);

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

-- --------------------------------------------------------

--
-- Table structure for table `id_cards`
--

CREATE TABLE `id_cards` (
  `id` int(11) NOT NULL,
  `card_unique_identifier` varchar(255) NOT NULL,
  `holder_type` enum('EMPLOYEE','VISITOR') NOT NULL,
  `holder_id` int(11) NOT NULL,
  `issue_date` date NOT NULL,
  `expiry_date` date DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `id_cards`
--

INSERT INTO `id_cards` (`id`, `card_unique_identifier`, `holder_type`, `holder_id`, `issue_date`, `expiry_date`, `is_active`) VALUES
(1, 'CARD001', 'EMPLOYEE', 1, '2025-01-01', '2027-01-01', 1);

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
('LA_1768854483419', '15', 1, 1, 'approved', NULL, '2026-01-19 20:28:03');

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
(5, 5, 1, 2024, 21.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(6, 6, 1, 2024, 21.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(7, 7, 1, 2024, 21.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(8, 8, 1, 2024, 21.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(9, 9, 1, 2024, 21.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(10, 10, 1, 2024, 21.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(11, 11, 1, 2024, 21.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(12, 12, 1, 2024, 21.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(13, 13, 1, 2024, 21.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(14, 14, 1, 2024, 21.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(15, 15, 1, 2024, 21.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(16, 1, 1, 2025, 10.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-08 07:45:28'),
(17, 2, 2, 2024, 10.0, 1.0, 0.0, '2025-07-07 13:16:00', '2025-09-24 13:00:11'),
(18, 3, 2, 2024, 10.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(19, 4, 0, 2024, 10.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-08 07:20:05'),
(20, 5, 2, 2024, 10.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(21, 6, 2, 2024, 10.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(22, 7, 2, 2024, 10.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(23, 8, 2, 2024, 10.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(24, 9, 2, 2024, 10.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(25, 10, 2, 2024, 10.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(26, 11, 2, 2024, 10.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(27, 12, 2, 2024, 10.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(28, 13, 2, 2024, 10.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(29, 14, 2, 2024, 10.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(30, 15, 2, 2024, 10.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
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
  `status` enum('pending','approved','rejected','cancelled') DEFAULT 'pending',
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
(1, 9, 1, '2024-12-15', '2024-12-19', 5.0, 'Family vacation', 'approved', NULL, '2025-07-07 13:16:01', 6, '2024-12-01 08:00:00', NULL, NULL, NULL, NULL, '2025-07-07 13:16:01', '2025-07-07 13:16:01', 0),
(2, 10, 2, '2024-12-10', '2024-12-10', 1.0, 'Medical appointment', 'approved', NULL, '2025-07-07 13:16:01', 7, '2024-12-01 09:00:00', NULL, NULL, NULL, NULL, '2025-07-07 13:16:01', '2025-07-07 13:16:01', 0),
(3, 11, 1, '2024-12-20', '2024-12-31', 10.0, 'Year-end vacation', 'pending', NULL, '2025-07-07 13:16:01', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-07 13:16:01', '2025-07-07 13:16:01', 0),
(4, 19, 3, '2024-12-12', '2024-12-12', 1.0, 'Personal matter', 'approved', NULL, '2025-07-07 13:16:01', 5, '2024-12-01 12:00:00', NULL, NULL, NULL, NULL, '2025-07-07 13:16:01', '2025-07-15 00:44:37', 0),
(5, 19, 1, '2025-07-17', '2025-08-02', 17.0, 'It\'s unplanned', 'pending', NULL, '2025-07-15 02:00:29', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:00:29', '2025-07-15 02:00:29', 0),
(6, 1, 2, '2024-05-30', '2024-05-30', 1.0, 'Medical appointment', 'pending', NULL, '2025-07-15 02:11:53', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:11:53', '2025-07-15 02:11:53', 0),
(7, 1, 1, '2024-05-15', '2024-05-17', 3.0, 'Personal vacation', 'pending', NULL, '2025-07-15 02:11:53', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:11:53', '2025-07-15 02:11:53', 0),
(8, 1, 2, '2024-05-30', '2024-05-30', 1.0, 'Medical appointment', 'approved', NULL, '2025-07-15 02:16:40', 1, '2025-09-24 10:26:15', NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-09-24 10:26:15', 0),
(9, 1, 1, '2024-05-15', '2024-05-17', 3.0, 'Personal vacation', 'approved', NULL, '2025-07-15 02:16:40', 1, '2025-09-24 12:59:38', NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-09-24 12:59:38', 0),
(10, 2, 2, '2024-05-30', '2024-05-30', 1.0, 'Medical appointment', 'approved', NULL, '2025-07-15 02:16:40', 1, '2025-09-24 13:00:11', NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-09-24 13:00:11', 0),
(11, 2, 1, '2024-05-15', '2024-05-17', 3.0, 'Personal vacation', 'approved', NULL, '2025-07-15 02:16:40', 1, '2025-09-24 13:56:34', NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-09-24 13:56:34', 0),
(12, 3, 2, '2024-05-30', '2024-05-30', 1.0, 'Medical appointment', 'rejected', NULL, '2025-07-15 02:16:40', 1, '2025-09-24 14:14:13', 'Request rejected', NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-09-24 14:14:13', 0),
(13, 3, 1, '2024-05-15', '2024-05-17', 3.0, 'Personal vacation', 'approved', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2026-01-19 20:22:41', 0),
(14, 4, 2, '2024-05-30', '2024-05-30', 1.0, 'Medical appointment', 'approved', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2026-01-19 20:27:43', 0),
(15, 4, 1, '2024-05-15', '2024-05-17', 3.0, 'Personal vacation', 'approved', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2026-01-19 20:28:03', 0),
(16, 5, 2, '2024-05-30', '2024-05-30', 1.0, 'Medical appointment', 'pending', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40', 0),
(17, 5, 1, '2024-05-15', '2024-05-17', 3.0, 'Personal vacation', 'pending', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40', 0),
(18, 6, 2, '2024-05-30', '2024-05-30', 1.0, 'Medical appointment', 'pending', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40', 0),
(19, 6, 1, '2024-05-15', '2024-05-17', 3.0, 'Personal vacation', 'pending', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40', 0),
(20, 7, 2, '2024-05-30', '2024-05-30', 1.0, 'Medical appointment', 'pending', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40', 0),
(21, 7, 1, '2024-05-15', '2024-05-17', 3.0, 'Personal vacation', 'pending', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40', 0),
(22, 8, 2, '2024-05-30', '2024-05-30', 1.0, 'Medical appointment', 'pending', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40', 0),
(23, 8, 1, '2024-05-15', '2024-05-17', 3.0, 'Personal vacation', 'pending', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40', 0),
(24, 9, 2, '2024-05-30', '2024-05-30', 1.0, 'Medical appointment', 'pending', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40', 0),
(25, 9, 1, '2024-05-15', '2024-05-17', 3.0, 'Personal vacation', 'pending', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40', 0),
(26, 10, 2, '2024-05-30', '2024-05-30', 1.0, 'Medical appointment', 'pending', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40', 0),
(27, 10, 1, '2024-05-15', '2024-05-17', 3.0, 'Personal vacation', 'pending', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40', 0),
(28, 11, 2, '2024-05-30', '2024-05-30', 1.0, 'Medical appointment', 'pending', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40', 0),
(29, 11, 1, '2024-05-15', '2024-05-17', 3.0, 'Personal vacation', 'pending', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40', 0),
(30, 12, 2, '2024-05-30', '2024-05-30', 1.0, 'Medical appointment', 'pending', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40', 0),
(31, 12, 1, '2024-05-15', '2024-05-17', 3.0, 'Personal vacation', 'pending', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40', 0),
(32, 13, 2, '2024-05-30', '2024-05-30', 1.0, 'Medical appointment', 'pending', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40', 0),
(33, 13, 1, '2024-05-15', '2024-05-17', 3.0, 'Personal vacation', 'pending', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40', 0),
(34, 14, 2, '2024-05-30', '2024-05-30', 1.0, 'Medical appointment', 'pending', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40', 0),
(35, 14, 1, '2024-05-15', '2024-05-17', 3.0, 'Personal vacation', 'pending', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40', 0),
(36, 15, 2, '2024-05-30', '2024-05-30', 1.0, 'Medical appointment', 'pending', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40', 0),
(37, 15, 1, '2024-05-15', '2024-05-17', 3.0, 'Personal vacation', 'pending', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40', 0),
(38, 19, 2, '2024-05-30', '2024-05-30', 1.0, 'Medical appointment', 'pending', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40', 0),
(39, 19, 1, '2024-05-15', '2024-05-17', 3.0, 'Personal vacation', 'pending', NULL, '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40', 0),
(40, 19, 5, '2025-08-07', '2025-08-29', 23.0, 'Gonna be a father', 'approved', NULL, '2025-07-15 15:29:15', 1, '2025-09-24 10:22:05', NULL, NULL, NULL, NULL, '2025-07-15 15:29:15', '2025-09-24 10:22:05', 0),
(41, 21, 1, '2025-11-20', '2025-11-22', 3.0, 'Vacation', 'approved', NULL, '2025-11-19 07:55:02', NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-19 07:55:02', '2025-11-20 11:51:07', 0),
(42, 21, 8, '2025-11-21', '2025-11-22', 2.0, 'Thesis defense', 'approved', NULL, '2025-11-20 12:00:35', NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-20 12:00:35', '2025-11-20 12:15:37', 0),
(43, 21, 4, '2025-11-21', '2026-01-22', 63.0, 'Birth', 'approved', NULL, '2025-11-20 12:18:08', NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-20 12:18:08', '2026-01-19 20:19:39', 0),
(44, 21, 8, '2025-11-21', '2025-11-22', 2.0, 'Sick', 'approved', NULL, '2025-11-20 16:01:05', NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-20 16:01:05', '2026-01-19 20:18:49', 0),
(45, 1, 1, '2026-01-14', '2026-01-23', 10.0, 'Going for break', 'approved', NULL, '2026-01-13 15:22:47', NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-13 15:22:47', '2026-01-19 20:18:32', 0),
(46, 1, 2, '2026-01-25', '2026-01-27', 3.0, 'On leave', 'approved', NULL, '2026-01-13 15:33:31', NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-13 15:33:31', '2026-01-19 20:15:00', 0);

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
(7, 'Study Leave', 'Educational leave', 10, 0, 0, 1, 0, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(8, 'Emergency Leave', 'Emergency situations', 2, 0, 0, 1, 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00');

-- --------------------------------------------------------

--
-- Table structure for table `legal_cases`
--

CREATE TABLE `legal_cases` (
  `id` bigint(20) NOT NULL,
  `assigned_to` varchar(255) DEFAULT NULL,
  `case_number` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `start_date` date NOT NULL,
  `status` varchar(255) DEFAULT NULL,
  `title` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(2, 10, 'Attendance Reminder', 'Please remember to clock in using the biometric system.', 'info', 0, '/attendance', NULL, '2025-07-07 13:16:01', NULL),
(3, 11, 'New Procurement Request', 'A new procurement request requires your review.', 'warning', 0, '/procurement/requests', NULL, '2025-07-07 13:16:01', NULL),
(4, 6, 'Monthly Report Due', 'The monthly HR report is due by end of week.', 'warning', 0, '/reports', NULL, '2025-07-07 13:16:01', NULL),
(5, 7, 'Budget Review Required', 'Q4 budget review meeting scheduled for next week.', 'info', 0, '/finance/budgets', NULL, '2025-07-07 13:16:01', NULL);

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
(2, 12, 2025, '2025-12-01', '2025-12-31', 104000.00, 12433.28, 91566.72, 'COMPLETED', 1, NULL, NULL, '2026-01-22 17:43:20', '2025-12-31 23:59:59.000000');

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
(32, 6400.00, 5691.67, 350.00, '2025-11-30', '2025-11-01', 408.33, 1, 19, 0, 0.00, 0.00, 0.00, 0.00, 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `performance_reviews`
--

CREATE TABLE `performance_reviews` (
  `id` bigint(20) NOT NULL,
  `review_date` date NOT NULL,
  `review_text` varchar(2000) NOT NULL,
  `reviewer` varchar(255) DEFAULT NULL,
  `user_id` int(11) NOT NULL
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
(32, 'biometric.enroll', 'Enroll biometric data'),
(33, 'biometric.verify', 'Verify biometric data'),
(34, 'biometric.manage', 'Manage biometric system'),
(35, 'reports.view', 'View reports'),
(36, 'reports.generate', 'Generate reports'),
(37, 'reports.manage', 'Manage report templates'),
(38, 'analytics.view', 'View analytics dashboard'),
(39, 'system.settings', 'Manage system settings'),
(40, 'system.audit', 'View audit logs'),
(41, 'system.backup', 'Perform system backups');

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
-- Table structure for table `report_templates`
--

CREATE TABLE `report_templates` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `report_type` varchar(50) NOT NULL,
  `module` varchar(50) NOT NULL,
  `query_template` text NOT NULL,
  `parameters` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`parameters`)),
  `output_format` enum('pdf','excel','csv','html') DEFAULT 'pdf',
  `is_active` tinyint(1) DEFAULT 1,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `report_templates`
--

INSERT INTO `report_templates` (`id`, `name`, `description`, `report_type`, `module`, `query_template`, `parameters`, `output_format`, `is_active`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'Monthly Attendance Report', 'Monthly attendance summary by department', 'attendance_summary', 'attendance', 'SELECT d.name as department, COUNT(*) as total_records, AVG(ar.total_hours) as avg_hours FROM attendance_records ar JOIN users u ON ar.user_id = u.id JOIN departments d ON u.department_id = d.id WHERE MONTH(ar.clock_in_time) = ? AND YEAR(ar.clock_in_time) = ? GROUP BY d.id', '{\"month\": \"number\", \"year\": \"number\"}', 'pdf', 1, 1, '2025-07-07 13:16:01', '2025-07-07 13:16:01'),
(2, 'Leave Balance Report', 'Current leave balances for all employees', 'leave_balance', 'leave', 'SELECT u.employee_id, CONCAT(u.first_name, \" \", u.last_name) as name, lt.name as leave_type, lb.remaining_days FROM leave_balances lb JOIN users u ON lb.user_id = u.id JOIN leave_types lt ON lb.leave_type_id = lt.id WHERE lb.year = ?', '{\"year\": \"number\"}', 'pdf', 1, 1, '2025-07-07 13:16:01', '2025-07-07 13:16:01'),
(3, 'Budget Variance Report', 'Budget vs actual spending analysis', 'budget_variance', 'finance', 'SELECT b.name, b.total_amount, b.spent_amount, (b.total_amount - b.spent_amount) as variance FROM budgets b WHERE b.fiscal_year = ?', '{\"fiscal_year\": \"number\"}', 'pdf', 1, 1, '2025-07-07 13:16:01', '2025-07-07 13:16:01'),
(4, 'Asset Inventory Report', 'Complete asset inventory listing', 'asset_inventory', 'asset', 'SELECT a.asset_tag, a.name, ac.name as category, a.status, a.location, CONCAT(u.first_name, \" \", u.last_name) as assigned_to FROM assets a JOIN asset_categories ac ON a.category_id = ac.id LEFT JOIN users u ON a.assigned_to = u.id WHERE a.status = ?', '{\"status\": \"string\"}', 'pdf', 1, 1, '2025-07-07 13:16:01', '2025-07-07 13:16:01');

-- --------------------------------------------------------

--
-- Table structure for table `revenue_collections`
--

CREATE TABLE `revenue_collections` (
  `id` bigint(20) NOT NULL,
  `amount_collected` decimal(38,2) NOT NULL,
  `collection_date` date NOT NULL,
  `payer_id` varchar(255) NOT NULL,
  `payment_method` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(1, 'Super Admin', 'Full system access and administration'),
(2, 'Department Head', 'Manages department operations and staff'),
(3, 'Manager', 'Supervises team members and projects'),
(4, 'Senior Officer', 'Experienced staff with specialized skills'),
(5, 'Officer', 'Regular staff member'),
(6, 'Junior Officer', 'Entry-level staff member'),
(7, 'Intern', 'Temporary learning position'),
(8, 'Contractor', 'External service provider'),
(9, 'HR Manager', 'Human Resources management'),
(10, 'Finance Manager', 'Financial operations management'),
(11, 'IT Manager', 'Information Technology management'),
(12, 'Operations Manager', 'Operations oversight');

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
(32, 1, 32, '2025-07-07 13:16:00', NULL),
(33, 1, 33, '2025-07-07 13:16:00', NULL),
(34, 1, 34, '2025-07-07 13:16:00', NULL),
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
(76, 5, 32, '2025-07-07 13:16:00', NULL),
(77, 5, 33, '2025-07-07 13:16:00', NULL),
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
(109, 14, 32, '2025-07-15 15:32:26', NULL),
(110, 14, 33, '2025-07-15 15:32:26', NULL),
(111, 14, 34, '2025-07-15 15:32:26', NULL),
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
(152, 15, 32, '2025-09-10 15:27:17', NULL),
(153, 15, 33, '2025-09-10 15:27:17', NULL),
(154, 15, 34, '2025-09-10 15:27:17', NULL),
(155, 15, 35, '2025-09-10 15:27:17', NULL),
(156, 15, 36, '2025-09-10 15:27:17', NULL),
(157, 15, 37, '2025-09-10 15:27:17', NULL),
(158, 15, 38, '2025-09-10 15:27:17', NULL),
(159, 15, 39, '2025-09-10 15:27:17', NULL),
(160, 15, 40, '2025-09-10 15:27:17', NULL),
(161, 15, 41, '2025-09-10 15:27:17', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `routes`
--

CREATE TABLE `routes` (
  `id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `start_location` varchar(255) NOT NULL,
  `end_location` varchar(255) NOT NULL,
  `distance` decimal(10,2) DEFAULT NULL,
  `estimated_duration` int(11) DEFAULT NULL COMMENT 'Duration in minutes',
  `status` varchar(50) NOT NULL DEFAULT 'active',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `routes`
--

INSERT INTO `routes` (`id`, `name`, `start_location`, `end_location`, `distance`, `estimated_duration`, `status`, `created_at`, `updated_at`) VALUES
('53459f7a-eff4-11f0-ad55-ac675de0e907', 'City Center to Industrial Zone', 'City Center', 'Industrial Zone', 15.50, 30, 'active', '2026-01-12 22:21:37', NULL),
('5345abcd-eff4-11f0-ad55-ac675de0e907', 'Residential Area to Downtown', 'Residential Area', 'Downtown', 8.20, 20, 'active', '2026-01-12 22:21:37', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `safety_incidents`
--

CREATE TABLE `safety_incidents` (
  `id` int(11) NOT NULL,
  `incident_number` varchar(20) NOT NULL,
  `incident_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `location` varchar(100) NOT NULL,
  `incident_type` enum('accident','near_miss','property_damage','environmental') NOT NULL,
  `severity` enum('low','medium','high','critical') NOT NULL,
  `description` text NOT NULL,
  `immediate_action` text DEFAULT NULL,
  `reported_by` int(11) NOT NULL,
  `investigated_by` int(11) DEFAULT NULL,
  `investigation_notes` text DEFAULT NULL,
  `corrective_actions` text DEFAULT NULL,
  `status` enum('reported','under_investigation','closed') DEFAULT 'reported',
  `follow_up_required` tinyint(1) DEFAULT 0,
  `follow_up_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `safety_inspections`
--

CREATE TABLE `safety_inspections` (
  `id` int(11) NOT NULL,
  `inspection_number` varchar(20) NOT NULL,
  `inspection_date` date NOT NULL,
  `location` varchar(100) NOT NULL,
  `inspection_type` varchar(50) NOT NULL,
  `inspector_id` int(11) NOT NULL,
  `checklist_items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`checklist_items`)),
  `overall_score` decimal(5,2) DEFAULT NULL,
  `findings` text DEFAULT NULL,
  `recommendations` text DEFAULT NULL,
  `status` enum('scheduled','in_progress','completed','follow_up_required') DEFAULT 'scheduled',
  `next_inspection_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  `type` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `social_media_posts`
--

CREATE TABLE `social_media_posts` (
  `id` int(10) UNSIGNED NOT NULL,
  `platform` varchar(50) NOT NULL,
  `content` text NOT NULL,
  `scheduled_date` datetime DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'draft',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `social_media_posts`
--

INSERT INTO `social_media_posts` (`id`, `platform`, `content`, `scheduled_date`, `status`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Facebook', 'Welcome to our new community portal!', '2026-01-12 22:21:37', 'published', 1, '2026-01-12 22:21:37', NULL),
(2, 'Twitter', 'Important announcement coming soon...', '2026-01-13 22:21:37', 'scheduled', 1, '2026-01-12 22:21:37', NULL);

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
  `updated_at` datetime(6) DEFAULT NULL
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
(13, 'biometric_confidence_threshold', '0.85', 'Minimum confidence score for biometric verification', 'number', 0, NULL, '2025-07-07 13:16:01'),
(14, 'visitor_badge_expiry_hours', '8', 'Visitor badge validity in hours', 'number', 0, NULL, '2025-07-07 13:16:01');

-- --------------------------------------------------------

--
-- Table structure for table `tax_assessments`
--

CREATE TABLE `tax_assessments` (
  `id` bigint(20) NOT NULL,
  `assessed_amount` decimal(38,2) NOT NULL,
  `assessment_date` date NOT NULL,
  `status` varchar(255) DEFAULT NULL,
  `taxpayer_id` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  `bank_account_number` varchar(50) DEFAULT NULL,
  `personal_contact` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `employee_id`, `email`, `password`, `first_name`, `last_name`, `middle_name`, `phone`, `address`, `date_of_birth`, `hire_date`, `department_id`, `role_id`, `manager_id`, `salary`, `is_active`, `biometric_enrollment_status`, `last_login`, `failed_login_attempts`, `account_locked_until`, `password_reset_token`, `password_reset_expires`, `date_of_joining`, `account_number`, `momo_number`, `profile_picture_url`, `emergency_contact_name`, `emergency_contact_phone`, `created_at`, `updated_at`, `account_status`, `bank_name`, `default_password_changed`, `job_grade_id`, `profile_completed`, `provisioned_by`, `provisioned_date`, `temporary_password`, `bank_account_number`, `personal_contact`) VALUES
(1, 'EMP001', 'garrisonsayor@gmail.com', '$2b$10$o/Y0kcYZqyZdhujd8S4uOuwftIaEfRNEdwKOCFDhSUT4bAGwpNDz2', 'Crafty', 'Dev', 'Developer', '+250791955398', 'Kanombe', '2002-10-30', '2024-01-01', 3, 1, NULL, 120000.00, 1, 'NONE', '2026-01-22 10:04:27', 0, NULL, NULL, NULL, NULL, '100235367283', '0791955398', NULL, 'Albertine Wilson', '079001274', '2025-07-07 15:16:00', '2026-01-22 10:04:27', 'ACTIVE', NULL, b'1', NULL, b'1', NULL, NULL, NULL, NULL, NULL),
(2, 'EMP002', 'hr.head@craftresource.gov', '$2b$10$o/Y0kcYZqyZdhujd8S4uOuwftIaEfRNEdwKOCFDhSUT4bAGwpNDz2', 'Garrison', 'Sayor', NULL, '+250791955398', NULL, NULL, '2024-01-15', 1, 2, NULL, 95000.00, 1, 'NONE', '2025-12-29 13:50:41', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-07 15:16:00', '2026-01-20 15:58:26', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(3, 'EMP003', 'finance.head@craftresource.gov', '$2b$10$o/Y0kcYZqyZdhujd8S4uOuwftIaEfRNEdwKOCFDhSUT4bAGwpNDz2', 'Christopher', 'Leabon', NULL, '+1234567892', NULL, NULL, '2024-01-15', 2, 2, NULL, 98000.00, 1, 'NONE', '2025-12-29 11:59:25', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-07 15:16:00', '2026-01-20 15:58:26', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(4, 'EMP004', 'it.head@craftresource.gov', '$2b$10$o/Y0kcYZqyZdhujd8S4uOuwftIaEfRNEdwKOCFDhSUT4bAGwpNDz2', 'George', 'Kona', NULL, '+1234567893', NULL, NULL, '2024-01-15', 3, 2, NULL, 105000.00, 1, 'NONE', NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-07 15:16:00', '2026-01-20 15:58:26', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(5, 'EMP005', 'ops.head@craftresource.gov', '$2b$10$o/Y0kcYZqyZdhujd8S4uOuwftIaEfRNEdwKOCFDhSUT4bAGwpNDz2', 'Thomas', 'Sneh', NULL, '+1234567894', NULL, NULL, '2024-01-15', 4, 2, NULL, 92000.00, 1, 'NONE', NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-07 15:16:00', '2026-01-20 15:58:26', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6, 'EMP006', 'hr.manager@craftresource.gov', '$2b$10$o/Y0kcYZqyZdhujd8S4uOuwftIaEfRNEdwKOCFDhSUT4bAGwpNDz2', 'Jennifer', 'Davis', NULL, '+1234567895', NULL, NULL, '2024-02-01', 1, 9, NULL, 75000.00, 1, 'NONE', NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-07 15:16:00', '2026-01-20 15:58:26', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(7, 'EMP007', 'finance.manager@craftresource.gov', '$2b$10$o/Y0kcYZqyZdhujd8S4uOuwftIaEfRNEdwKOCFDhSUT4bAGwpNDz2', 'Robert', 'Wilson', NULL, '+1234567896', NULL, NULL, '2024-02-01', 2, 10, NULL, 78000.00, 1, 'NONE', NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-07 15:16:00', '2026-01-20 15:58:26', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(8, 'EMP008', 'it.manager@craftresource.gov', '$2b$10$o/Y0kcYZqyZdhujd8S4uOuwftIaEfRNEdwKOCFDhSUT4bAGwpNDz2', 'Amanda', 'Brown', NULL, '+1234567897', NULL, NULL, '2024-02-01', 3, 11, NULL, 82000.00, 1, 'NONE', NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-07 15:16:00', '2026-01-20 15:58:26', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(9, 'EMP009', 'john.doe@craftresource.gov', '$2b$10$o/Y0kcYZqyZdhujd8S4uOuwftIaEfRNEdwKOCFDhSUT4bAGwpNDz2', 'John', 'Doe', NULL, '+1234567898', NULL, NULL, '2024-03-01', 1, 5, NULL, 55000.00, 1, 'NONE', NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-07 15:16:00', '2026-01-20 15:58:26', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(10, 'EMP010', 'jane.smith@craftresource.gov', '$2b$10$o/Y0kcYZqyZdhujd8S4uOuwftIaEfRNEdwKOCFDhSUT4bAGwpNDz2', 'Jane', 'Smith', NULL, '+1234567899', NULL, NULL, '2024-03-01', 2, 5, NULL, 58000.00, 1, 'NONE', NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-07 15:16:00', '2026-01-20 15:58:26', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(11, 'EMP011', 'mark.jones@craftresource.gov', '$2b$10$o/Y0kcYZqyZdhujd8S4uOuwftIaEfRNEdwKOCFDhSUT4bAGwpNDz2', 'Mark', 'Jones', NULL, '+1234567800', NULL, NULL, '2024-03-15', 3, 5, NULL, 62000.00, 1, 'NONE', NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-07 15:16:00', '2026-01-20 15:58:26', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(12, 'EMP012', 'emily.white@craftresource.gov', '$2b$10$o/Y0kcYZqyZdhujd8S4uOuwftIaEfRNEdwKOCFDhSUT4bAGwpNDz2', 'Emily', 'White', NULL, '+1234567801', NULL, NULL, '2024-03-15', 4, 5, NULL, 54000.00, 1, 'NONE', NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-07 15:16:00', '2026-01-20 15:58:26', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(13, 'EMP013', 'alex.green@craftresource.gov', '$2b$10$o/Y0kcYZqyZdhujd8S4uOuwftIaEfRNEdwKOCFDhSUT4bAGwpNDz2', 'Alex', 'Green', NULL, '+1234567802', NULL, NULL, '2024-04-01', 5, 5, NULL, 59000.00, 1, 'NONE', NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-07 15:16:00', '2026-01-20 15:58:26', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(14, 'EMP014', 'maria.garcia@craftresource.gov', '$2b$10$o/Y0kcYZqyZdhujd8S4uOuwftIaEfRNEdwKOCFDhSUT4bAGwpNDz2', 'Maria', 'Garcia', NULL, '+1234567803', NULL, NULL, '2024-04-01', 6, 5, NULL, 56000.00, 1, 'NONE', NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-07 15:16:00', '2026-01-20 15:58:26', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(15, 'EMP015', 'chris.taylor@craftresource.gov', '$2b$10$o/Y0kcYZqyZdhujd8S4uOuwftIaEfRNEdwKOCFDhSUT4bAGwpNDz2', 'Chris', 'Taylor', NULL, '+1234567804', NULL, NULL, '2024-04-15', 7, 5, NULL, 57000.00, 1, 'NONE', NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-07 15:16:00', '2026-01-20 15:58:26', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(19, 'EMP016', 'garrisonsay@gmail.com', '$2b$10$o/Y0kcYZqyZdhujd8S4uOuwftIaEfRNEdwKOCFDhSUT4bAGwpNDz2', 'Crafty', 'Dev', NULL, NULL, NULL, NULL, '2024-01-01', 2, 5, NULL, NULL, 1, 'NONE', '2025-12-18 15:43:46', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-07 18:06:52', '2026-01-20 15:58:26', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(20, 'EMP017', 'issaadamx@gmail.com', '$2b$10$o/Y0kcYZqyZdhujd8S4uOuwftIaEfRNEdwKOCFDhSUT4bAGwpNDz2', 'Issa', 'Adams', NULL, NULL, NULL, NULL, '2024-01-01', 1, 5, NULL, NULL, 1, 'NONE', '2025-10-06 16:17:19', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 17:32:26', '2026-01-20 15:58:26', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(21, 'EMP018', 'albertinewilson29@gmail.com', '$2b$10$o/Y0kcYZqyZdhujd8S4uOuwftIaEfRNEdwKOCFDhSUT4bAGwpNDz2', 'Albertine', 'Wilson', 'Tenneh', '0790001273', 'Kanombe', '2003-01-05', '2025-09-10', 3, 1, NULL, NULL, 1, 'ENROLLED', '2025-11-20 16:08:32', 0, NULL, NULL, NULL, NULL, '4493339187', '0791955398', 'http://res.cloudinary.com/dgfeef4ot/image/upload/v1759757113/kkofine7tqq8wug8jesv.jpg', 'Garrison Nyunti Sayor III', '07919555398', '2025-09-10 23:06:21', '2026-01-20 15:58:26', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(23, 'EMP022', 'sabbahkarsor@gmail.com', '$2b$10$o/Y0kcYZqyZdhujd8S4uOuwftIaEfRNEdwKOCFDhSUT4bAGwpNDz2', 'Crayton', 'Kamara', 'Morientes', '0791374847', 'Sonatube', '2003-05-21', '2026-01-11', 4, 2, NULL, NULL, 1, 'NONE', '2026-01-11 20:49:17', 0, NULL, NULL, NULL, NULL, '100235367283', '0791374847', NULL, 'Garrison Sayor', '0791955398', '2026-01-11 20:57:03', '2026-01-22 20:44:30', 'ACTIVE', NULL, b'1', 5, b'1', 1, '2026-01-11 20:57:03.000000', 'b7c030e6ad8a8350a68b2e6c955a3ae01d85d6e77e2c0f6f483dbfc691f29ac1', NULL, NULL);

--
-- Triggers `users`
--
DELIMITER $$
CREATE TRIGGER `audit_users_update` AFTER UPDATE ON `users` FOR EACH ROW BEGIN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values, timestamp)
    VALUES (NEW.id, 'UPDATE', 'users', NEW.id, 
            JSON_OBJECT('employee_id', OLD.employee_id, 'email', OLD.email, 'first_name', OLD.first_name, 'last_name', OLD.last_name),
            JSON_OBJECT('employee_id', NEW.employee_id, 'email', NEW.email, 'first_name', NEW.first_name, 'last_name', NEW.last_name),
            CURRENT_TIMESTAMP);
END
$$
DELIMITER ;

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
  `check_in_method` enum('BIOMETRIC_FACE','MANUAL','ID_CARD') DEFAULT 'MANUAL',
  `check_out_method` enum('BIOMETRIC_FACE','MANUAL','ID_CARD') DEFAULT NULL,
  `biometric_template_id` int(11) DEFAULT NULL,
  `card_id_tapped` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `visitor_logs`
--

INSERT INTO `visitor_logs` (`id`, `visitor_id`, `purpose`, `employee_to_visit_id`, `check_in_time`, `check_out_time`, `check_in_method`, `check_out_method`, `biometric_template_id`, `card_id_tapped`) VALUES
(1, 1, 'IT consultation meeting', 4, '2024-12-01 07:00:00', '2024-12-01 10:00:00', 'MANUAL', 'MANUAL', NULL, NULL);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_ap_aging`
-- (See below for the actual view)
--
CREATE TABLE `vw_ap_aging` (
`id` bigint(20)
,`invoice_number` varchar(50)
,`vendor_name` varchar(255)
,`amount` decimal(38,2)
,`due_date` date
,`status` varchar(255)
,`days_overdue` bigint(10)
,`aging_bucket` varchar(12)
,`expense_account` varchar(100)
,`ap_account` varchar(100)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_ar_aging`
-- (See below for the actual view)
--
CREATE TABLE `vw_ar_aging` (
`id` bigint(20)
,`invoice_number` varchar(50)
,`customer_name` varchar(255)
,`amount` decimal(38,2)
,`amount_paid` decimal(38,2)
,`balance` decimal(38,2)
,`due_date` date
,`status` varchar(255)
,`days_overdue` bigint(10)
,`aging_bucket` varchar(12)
,`revenue_account` varchar(100)
,`ar_account` varchar(100)
);

-- --------------------------------------------------------

--
-- Structure for view `vw_ap_aging`
--
DROP TABLE IF EXISTS `vw_ap_aging`;

CREATE ALGORITHM=UNDEFINED DEFINER=`garrisonsayor`@`localhost` SQL SECURITY DEFINER VIEW `vw_ap_aging`  AS SELECT `ap`.`id` AS `id`, `ap`.`invoice_number` AS `invoice_number`, `ap`.`vendor_name` AS `vendor_name`, `ap`.`amount` AS `amount`, `ap`.`due_date` AS `due_date`, `ap`.`status` AS `status`, curdate() - `ap`.`due_date` AS `days_overdue`, CASE WHEN curdate() - `ap`.`due_date` <= 0 THEN 'Current' WHEN curdate() - `ap`.`due_date` between 1 and 30 THEN '1-30 Days' WHEN curdate() - `ap`.`due_date` between 31 and 60 THEN '31-60 Days' WHEN curdate() - `ap`.`due_date` between 61 and 90 THEN '61-90 Days' ELSE 'Over 90 Days' END AS `aging_bucket`, `coa_expense`.`account_name` AS `expense_account`, `coa_ap`.`account_name` AS `ap_account` FROM ((`account_payables` `ap` left join `chart_of_accounts` `coa_expense` on(`ap`.`expense_account_code` = `coa_expense`.`account_code`)) left join `chart_of_accounts` `coa_ap` on(`ap`.`ap_account_code` = `coa_ap`.`account_code`)) WHERE `ap`.`status` <> 'Paid' ;

-- --------------------------------------------------------

--
-- Structure for view `vw_ar_aging`
--
DROP TABLE IF EXISTS `vw_ar_aging`;

CREATE ALGORITHM=UNDEFINED DEFINER=`garrisonsayor`@`localhost` SQL SECURITY DEFINER VIEW `vw_ar_aging`  AS SELECT `ar`.`id` AS `id`, `ar`.`invoice_number` AS `invoice_number`, `ar`.`customer_name` AS `customer_name`, `ar`.`amount` AS `amount`, `ar`.`amount_paid` AS `amount_paid`, `ar`.`balance` AS `balance`, `ar`.`due_date` AS `due_date`, `ar`.`status` AS `status`, curdate() - `ar`.`due_date` AS `days_overdue`, CASE WHEN curdate() - `ar`.`due_date` <= 0 THEN 'Current' WHEN curdate() - `ar`.`due_date` between 1 and 30 THEN '1-30 Days' WHEN curdate() - `ar`.`due_date` between 31 and 60 THEN '31-60 Days' WHEN curdate() - `ar`.`due_date` between 61 and 90 THEN '61-90 Days' ELSE 'Over 90 Days' END AS `aging_bucket`, `coa_revenue`.`account_name` AS `revenue_account`, `coa_ar`.`account_name` AS `ar_account` FROM ((`account_receivables` `ar` left join `chart_of_accounts` `coa_revenue` on(`ar`.`revenue_account_code` = `coa_revenue`.`account_code`)) left join `chart_of_accounts` `coa_ar` on(`ar`.`ar_account_code` = `coa_ar`.`account_code`)) WHERE `ar`.`status` <> 'Paid' ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `access_rules`
--
ALTER TABLE `access_rules`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `account_payables`
--
ALTER TABLE `account_payables`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK_ksdxshem4kwwdqmkgj5d4b86w` (`invoice_number`),
  ADD UNIQUE KEY `invoice_number` (`invoice_number`),
  ADD KEY `idx_ap_invoice_number` (`invoice_number`),
  ADD KEY `idx_ap_status` (`status`),
  ADD KEY `idx_ap_due_date` (`due_date`),
  ADD KEY `fk_ap_account_code` (`ap_account_code`),
  ADD KEY `fk_expense_account_code` (`expense_account_code`),
  ADD KEY `idx_ap_vendor_name` (`vendor_name`);

--
-- Indexes for table `account_receivables`
--
ALTER TABLE `account_receivables`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK_1ue7t9ljdgu12sl8owhmf3ofg` (`invoice_number`),
  ADD UNIQUE KEY `invoice_number` (`invoice_number`),
  ADD KEY `idx_ar_invoice_number` (`invoice_number`),
  ADD KEY `idx_ar_status` (`status`),
  ADD KEY `idx_ar_due_date` (`due_date`),
  ADD KEY `idx_ar_customer_id` (`customer_id`),
  ADD KEY `fk_ar_account_code` (`ar_account_code`),
  ADD KEY `fk_revenue_account_code` (`revenue_account_code`),
  ADD KEY `idx_ar_customer_name` (`customer_name`);

--
-- Indexes for table `active_sessions`
--
ALTER TABLE `active_sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- Indexes for table `assets`
--
ALTER TABLE `assets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `asset_tag` (`asset_tag`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_asset_tag` (`asset_tag`),
  ADD KEY `idx_category` (`category_id`),
  ADD KEY `idx_assigned_to` (`assigned_to`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_assets_dept_status` (`department_id`,`status`);

--
-- Indexes for table `asset_categories`
--
ALTER TABLE `asset_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `idx_category_name` (`name`),
  ADD KEY `idx_active` (`is_active`);

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_manual_fallback` (`manual_fallback_flag`,`clock_in_time`),
  ADD KEY `idx_flagged_review` (`flagged_for_review`,`flagged_at`),
  ADD KEY `idx_clock_methods` (`clock_in_method`,`clock_out_method`);

--
-- Indexes for table `attendance_records`
--
ALTER TABLE `attendance_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `idx_user_date` (`user_id`,`clock_in_time`),
  ADD KEY `idx_date_range` (`clock_in_time`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_timestamp` (`timestamp`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_service_name` (`service_name`),
  ADD KEY `idx_audit_timestamp` (`timestamp`),
  ADD KEY `idx_audit_action` (`action`),
  ADD KEY `idx_audit_service_name` (`service_name`),
  ADD KEY `idx_audit_entity` (`entity_type`,`entity_id`),
  ADD KEY `idx_audit_result` (`result`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_user_timestamp` (`user_id`,`timestamp`),
  ADD KEY `idx_service_timestamp` (`service_name`,`timestamp`);

--
-- Indexes for table `audit_logs_archive`
--
ALTER TABLE `audit_logs_archive`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_archive_timestamp` (`timestamp`),
  ADD KEY `idx_archive_user_id` (`user_id`),
  ADD KEY `idx_archive_action` (`action`),
  ADD KEY `idx_archive_service_name` (`service_name`),
  ADD KEY `idx_archive_entity` (`entity_type`,`entity_id`);

--
-- Indexes for table `benefit_plans`
--
ALTER TABLE `benefit_plans`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `biometric_access_logs`
--
ALTER TABLE `biometric_access_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_time` (`user_id`,`access_time`),
  ADD KEY `idx_visitor_time` (`visitor_id`,`access_time`),
  ADD KEY `idx_type_success` (`biometric_type`,`success`),
  ADD KEY `idx_access_time` (`access_time`);

--
-- Indexes for table `biometric_templates`
--
ALTER TABLE `biometric_templates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_type` (`user_id`,`biometric_type`),
  ADD KEY `idx_visitor_type` (`visitor_id`,`biometric_type`),
  ADD KEY `idx_template_hash` (`template_hash`),
  ADD KEY `idx_active` (`is_active`);

--
-- Indexes for table `budgets`
--
ALTER TABLE `budgets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `idx_dept_year` (`department_id`,`fiscal_year`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_fiscal_year` (`fiscal_year`);

--
-- Indexes for table `budget_line_items`
--
ALTER TABLE `budget_line_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `account_id` (`account_id`),
  ADD KEY `idx_budget_account` (`budget_id`,`account_id`);

--
-- Indexes for table `budget_requests`
--
ALTER TABLE `budget_requests`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `business_permits`
--
ALTER TABLE `business_permits`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permit_number` (`permit_number`),
  ADD KEY `idx_permit_number` (`permit_number`),
  ADD KEY `idx_business_name` (`business_name`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_expiry_date` (`expiry_date`);

--
-- Indexes for table `chart_of_accounts`
--
ALTER TABLE `chart_of_accounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `account_code` (`account_code`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_account_code` (`account_code`),
  ADD KEY `idx_account_type` (`account_type`);

--
-- Indexes for table `compliance_records`
--
ALTER TABLE `compliance_records`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `idx_dept_name` (`name`),
  ADD KEY `idx_dept_active` (`is_active`),
  ADD KEY `head_of_department` (`head_of_department`);

--
-- Indexes for table `disposal_records`
--
ALTER TABLE `disposal_records`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `employee_benefits`
--
ALTER TABLE `employee_benefits`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK2oh1wjncot2ota1hdbb1w8fkb` (`benefit_plan_id`),
  ADD KEY `FK_employee_benefits_user_id` (`user_id`);

--
-- Indexes for table `employee_id_sequence`
--
ALTER TABLE `employee_id_sequence`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `employee_trainings`
--
ALTER TABLE `employee_trainings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKoqjkdernfw0bvadedfpvo3wy` (`training_course_id`),
  ADD KEY `FK_employee_trainings_user_id` (`user_id`);

--
-- Indexes for table `generated_reports`
--
ALTER TABLE `generated_reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_template_status` (`template_id`,`status`),
  ADD KEY `idx_generated_by` (`generated_by`),
  ADD KEY `idx_generated_at` (`generated_at`);

--
-- Indexes for table `guard_posts`
--
ALTER TABLE `guard_posts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `id_cards`
--
ALTER TABLE `id_cards`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `card_unique_identifier` (`card_unique_identifier`),
  ADD KEY `idx_id_cards_holder` (`holder_id`),
  ADD KEY `idx_id_cards_active` (`is_active`);

--
-- Indexes for table `invoice_sequences`
--
ALTER TABLE `invoice_sequences`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK_dsarrj63prry23baq5chfn4gg` (`sequence_type`);

--
-- Indexes for table `job_grades`
--
ALTER TABLE `job_grades`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `grade_code` (`grade_code`);

--
-- Indexes for table `journal_entries`
--
ALTER TABLE `journal_entries`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `entry_number` (`entry_number`),
  ADD UNIQUE KEY `UK_mmdunercevpa15d16opt1kjs4` (`reference`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `posted_by` (`posted_by`),
  ADD KEY `idx_entry_number` (`entry_number`),
  ADD KEY `idx_entry_date` (`entry_date`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_journal_entries_date_status` (`entry_date`,`status`);

--
-- Indexes for table `journal_entry_lines`
--
ALTER TABLE `journal_entry_lines`
  ADD PRIMARY KEY (`id`),
  ADD KEY `account_id` (`account_id`),
  ADD KEY `idx_journal_account` (`journal_entry_id`,`account_id`),
  ADD KEY `idx_line_number` (`journal_entry_id`,`line_number`);

--
-- Indexes for table `leave_approvals`
--
ALTER TABLE `leave_approvals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_leave_request_id` (`leave_request_id`),
  ADD KEY `idx_approver_id` (`approver_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `leave_balances`
--
ALTER TABLE `leave_balances`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_leave_year` (`user_id`,`leave_type_id`,`year`),
  ADD KEY `leave_type_id` (`leave_type_id`),
  ADD KEY `idx_user_year` (`user_id`,`year`);

--
-- Indexes for table `leave_blackouts`
--
ALTER TABLE `leave_blackouts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_date` (`user_id`,`blackout_date`),
  ADD KEY `fk_leave_blackouts_request` (`leave_request_id`);

--
-- Indexes for table `leave_requests`
--
ALTER TABLE `leave_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `leave_type_id` (`leave_type_id`),
  ADD KEY `reviewed_by` (`reviewed_by`),
  ADD KEY `idx_user_status` (`user_id`,`status`),
  ADD KEY `idx_date_range` (`start_date`,`end_date`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `leave_types`
--
ALTER TABLE `leave_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `idx_leave_type_name` (`name`),
  ADD KEY `idx_leave_type_active` (`is_active`);

--
-- Indexes for table `legal_cases`
--
ALTER TABLE `legal_cases`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `maintenance_records`
--
ALTER TABLE `maintenance_records`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_read` (`user_id`,`is_read`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_expires_at` (`expires_at`);

--
-- Indexes for table `payroll_runs`
--
ALTER TABLE `payroll_runs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_payroll_runs_created_by` (`created_by`),
  ADD KEY `fk_payroll_runs_closed_by` (`closed_by`);

--
-- Indexes for table `payslips`
--
ALTER TABLE `payslips`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKmaj3wje7q7n9vsjbjx91pmmrj` (`payroll_run_id`),
  ADD KEY `FK_payslips_user_id` (`user_id`);

--
-- Indexes for table `performance_reviews`
--
ALTER TABLE `performance_reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_performance_reviews_user_id` (`user_id`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `name_2` (`name`),
  ADD UNIQUE KEY `name_3` (`name`),
  ADD UNIQUE KEY `name_4` (`name`);

--
-- Indexes for table `pfm_exports`
--
ALTER TABLE `pfm_exports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_pfm_exports_payroll_run` (`payroll_run_id`),
  ADD KEY `fk_pfm_exports_exported_by` (`exported_by`);

--
-- Indexes for table `position_slots`
--
ALTER TABLE `position_slots`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_position_slots_dept` (`department_id`);

--
-- Indexes for table `procurement_requests`
--
ALTER TABLE `procurement_requests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `request_number` (`request_number`),
  ADD KEY `budget_id` (`budget_id`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `idx_request_number` (`request_number`),
  ADD KEY `idx_dept_status` (`department_id`,`status`),
  ADD KEY `idx_requested_by` (`requested_by`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `procurement_request_items`
--
ALTER TABLE `procurement_request_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_request_line` (`request_id`,`line_number`);

--
-- Indexes for table `qr_tokens`
--
ALTER TABLE `qr_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`);

--
-- Indexes for table `report_templates`
--
ALTER TABLE `report_templates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_report_type` (`report_type`),
  ADD KEY `idx_module` (`module`),
  ADD KEY `idx_active` (`is_active`);

--
-- Indexes for table `revenue_collections`
--
ALTER TABLE `revenue_collections`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `name_2` (`name`),
  ADD UNIQUE KEY `name_3` (`name`),
  ADD UNIQUE KEY `name_4` (`name`),
  ADD KEY `idx_role_name` (`name`);

--
-- Indexes for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_role_permissions_role` (`role_id`),
  ADD KEY `fk_role_permissions_permission` (`permission_id`);

--
-- Indexes for table `routes`
--
ALTER TABLE `routes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_name` (`name`);

--
-- Indexes for table `safety_incidents`
--
ALTER TABLE `safety_incidents`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `incident_number` (`incident_number`),
  ADD KEY `reported_by` (`reported_by`),
  ADD KEY `investigated_by` (`investigated_by`),
  ADD KEY `idx_incident_number` (`incident_number`),
  ADD KEY `idx_incident_date` (`incident_date`),
  ADD KEY `idx_type_severity` (`incident_type`,`severity`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `safety_inspections`
--
ALTER TABLE `safety_inspections`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `inspection_number` (`inspection_number`),
  ADD KEY `idx_inspection_number` (`inspection_number`),
  ADD KEY `idx_inspection_date` (`inspection_date`),
  ADD KEY `idx_inspector` (`inspector_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `security_incidents`
--
ALTER TABLE `security_incidents`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `social_media_posts`
--
ALTER TABLE `social_media_posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_platform` (`platform`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_scheduled_date` (`scheduled_date`);

--
-- Indexes for table `sops`
--
ALTER TABLE `sops`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `support_tickets`
--
ALTER TABLE `support_tickets`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `system_configs`
--
ALTER TABLE `system_configs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK_pk5mof051xp5r3e75s2e23s8s` (`config_key`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`),
  ADD KEY `updated_by` (`updated_by`),
  ADD KEY `idx_setting_key` (`setting_key`),
  ADD KEY `idx_public` (`is_public`);

--
-- Indexes for table `tax_assessments`
--
ALTER TABLE `tax_assessments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `training_courses`
--
ALTER TABLE `training_courses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `employee_id` (`employee_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `role_id` (`role_id`),
  ADD KEY `manager_id` (`manager_id`),
  ADD KEY `idx_employee_id` (`employee_id`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_dept_role` (`department_id`,`role_id`),
  ADD KEY `idx_active` (`is_active`),
  ADD KEY `idx_users_dept_active` (`department_id`,`is_active`),
  ADD KEY `fk_users_job_grade` (`job_grade_id`),
  ADD KEY `fk_users_provisioned_by` (`provisioned_by`);

--
-- Indexes for table `vendors`
--
ALTER TABLE `vendors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `vendor_code` (`vendor_code`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_vendor_code` (`vendor_code`),
  ADD KEY `idx_company_name` (`company_name`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_active` (`is_active`);

--
-- Indexes for table `visitors`
--
ALTER TABLE `visitors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `visitor_id` (`visitor_id`),
  ADD KEY `idx_name` (`first_name`,`last_name`),
  ADD KEY `idx_company` (`company`),
  ADD KEY `idx_employee_to_visit` (`employee_to_visit`);

--
-- Indexes for table `visitor_checkins`
--
ALTER TABLE `visitor_checkins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `visitor_id` (`visitor_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_host_employee` (`host_employee_id`);

--
-- Indexes for table `visitor_logs`
--
ALTER TABLE `visitor_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `biometric_template_id` (`biometric_template_id`),
  ADD KEY `idx_visitor_logs_visitor` (`visitor_id`),
  ADD KEY `idx_visitor_logs_employee` (`employee_to_visit_id`),
  ADD KEY `idx_visitor_logs_checkin` (`check_in_time`),
  ADD KEY `idx_visitor_logs_checkout` (`check_out_time`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `access_rules`
--
ALTER TABLE `access_rules`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `account_payables`
--
ALTER TABLE `account_payables`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `account_receivables`
--
ALTER TABLE `account_receivables`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `assets`
--
ALTER TABLE `assets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `asset_categories`
--
ALTER TABLE `asset_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `attendance_records`
--
ALTER TABLE `attendance_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=397;

--
-- AUTO_INCREMENT for table `benefit_plans`
--
ALTER TABLE `benefit_plans`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `biometric_access_logs`
--
ALTER TABLE `biometric_access_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `biometric_templates`
--
ALTER TABLE `biometric_templates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `budgets`
--
ALTER TABLE `budgets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `budget_line_items`
--
ALTER TABLE `budget_line_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `budget_requests`
--
ALTER TABLE `budget_requests`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `business_permits`
--
ALTER TABLE `business_permits`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `chart_of_accounts`
--
ALTER TABLE `chart_of_accounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `compliance_records`
--
ALTER TABLE `compliance_records`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `disposal_records`
--
ALTER TABLE `disposal_records`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employee_benefits`
--
ALTER TABLE `employee_benefits`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employee_id_sequence`
--
ALTER TABLE `employee_id_sequence`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `employee_trainings`
--
ALTER TABLE `employee_trainings`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `generated_reports`
--
ALTER TABLE `generated_reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `guard_posts`
--
ALTER TABLE `guard_posts`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `id_cards`
--
ALTER TABLE `id_cards`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `invoice_sequences`
--
ALTER TABLE `invoice_sequences`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `job_grades`
--
ALTER TABLE `job_grades`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=127;

--
-- AUTO_INCREMENT for table `journal_entries`
--
ALTER TABLE `journal_entries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=81;

--
-- AUTO_INCREMENT for table `journal_entry_lines`
--
ALTER TABLE `journal_entry_lines`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `leave_balances`
--
ALTER TABLE `leave_balances`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=265;

--
-- AUTO_INCREMENT for table `leave_blackouts`
--
ALTER TABLE `leave_blackouts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `leave_requests`
--
ALTER TABLE `leave_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `leave_types`
--
ALTER TABLE `leave_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `legal_cases`
--
ALTER TABLE `legal_cases`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `maintenance_records`
--
ALTER TABLE `maintenance_records`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `payroll_runs`
--
ALTER TABLE `payroll_runs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `payslips`
--
ALTER TABLE `payslips`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `performance_reviews`
--
ALTER TABLE `performance_reviews`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `pfm_exports`
--
ALTER TABLE `pfm_exports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `position_slots`
--
ALTER TABLE `position_slots`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `procurement_requests`
--
ALTER TABLE `procurement_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `procurement_request_items`
--
ALTER TABLE `procurement_request_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `qr_tokens`
--
ALTER TABLE `qr_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `report_templates`
--
ALTER TABLE `report_templates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `revenue_collections`
--
ALTER TABLE `revenue_collections`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `role_permissions`
--
ALTER TABLE `role_permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=162;

--
-- AUTO_INCREMENT for table `safety_incidents`
--
ALTER TABLE `safety_incidents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `safety_inspections`
--
ALTER TABLE `safety_inspections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `security_incidents`
--
ALTER TABLE `security_incidents`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `social_media_posts`
--
ALTER TABLE `social_media_posts`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `sops`
--
ALTER TABLE `sops`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `support_tickets`
--
ALTER TABLE `support_tickets`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `system_configs`
--
ALTER TABLE `system_configs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `system_settings`
--
ALTER TABLE `system_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `tax_assessments`
--
ALTER TABLE `tax_assessments`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `training_courses`
--
ALTER TABLE `training_courses`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `vendors`
--
ALTER TABLE `vendors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `visitors`
--
ALTER TABLE `visitors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `visitor_checkins`
--
ALTER TABLE `visitor_checkins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `visitor_logs`
--
ALTER TABLE `visitor_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `account_payables`
--
ALTER TABLE `account_payables`
  ADD CONSTRAINT `fk_ap_account_code` FOREIGN KEY (`ap_account_code`) REFERENCES `chart_of_accounts` (`account_code`),
  ADD CONSTRAINT `fk_expense_account_code` FOREIGN KEY (`expense_account_code`) REFERENCES `chart_of_accounts` (`account_code`);

--
-- Constraints for table `account_receivables`
--
ALTER TABLE `account_receivables`
  ADD CONSTRAINT `fk_ar_account_code` FOREIGN KEY (`ar_account_code`) REFERENCES `chart_of_accounts` (`account_code`),
  ADD CONSTRAINT `fk_revenue_account_code` FOREIGN KEY (`revenue_account_code`) REFERENCES `chart_of_accounts` (`account_code`);

--
-- Constraints for table `assets`
--
ALTER TABLE `assets`
  ADD CONSTRAINT `assets_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `asset_categories` (`id`),
  ADD CONSTRAINT `assets_ibfk_2` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `assets_ibfk_3` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`),
  ADD CONSTRAINT `assets_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `attendance_records`
--
ALTER TABLE `attendance_records`
  ADD CONSTRAINT `attendance_records_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `attendance_records_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `fk_audit_logs_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `biometric_access_logs`
--
ALTER TABLE `biometric_access_logs`
  ADD CONSTRAINT `biometric_access_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `biometric_templates`
--
ALTER TABLE `biometric_templates`
  ADD CONSTRAINT `biometric_templates_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `budgets`
--
ALTER TABLE `budgets`
  ADD CONSTRAINT `budgets_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`),
  ADD CONSTRAINT `budgets_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `budgets_ibfk_3` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `budget_line_items`
--
ALTER TABLE `budget_line_items`
  ADD CONSTRAINT `budget_line_items_ibfk_1` FOREIGN KEY (`budget_id`) REFERENCES `budgets` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `budget_line_items_ibfk_2` FOREIGN KEY (`account_id`) REFERENCES `chart_of_accounts` (`id`);

--
-- Constraints for table `chart_of_accounts`
--
ALTER TABLE `chart_of_accounts`
  ADD CONSTRAINT `chart_of_accounts_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `departments`
--
ALTER TABLE `departments`
  ADD CONSTRAINT `departments_ibfk_1` FOREIGN KEY (`head_of_department`) REFERENCES `users` (`id`);

--
-- Constraints for table `employee_benefits`
--
ALTER TABLE `employee_benefits`
  ADD CONSTRAINT `FK2oh1wjncot2ota1hdbb1w8fkb` FOREIGN KEY (`benefit_plan_id`) REFERENCES `benefit_plans` (`id`),
  ADD CONSTRAINT `FK_employee_benefits_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `employee_trainings`
--
ALTER TABLE `employee_trainings`
  ADD CONSTRAINT `FK_employee_trainings_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FKoqjkdernfw0bvadedfpvo3wy` FOREIGN KEY (`training_course_id`) REFERENCES `training_courses` (`id`);

--
-- Constraints for table `generated_reports`
--
ALTER TABLE `generated_reports`
  ADD CONSTRAINT `generated_reports_ibfk_1` FOREIGN KEY (`template_id`) REFERENCES `report_templates` (`id`),
  ADD CONSTRAINT `generated_reports_ibfk_2` FOREIGN KEY (`generated_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `id_cards`
--
ALTER TABLE `id_cards`
  ADD CONSTRAINT `id_cards_ibfk_1` FOREIGN KEY (`holder_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `journal_entries`
--
ALTER TABLE `journal_entries`
  ADD CONSTRAINT `journal_entries_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `journal_entries_ibfk_2` FOREIGN KEY (`posted_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `journal_entry_lines`
--
ALTER TABLE `journal_entry_lines`
  ADD CONSTRAINT `journal_entry_lines_ibfk_1` FOREIGN KEY (`journal_entry_id`) REFERENCES `journal_entries` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `journal_entry_lines_ibfk_2` FOREIGN KEY (`account_id`) REFERENCES `chart_of_accounts` (`id`);

--
-- Constraints for table `leave_balances`
--
ALTER TABLE `leave_balances`
  ADD CONSTRAINT `leave_balances_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `leave_balances_ibfk_2` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types` (`id`);

--
-- Constraints for table `leave_blackouts`
--
ALTER TABLE `leave_blackouts`
  ADD CONSTRAINT `fk_leave_blackouts_request` FOREIGN KEY (`leave_request_id`) REFERENCES `leave_requests` (`id`),
  ADD CONSTRAINT `fk_leave_blackouts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `leave_requests`
--
ALTER TABLE `leave_requests`
  ADD CONSTRAINT `leave_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `leave_requests_ibfk_2` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types` (`id`),
  ADD CONSTRAINT `leave_requests_ibfk_3` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `payroll_runs`
--
ALTER TABLE `payroll_runs`
  ADD CONSTRAINT `fk_payroll_runs_closed_by` FOREIGN KEY (`closed_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_payroll_runs_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `payslips`
--
ALTER TABLE `payslips`
  ADD CONSTRAINT `FK_payslips_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `performance_reviews`
--
ALTER TABLE `performance_reviews`
  ADD CONSTRAINT `FK_performance_reviews_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `pfm_exports`
--
ALTER TABLE `pfm_exports`
  ADD CONSTRAINT `fk_pfm_exports_exported_by` FOREIGN KEY (`exported_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_pfm_exports_payroll_run` FOREIGN KEY (`payroll_run_id`) REFERENCES `payroll_runs` (`id`);

--
-- Constraints for table `position_slots`
--
ALTER TABLE `position_slots`
  ADD CONSTRAINT `fk_position_slots_dept` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`);

--
-- Constraints for table `procurement_requests`
--
ALTER TABLE `procurement_requests`
  ADD CONSTRAINT `procurement_requests_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`),
  ADD CONSTRAINT `procurement_requests_ibfk_2` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `procurement_requests_ibfk_3` FOREIGN KEY (`budget_id`) REFERENCES `budgets` (`id`),
  ADD CONSTRAINT `procurement_requests_ibfk_4` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `procurement_request_items`
--
ALTER TABLE `procurement_request_items`
  ADD CONSTRAINT `procurement_request_items_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `procurement_requests` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `report_templates`
--
ALTER TABLE `report_templates`
  ADD CONSTRAINT `report_templates_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `fk_role_permissions_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `safety_incidents`
--
ALTER TABLE `safety_incidents`
  ADD CONSTRAINT `safety_incidents_ibfk_1` FOREIGN KEY (`reported_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `safety_incidents_ibfk_2` FOREIGN KEY (`investigated_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `safety_inspections`
--
ALTER TABLE `safety_inspections`
  ADD CONSTRAINT `safety_inspections_ibfk_1` FOREIGN KEY (`inspector_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD CONSTRAINT `system_settings_ibfk_1` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_job_grade` FOREIGN KEY (`job_grade_id`) REFERENCES `job_grades` (`id`),
  ADD CONSTRAINT `fk_users_provisioned_by` FOREIGN KEY (`provisioned_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`),
  ADD CONSTRAINT `users_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  ADD CONSTRAINT `users_ibfk_3` FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `vendors`
--
ALTER TABLE `vendors`
  ADD CONSTRAINT `vendors_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `visitors`
--
ALTER TABLE `visitors`
  ADD CONSTRAINT `visitors_ibfk_1` FOREIGN KEY (`employee_to_visit`) REFERENCES `users` (`id`);

--
-- Constraints for table `visitor_checkins`
--
ALTER TABLE `visitor_checkins`
  ADD CONSTRAINT `idx_visitor_checkin` FOREIGN KEY (`visitor_id`) REFERENCES `visitors` (`visitor_id`),
  ADD CONSTRAINT `visitor_checkins_ibfk_2` FOREIGN KEY (`host_employee_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `visitor_checkins_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `visitor_logs`
--
ALTER TABLE `visitor_logs`
  ADD CONSTRAINT `visitor_logs_ibfk_1` FOREIGN KEY (`visitor_id`) REFERENCES `visitors` (`id`),
  ADD CONSTRAINT `visitor_logs_ibfk_2` FOREIGN KEY (`employee_to_visit_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `visitor_logs_ibfk_3` FOREIGN KEY (`biometric_template_id`) REFERENCES `biometric_templates` (`id`);

DELIMITER $$
--
-- Events
--
CREATE DEFINER=`garrisonsayor`@`localhost` EVENT `archive_old_audit_logs` ON SCHEDULE EVERY 1 DAY STARTS '2026-01-24 02:00:00' ON COMPLETION NOT PRESERVE ENABLE DO BEGIN

  DECLARE archived_count INT DEFAULT 0;

  

  -- Insert logs older than 7 days into archive

  INSERT INTO audit_logs_archive (

    id, user_id, action, timestamp, details, service_name, 

    ip_address, request_id, session_id, entity_type, entity_id, result

  )

  SELECT 

    id, user_id, action, timestamp, details, service_name,

    ip_address, request_id, session_id, entity_type, entity_id, result

  FROM audit_logs

  WHERE timestamp < DATE_SUB(NOW(), INTERVAL 7 DAY);

  

  SET archived_count = ROW_COUNT();

  

  -- Delete archived logs from main table

  DELETE FROM audit_logs

  WHERE timestamp < DATE_SUB(NOW(), INTERVAL 7 DAY);

  

  -- Log the archival operation

  INSERT INTO audit_logs (user_id, action, timestamp, details, service_name, result)

  VALUES (

    NULL,

    'SYSTEM_ARCHIVE_AUDIT_LOGS',

    NOW(),

    JSON_OBJECT('archived_count', archived_count),

    'system',

    'success'

  );

END$$

DELIMITER ;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
