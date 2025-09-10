-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 01, 2025 at 09:40 PM
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

-- --------------------------------------------------------

--
-- Table structure for table `account_payables`
--

CREATE TABLE `account_payables` (
  `id` bigint(20) NOT NULL,
  `amount` decimal(38,2) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `due_date` date NOT NULL,
  `vendor_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `account_receivables`
--

CREATE TABLE `account_receivables` (
  `id` bigint(20) NOT NULL,
  `amount` decimal(38,2) NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `due_date` date NOT NULL
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
  `asset_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `assets`
--

INSERT INTO `assets` (`id`, `asset_tag`, `name`, `description`, `category_id`, `serial_number`, `model`, `manufacturer`, `purchase_date`, `purchase_cost`, `current_value`, `depreciation_rate`, `location`, `assigned_to`, `department_id`, `status`, `warranty_expiry`, `last_maintenance_date`, `next_maintenance_date`, `created_by`, `created_at`, `updated_at`, `acquisition_cost`, `asset_name`) VALUES
(1, 'COMP001', 'Dell Laptop - HR Manager', 'Dell Latitude 5520 Laptop', 1, 'DL5520001', 'Latitude 5520', 'Dell', '2024-01-15', 1200.00, 1200.00, NULL, 'HR Office', 6, 1, 'active', NULL, NULL, NULL, 1, '2025-07-07 13:16:01', '2025-07-07 13:16:01', 0.00, ''),
(2, 'COMP002', 'HP Desktop - Finance', 'HP EliteDesk 800 G8', 1, 'HP800G8001', 'EliteDesk 800 G8', 'HP', '2024-01-20', 800.00, 800.00, NULL, 'Finance Department', 7, 2, 'active', NULL, NULL, NULL, 1, '2025-07-07 13:16:01', '2025-07-07 13:16:01', 0.00, ''),
(3, 'FURN001', 'Executive Desk - HR Head', 'Wooden executive desk', 2, 'ED001', 'Executive Series', 'Office Pro', '2024-01-10', 500.00, 500.00, NULL, 'HR Head Office', 2, 1, 'active', NULL, NULL, NULL, 1, '2025-07-07 13:16:01', '2025-07-07 13:16:01', 0.00, ''),
(4, 'VEHI001', 'Toyota Camry - Official', 'Official vehicle for department heads', 3, 'TC2024001', 'Camry 2024', 'Toyota', '2024-02-01', 25000.00, 25000.00, NULL, 'Parking Lot A', NULL, 4, 'active', NULL, NULL, NULL, 1, '2025-07-07 13:16:01', '2025-07-07 13:16:01', 0.00, ''),
(5, 'SOFT001', 'Microsoft Office 365', 'Office productivity suite license', 4, 'MS365-001', 'Office 365 Business', 'Microsoft', '2024-01-01', 150.00, 150.00, NULL, 'IT Department', NULL, 3, 'active', NULL, NULL, NULL, 1, '2025-07-07 13:16:01', '2025-07-07 13:16:01', 0.00, '');

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
  `status` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`id`, `clock_in_time`, `clock_out_time`, `user_id`, `status`) VALUES
(1, '2024-06-01 08:30:00.000000', '2024-06-01 17:15:00.000000', 1, NULL),
(2, '2024-05-31 08:45:00.000000', '2024-05-31 17:30:00.000000', 1, NULL),
(3, '2024-06-01 08:30:00.000000', '2024-06-01 17:15:00.000000', 1, NULL),
(4, '2024-05-31 08:45:00.000000', '2024-05-31 17:30:00.000000', 1, NULL),
(5, '2024-06-01 08:30:00.000000', '2024-06-01 17:15:00.000000', 2, NULL),
(6, '2024-05-31 08:45:00.000000', '2024-05-31 17:30:00.000000', 2, NULL),
(7, '2024-06-01 08:30:00.000000', '2024-06-01 17:15:00.000000', 3, NULL),
(8, '2024-05-31 08:45:00.000000', '2024-05-31 17:30:00.000000', 3, NULL),
(9, '2024-06-01 08:30:00.000000', '2024-06-01 17:15:00.000000', 4, NULL),
(10, '2024-05-31 08:45:00.000000', '2024-05-31 17:30:00.000000', 4, NULL),
(11, '2024-06-01 08:30:00.000000', '2024-06-01 17:15:00.000000', 5, NULL),
(12, '2024-05-31 08:45:00.000000', '2024-05-31 17:30:00.000000', 5, NULL),
(13, '2024-06-01 08:30:00.000000', '2024-06-01 17:15:00.000000', 6, NULL),
(14, '2024-05-31 08:45:00.000000', '2024-05-31 17:30:00.000000', 6, NULL),
(15, '2024-06-01 08:30:00.000000', '2024-06-01 17:15:00.000000', 7, NULL),
(16, '2024-05-31 08:45:00.000000', '2024-05-31 17:30:00.000000', 7, NULL),
(17, '2024-06-01 08:30:00.000000', '2024-06-01 17:15:00.000000', 8, NULL),
(18, '2024-05-31 08:45:00.000000', '2024-05-31 17:30:00.000000', 8, NULL),
(19, '2024-06-01 08:30:00.000000', '2024-06-01 17:15:00.000000', 9, NULL),
(20, '2024-05-31 08:45:00.000000', '2024-05-31 17:30:00.000000', 9, NULL),
(21, '2024-06-01 08:30:00.000000', '2024-06-01 17:15:00.000000', 10, NULL),
(22, '2024-05-31 08:45:00.000000', '2024-05-31 17:30:00.000000', 10, NULL),
(23, '2024-06-01 08:30:00.000000', '2024-06-01 17:15:00.000000', 11, NULL),
(24, '2024-05-31 08:45:00.000000', '2024-05-31 17:30:00.000000', 11, NULL),
(25, '2024-06-01 08:30:00.000000', '2024-06-01 17:15:00.000000', 12, NULL),
(26, '2024-05-31 08:45:00.000000', '2024-05-31 17:30:00.000000', 12, NULL),
(27, '2024-06-01 08:30:00.000000', '2024-06-01 17:15:00.000000', 13, NULL),
(28, '2024-05-31 08:45:00.000000', '2024-05-31 17:30:00.000000', 13, NULL),
(29, '2024-06-01 08:30:00.000000', '2024-06-01 17:15:00.000000', 14, NULL),
(30, '2024-05-31 08:45:00.000000', '2024-05-31 17:30:00.000000', 14, NULL),
(31, '2024-06-01 08:30:00.000000', '2024-06-01 17:15:00.000000', 15, NULL),
(32, '2024-05-31 08:45:00.000000', '2024-05-31 17:30:00.000000', 15, NULL),
(33, '2024-06-01 08:30:00.000000', '2024-06-01 17:15:00.000000', 19, NULL),
(34, '2024-05-31 08:45:00.000000', '2024-05-31 17:30:00.000000', 19, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `attendance_records`
--

CREATE TABLE `attendance_records` (
  `id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `clock_in_time` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `clock_out_time` timestamp NULL DEFAULT NULL,
  `clock_in_method` enum('manual','biometric_face','biometric_fingerprint','card') DEFAULT 'manual',
  `clock_out_method` enum('manual','biometric_face','biometric_fingerprint','card') DEFAULT 'manual',
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `attendance_records`
--

INSERT INTO `attendance_records` (`id`, `tenant_id`, `user_id`, `clock_in_time`, `clock_out_time`, `clock_in_method`, `clock_out_method`, `total_hours`, `overtime_hours`, `break_duration`, `location`, `ip_address`, `notes`, `status`, `approved_by`, `approved_at`, `created_at`, `updated_at`) VALUES
(1, 0, 9, '2024-12-01 06:00:00', '2024-12-01 15:00:00', 'manual', 'manual', 8.00, 0.00, 0, NULL, NULL, NULL, 'present', NULL, NULL, '2025-07-07 13:16:01', '2025-07-07 13:16:01'),
(2, 0, 10, '2024-12-01 06:15:00', '2024-12-01 15:15:00', 'biometric_face', 'biometric_face', 8.00, 0.00, 0, NULL, NULL, NULL, 'late', NULL, NULL, '2025-07-07 13:16:01', '2025-07-07 13:16:01'),
(3, 0, 11, '2024-12-01 06:00:00', '2024-12-01 16:00:00', 'manual', 'manual', 9.00, 0.00, 0, NULL, NULL, NULL, 'present', NULL, NULL, '2025-07-07 13:16:01', '2025-07-07 13:16:01'),
(4, 0, 12, '2024-12-01 06:30:00', '2024-12-01 15:30:00', 'manual', 'manual', 8.00, 0.00, 0, NULL, NULL, NULL, 'late', NULL, NULL, '2025-07-07 13:16:01', '2025-07-07 13:16:01'),
(5, 0, 9, '2024-12-02 06:00:00', '2024-12-02 15:00:00', 'manual', 'manual', 8.00, 0.00, 0, NULL, NULL, NULL, 'present', NULL, NULL, '2025-07-07 13:16:01', '2025-07-07 13:16:01'),
(6, 0, 10, '2024-12-02 06:00:00', '2024-12-02 15:00:00', 'biometric_face', 'biometric_face', 8.00, 0.00, 0, NULL, NULL, NULL, 'present', NULL, NULL, '2025-07-07 13:16:01', '2025-07-07 13:16:01'),
(7, 0, 11, '2024-12-02 06:00:00', '2024-12-02 15:30:00', 'manual', 'manual', 8.50, 0.00, 0, NULL, NULL, NULL, 'present', NULL, NULL, '2025-07-07 13:16:01', '2025-07-07 13:16:01'),
(8, 0, 12, '2024-12-02 06:00:00', '2024-12-02 15:00:00', 'manual', 'manual', 8.00, 0.00, 0, NULL, NULL, NULL, 'present', NULL, NULL, '2025-07-07 13:16:01', '2025-07-07 13:16:01');

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
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `table_name` varchar(50) DEFAULT NULL,
  `record_id` int(11) DEFAULT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_values`)),
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_values`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `details` varchar(255) DEFAULT NULL,
  `performed_by` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `table_name`, `record_id`, `old_values`, `new_values`, `ip_address`, `user_agent`, `timestamp`, `details`, `performed_by`) VALUES
(1, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-07 16:11:45', NULL, ''),
(2, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-07 16:20:22', NULL, ''),
(3, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-07 16:24:35', NULL, ''),
(4, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-07 16:30:02', NULL, ''),
(5, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-07 21:52:40', NULL, ''),
(6, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-07 21:53:32', NULL, ''),
(7, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-07 21:55:51', NULL, ''),
(8, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-07 22:09:23', NULL, ''),
(9, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-07 22:10:11', NULL, ''),
(10, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-07 22:39:42', NULL, ''),
(11, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-07 23:15:01', NULL, ''),
(12, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-07 23:15:39', NULL, ''),
(13, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-07 23:16:40', NULL, ''),
(14, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-07 23:21:17', NULL, ''),
(15, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-08 01:33:31', NULL, ''),
(16, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-08 07:12:59', NULL, ''),
(17, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-08 07:21:26', NULL, ''),
(18, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-08 07:24:11', NULL, ''),
(19, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-08 07:34:49', NULL, ''),
(20, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-08 08:05:51', NULL, ''),
(21, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-08 09:28:38', NULL, ''),
(22, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-08 21:35:17', NULL, ''),
(23, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-10 08:38:23', NULL, ''),
(24, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-10 21:12:55', NULL, ''),
(25, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-10 21:43:06', NULL, ''),
(26, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-10 21:50:55', NULL, ''),
(27, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-11 13:29:58', NULL, ''),
(28, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-14 18:40:19', NULL, ''),
(29, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-14 20:18:30', NULL, ''),
(30, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-14 22:30:34', NULL, ''),
(31, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-15 00:38:43', NULL, ''),
(32, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-15 01:50:25', NULL, ''),
(33, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-15 15:25:52', NULL, ''),
(34, 20, 'UPDATE', 'users', 20, '{\"employee_id\": \"EMP017\", \"email\": \"issaadamx@gmail.com\", \"first_name\": \"Issa\", \"last_name\": \"Adams\"}', '{\"employee_id\": \"EMP017\", \"email\": \"issaadamx@gmail.com\", \"first_name\": \"Issa\", \"last_name\": \"Adams\"}', NULL, NULL, '2025-07-15 15:32:44', NULL, ''),
(35, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-15 21:35:28', NULL, ''),
(36, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-15 22:37:29', NULL, ''),
(37, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-15 23:48:03', NULL, ''),
(38, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-16 09:14:02', NULL, ''),
(39, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-16 09:14:27', NULL, ''),
(40, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-16 09:37:42', NULL, ''),
(41, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-16 10:50:45', NULL, ''),
(42, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-16 10:59:50', NULL, ''),
(43, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-16 11:06:56', NULL, ''),
(44, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-16 11:24:40', NULL, ''),
(45, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-16 12:25:26', NULL, ''),
(46, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-16 13:49:33', NULL, ''),
(47, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-16 15:36:53', NULL, ''),
(48, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-24 12:51:51', NULL, ''),
(49, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-24 13:52:53', NULL, ''),
(50, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-24 14:15:05', NULL, ''),
(51, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-24 15:32:02', NULL, ''),
(52, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-24 16:47:41', NULL, ''),
(53, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-24 18:18:20', NULL, ''),
(54, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-24 19:22:04', NULL, ''),
(55, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-30 10:39:14', NULL, ''),
(56, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-30 14:01:48', NULL, ''),
(57, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-07-30 16:03:01', NULL, ''),
(58, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-08-01 12:34:06', NULL, ''),
(59, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-08-08 01:17:11', NULL, ''),
(60, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-08-08 02:07:09', NULL, ''),
(61, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-08-08 03:27:05', NULL, ''),
(62, 19, 'UPDATE', 'users', 19, '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', '{\"employee_id\": \"EMP016\", \"email\": \"garrisonsay@gmail.com\", \"first_name\": \"Crafty\", \"last_name\": \"Dev\"}', NULL, NULL, '2025-09-01 19:03:59', NULL, ''),
(63, 20, 'UPDATE', 'users', 20, '{\"employee_id\": \"EMP017\", \"email\": \"issaadamx@gmail.com\", \"first_name\": \"Issa\", \"last_name\": \"Adams\"}', '{\"employee_id\": \"EMP017\", \"email\": \"issaadamx@gmail.com\", \"first_name\": \"Issa\", \"last_name\": \"Adams\"}', NULL, NULL, '2025-09-01 19:08:43', NULL, '');

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
  `amount` decimal(38,2) NOT NULL,
  `budget_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `budgets`
--

INSERT INTO `budgets` (`id`, `name`, `description`, `department_id`, `fiscal_year`, `start_date`, `end_date`, `total_amount`, `allocated_amount`, `spent_amount`, `status`, `created_by`, `approved_by`, `approved_at`, `created_at`, `updated_at`, `amount`, `budget_name`) VALUES
(1, 'HR Department Budget 2024', 'Annual budget for Human Resources', 1, 2024, '2024-01-01', '2024-12-31', 500000.00, 0.00, 0.00, 'approved', 2, NULL, NULL, '2025-07-07 13:16:01', '2025-07-07 13:16:01', 0.00, ''),
(2, 'Finance Department Budget 2024', 'Annual budget for Finance Department', 2, 2024, '2024-01-01', '2024-12-31', 750000.00, 0.00, 0.00, 'approved', 3, NULL, NULL, '2025-07-07 13:16:01', '2025-07-07 13:16:01', 0.00, ''),
(3, 'IT Department Budget 2024', 'Annual budget for Information Technology', 3, 2024, '2024-01-01', '2024-12-31', 1000000.00, 0.00, 0.00, 'approved', 4, NULL, NULL, '2025-07-07 13:16:01', '2025-07-07 13:16:01', 0.00, ''),
(4, 'Operations Budget 2024', 'Annual budget for Operations', 4, 2024, '2024-01-01', '2024-12-31', 800000.00, 0.00, 0.00, 'approved', 5, NULL, NULL, '2025-07-07 13:16:01', '2025-07-07 13:16:01', 0.00, '');

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
  `requested_amount` double DEFAULT NULL,
  `requested_by` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `budget_requests`
--

INSERT INTO `budget_requests` (`id`, `category`, `department`, `justification`, `request_date`, `requested_amount`, `requested_by`, `status`) VALUES
(1, 'Office Supplies', 'Finance', 'Need to replenish office supplies', '2025-07-24', 500, 'Christopher Leabon', 'Pending'),
(2, 'Software Licenses', 'Information Technology', 'Purchase new accounting software licenses', '2025-07-24', 1200, 'Christopher Leabon', 'Pending'),
(3, 'Training', 'Planning and Development', 'Budget for staff training and development', '2025-07-24', 800, 'Robert Wilson', 'Pending'),
(4, 'Equipment', 'Information Technology', 'Upgrade computers and peripherals', '2025-07-24', 2500, 'Robert Wilson', 'Pending'),
(5, 'Consulting Services', 'Human Resources', 'Hire external consultants for audit', '2025-07-24', 3000, 'Crafty Dev', 'Pending');

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
(1, '1000', 'Current Assets', 'asset', 'Short term assets', 1, 1, '2025-07-07 13:16:00', '2025-07-24 16:08:13'),
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
(31, '5800', 'Training and Development', 'expense', 'Employee training', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:01');

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
  `tenant_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `head_of_department` int(11) DEFAULT NULL,
  `budget_allocation` decimal(15,2) DEFAULT 0.00,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `tenant_id`, `name`, `description`, `head_of_department`, `budget_allocation`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 0, 'Human Resources', 'Manages employee relations, recruitment, and HR policies', 2, 500000.00, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(2, 0, 'Finance', 'Handles financial planning, accounting, and budget management', 3, 750000.00, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(3, 0, 'Information Technology', 'Manages IT infrastructure, software development, and technical support', 4, 1000000.00, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(4, 0, 'Operations', 'Oversees daily operations and process management', 5, 800000.00, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(5, 0, 'Legal Affairs', 'Handles legal matters, contracts, and compliance', NULL, 400000.00, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(6, 0, 'Procurement', 'Manages purchasing, vendor relations, and supply chain', NULL, 600000.00, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(7, 0, 'Asset Management', 'Tracks and maintains organizational assets', NULL, 300000.00, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(8, 0, 'Public Relations', 'Manages public communications and media relations', NULL, 250000.00, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(9, 0, 'Planning & Development', 'Strategic planning and organizational development', NULL, 450000.00, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(10, 0, 'Transportation', 'Manages fleet and transportation services', NULL, 350000.00, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(11, 0, 'Health & Safety', 'Ensures workplace safety and health compliance', NULL, 200000.00, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(12, 0, 'Revenue & Tax', 'Handles revenue collection and tax management', NULL, 550000.00, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(13, 0, 'Auto-created department', NULL, NULL, 0.00, 1, '2025-07-07 15:56:32', '2025-07-07 15:56:32');

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
  `amount` decimal(38,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `journal_entries`
--

INSERT INTO `journal_entries` (`id`, `entry_number`, `entry_date`, `description`, `reference_number`, `total_debit`, `total_credit`, `status`, `created_by`, `posted_by`, `posted_at`, `created_at`, `updated_at`, `account_code`, `amount`) VALUES
(38, 'JE-20250728-001-L01', '2025-07-28', 'Cash Sale of Services (Bank Account)', 'INV-001', 5000.00, 0.00, 'posted', 1, 1, '2025-07-28 07:15:00', '2025-07-28 07:10:00', '2025-07-28 07:15:00', '1120', 5000.00),
(39, 'JE-20250728-001-L02', '2025-07-28', 'Cash Sale of Services (Service Revenue)', 'INV-001', 0.00, 5000.00, 'posted', 1, 1, '2025-07-28 07:15:00', '2025-07-28 07:10:00', '2025-07-28 07:15:00', '4100', 5000.00),
(40, 'JE-20250728-002-L01', '2025-07-28', 'Office Supplies Purchase (Expense)', 'PO-005', 750.00, 0.00, 'posted', 1, 1, '2025-07-28 08:00:00', '2025-07-28 07:55:00', '2025-07-28 08:00:00', '6100', 750.00),
(41, 'JE-20250728-002-L02', '2025-07-28', 'Office Supplies Purchase (Bank Account)', 'PO-005', 0.00, 750.00, 'posted', 1, 1, '2025-07-28 08:00:00', '2025-07-28 07:55:00', '2025-07-28 08:00:00', '1120', 750.00),
(42, 'JE-20250728-003-L01', '2025-07-28', 'Payment of Accounts Payable (AP)', 'CHK-1001', 2500.00, 0.00, 'posted', 1, 1, '2025-07-28 09:30:00', '2025-07-28 09:25:00', '2025-07-28 09:30:00', '2100', 2500.00),
(43, 'JE-20250728-003-L02', '2025-07-28', 'Payment of Accounts Payable (Bank Account)', 'CHK-1001', 0.00, 2500.00, 'posted', 1, 1, '2025-07-28 09:30:00', '2025-07-28 09:25:00', '2025-07-28 09:30:00', '1120', 2500.00),
(44, 'JE-20250729-004-L01', '2025-07-29', 'Received Grant Revenue (Bank Account)', 'GR-2025-001', 10000.00, 0.00, 'posted', 1, 1, '2025-07-29 07:00:00', '2025-07-29 06:55:00', '2025-07-29 07:00:00', '1120', 10000.00),
(45, 'JE-20250729-004-L02', '2025-07-29', 'Received Grant Revenue (Grant Revenue)', 'GR-2025-001', 0.00, 10000.00, 'posted', 1, 1, '2025-07-29 07:00:00', '2025-07-29 06:55:00', '2025-07-29 07:00:00', '4200', 10000.00),
(46, 'JE-20250729-005-L01', '2025-07-29', 'Payroll Expense (Salaries & Wages)', 'PR-0725', 20000.00, 0.00, 'posted', 1, 1, '2025-07-29 12:00:00', '2025-07-29 11:55:00', '2025-07-29 12:00:00', '5100', 20000.00),
(47, 'JE-20250729-005-L02', '2025-07-29', 'Payroll Expense (Bank Account)', 'PR-0725', 0.00, 20000.00, 'posted', 1, 1, '2025-07-29 12:00:00', '2025-07-29 11:55:00', '2025-07-29 12:00:00', '1120', 20000.00),
(48, 'JE-20250730-006-L01', '2025-07-30', 'Accounts Receivable Collection (Bank Account)', 'INV-002-PAY', 3000.00, 0.00, 'posted', 1, 1, '2025-07-30 07:30:00', '2025-07-30 07:25:00', '2025-07-30 07:30:00', '1120', 3000.00),
(49, 'JE-20250730-006-L02', '2025-07-30', 'Accounts Receivable Collection (AR)', 'INV-002-PAY', 0.00, 3000.00, 'posted', 1, 1, '2025-07-30 07:30:00', '2025-07-30 07:25:00', '2025-07-30 07:30:00', '1200', 3000.00),
(50, 'JE-20250730-007-L01', '2025-07-30', 'Purchase of Inventory on Credit (Inventory)', 'PO-006', 8000.00, 0.00, 'posted', 1, 1, '2025-07-30 08:10:00', '2025-07-30 08:05:00', '2025-07-30 08:10:00', '1300', 8000.00),
(51, 'JE-20250730-007-L02', '2025-07-30', 'Purchase of Inventory on Credit (AP)', 'PO-006', 0.00, 8000.00, 'posted', 1, 1, '2025-07-30 08:10:00', '2025-07-30 08:05:00', '2025-07-30 08:10:00', '2100', 8000.00),
(52, 'JE-20250730-008-L01', '2025-07-30', 'Prepaid Insurance Payment (Prepaid Expenses)', 'INS-987', 1200.00, 0.00, 'posted', 1, 1, '2025-07-30 09:00:00', '2025-07-30 08:55:00', '2025-07-30 09:00:00', '1400', 1200.00),
(53, 'JE-20250730-008-L02', '2025-07-30', 'Prepaid Insurance Payment (Bank Account)', 'INS-987', 0.00, 1200.00, 'posted', 1, 1, '2025-07-30 09:00:00', '2025-07-30 08:55:00', '2025-07-30 09:00:00', '1120', 1200.00),
(54, 'JE-20250730-009-L01', '2025-07-30', 'Utility Bill Payment (Expense)', 'UTIL-JUL', 350.00, 0.00, 'posted', 1, 1, '2025-07-30 10:00:00', '2025-07-30 09:55:00', '2025-07-30 10:00:00', '6200', 350.00),
(55, 'JE-20250730-009-L02', '2025-07-30', 'Utility Bill Payment (Bank Account)', 'UTIL-JUL', 0.00, 350.00, 'posted', 1, 1, '2025-07-30 10:00:00', '2025-07-30 09:55:00', '2025-07-30 10:00:00', '1120', 350.00),
(56, 'JE-20250730-010-L01', '2025-07-30', 'New Equipment Purchase (Equipment)', 'EQ-001', 5000.00, 0.00, 'posted', 1, 1, '2025-07-30 11:00:00', '2025-07-30 10:55:00', '2025-07-30 11:00:00', '1520', 5000.00),
(57, 'JE-20250730-010-L02', '2025-07-30', 'New Equipment Purchase (Bank Account)', 'EQ-001', 0.00, 5000.00, 'posted', 1, 1, '2025-07-30 11:00:00', '2025-07-30 10:55:00', '2025-07-30 11:00:00', '1120', 5000.00),
(58, 'JE-20250731-011-L01', '2025-07-31', 'Accrued Rent Expense (Expense)', 'RENT-JUL', 1500.00, 0.00, 'posted', 1, 1, '2025-07-31 07:00:00', '2025-07-31 06:55:00', '2025-07-31 07:00:00', '6300', 1500.00),
(59, 'JE-20250731-011-L02', '2025-07-31', 'Accrued Rent Expense (Accrued Expenses)', 'RENT-JUL', 0.00, 1500.00, 'posted', 1, 1, '2025-07-31 07:00:00', '2025-07-31 06:55:00', '2025-07-31 07:00:00', '2200', 1500.00),
(60, 'JE-20250731-012-L01', '2025-07-31', 'Petty Cash Replenishment (Petty Cash)', 'PC-JUL-01', 200.00, 0.00, 'posted', 1, 1, '2025-07-31 08:00:00', '2025-07-31 07:55:00', '2025-07-31 08:00:00', '1110', 200.00),
(61, 'JE-20250731-012-L02', '2025-07-31', 'Petty Cash Replenishment (Bank Account)', 'PC-JUL-01', 0.00, 200.00, 'posted', 1, 1, '2025-07-31 08:00:00', '2025-07-31 07:55:00', '2025-07-31 08:00:00', '1120', 200.00),
(62, 'JE-20250731-013-L01', '2025-07-31', 'Loan Interest Accrual (Interest Expense)', 'LOAN-INT-JUL', 500.00, 0.00, 'posted', 1, 1, '2025-07-31 09:00:00', '2025-07-31 08:55:00', '2025-07-31 09:00:00', '6400', 500.00),
(63, 'JE-20250731-013-L02', '2025-07-31', 'Loan Interest Accrual (Accrued Expenses)', 'LOAN-INT-JUL', 0.00, 500.00, 'posted', 1, 1, '2025-07-31 09:00:00', '2025-07-31 08:55:00', '2025-07-31 09:00:00', '2200', 500.00),
(64, 'JE-20250801-014-L01', '2025-08-01', 'Depreciation Expense (Expense)', 'DEP-AUG', 800.00, 0.00, 'posted', 1, 1, '2025-08-01 07:00:00', '2025-08-01 06:55:00', '2025-08-01 07:00:00', '6500', 800.00),
(65, 'JE-20250801-014-L02', '2025-08-01', 'Depreciation Expense (Accumulated Depreciation)', 'DEP-AUG', 0.00, 800.00, 'posted', 1, 1, '2025-08-01 07:00:00', '2025-08-01 06:55:00', '2025-08-01 07:00:00', '1590', 800.00),
(66, 'JE-20250801-015-L01', '2025-08-01', 'Consulting Fees Paid (Expense)', 'CONSULT-003', 1500.00, 0.00, 'posted', 1, 1, '2025-08-01 08:00:00', '2025-08-01 07:55:00', '2025-08-01 08:00:00', '6600', 1500.00),
(67, 'JE-20250801-015-L02', '2025-08-01', 'Consulting Fees Paid (Bank Account)', 'CONSULT-003', 0.00, 1500.00, 'posted', 1, 1, '2025-08-01 08:00:00', '2025-08-01 07:55:00', '2025-08-01 08:00:00', '1120', 1500.00),
(68, 'JE-20250801-016-L01', '2025-08-01', 'Other Revenue Received (Bank Account)', 'MISC-001', 250.00, 0.00, 'posted', 1, 1, '2025-08-01 09:00:00', '2025-08-01 08:55:00', '2025-08-01 09:00:00', '1120', 250.00),
(69, 'JE-20250801-016-L02', '2025-08-01', 'Other Revenue Received (Other Revenue)', 'MISC-001', 0.00, 250.00, 'posted', 1, 1, '2025-08-01 09:00:00', '2025-08-01 08:55:00', '2025-08-01 09:00:00', '4300', 250.00),
(70, 'JE-20250801-017-L01', '2025-08-01', 'Adjustment for Bad Debt (Bad Debt Expense)', 'ADJ-BAD-DEBT', 100.00, 0.00, 'posted', 1, 1, '2025-08-01 10:00:00', '2025-08-01 09:55:00', '2025-08-01 10:00:00', '6700', 100.00),
(71, 'JE-20250801-017-L02', '2025-08-01', 'Adjustment for Bad Debt (Allowance for Doubtful Accounts)', 'ADJ-BAD-DEBT', 0.00, 100.00, 'posted', 1, 1, '2025-08-01 10:00:00', '2025-08-01 09:55:00', '2025-08-01 10:00:00', '1210', 100.00),
(72, 'JE-20250801-018-L01', '2025-08-01', 'Closing Revenue (Revenue)', 'CL-ENTRY-JUL', 10000.00, 0.00, 'posted', 1, 1, '2025-08-01 15:00:00', '2025-08-01 14:55:00', '2025-08-01 15:00:00', '4000', 10000.00),
(73, 'JE-20250801-018-L02', '2025-08-01', 'Closing Expenses (Operating Expenses)', 'CL-ENTRY-JUL', 0.00, 7000.00, 'posted', 1, 1, '2025-08-01 15:00:00', '2025-08-01 14:55:00', '2025-08-01 15:00:00', '5000', 7000.00),
(74, 'JE-20250801-018-L03', '2025-08-01', 'Closing to Retained Earnings (Retained Earnings)', 'CL-ENTRY-JUL', 0.00, 3000.00, 'posted', 1, 1, '2025-08-01 15:00:00', '2025-08-01 14:55:00', '2025-08-01 15:00:00', '3100', 3000.00);

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
(1, 1, 1, 2024, 21.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(2, 2, 1, 2024, 21.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(3, 3, 1, 2024, 21.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(4, 4, 1, 2024, 21.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
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
(17, 2, 2, 2024, 10.0, 0.0, 0.0, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
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
(126, 19, 5, 2025, 14.0, 0.0, 0.0, '2025-07-08 08:02:12', '2025-07-08 08:02:12'),
(127, 19, 6, 2025, 3.0, 0.0, 0.0, '2025-07-08 08:02:12', '2025-07-08 08:02:12'),
(128, 19, 7, 2025, 10.0, 0.0, 0.0, '2025-07-08 08:02:12', '2025-07-08 08:02:12'),
(129, 19, 8, 2025, 2.0, 0.0, 0.0, '2025-07-08 08:02:12', '2025-07-08 08:02:12');

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
  `applied_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `reviewed_by` int(11) DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `review_comments` text DEFAULT NULL,
  `emergency_contact` varchar(100) DEFAULT NULL,
  `emergency_phone` varchar(20) DEFAULT NULL,
  `handover_notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `leave_requests`
--

INSERT INTO `leave_requests` (`id`, `user_id`, `leave_type_id`, `start_date`, `end_date`, `total_days`, `reason`, `status`, `applied_at`, `reviewed_by`, `reviewed_at`, `review_comments`, `emergency_contact`, `emergency_phone`, `handover_notes`, `created_at`, `updated_at`) VALUES
(1, 9, 1, '2024-12-15', '2024-12-19', 5.0, 'Family vacation', 'approved', '2025-07-07 13:16:01', 6, '2024-12-01 08:00:00', NULL, NULL, NULL, NULL, '2025-07-07 13:16:01', '2025-07-07 13:16:01'),
(2, 10, 2, '2024-12-10', '2024-12-10', 1.0, 'Medical appointment', 'approved', '2025-07-07 13:16:01', 7, '2024-12-01 09:00:00', NULL, NULL, NULL, NULL, '2025-07-07 13:16:01', '2025-07-07 13:16:01'),
(3, 11, 1, '2024-12-20', '2024-12-31', 10.0, 'Year-end vacation', 'pending', '2025-07-07 13:16:01', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-07 13:16:01', '2025-07-07 13:16:01'),
(4, 19, 3, '2024-12-12', '2024-12-12', 1.0, 'Personal matter', 'approved', '2025-07-07 13:16:01', 5, '2024-12-01 12:00:00', NULL, NULL, NULL, NULL, '2025-07-07 13:16:01', '2025-07-15 00:44:37'),
(5, 19, 1, '2025-07-17', '2025-08-02', 17.0, 'It\'s unplanned', 'pending', '2025-07-15 02:00:29', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:00:29', '2025-07-15 02:00:29'),
(6, 1, 2, '2024-05-30', '2024-05-30', 1.0, 'Medical appointment', 'pending', '2025-07-15 02:11:53', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:11:53', '2025-07-15 02:11:53'),
(7, 1, 1, '2024-05-15', '2024-05-17', 3.0, 'Personal vacation', 'pending', '2025-07-15 02:11:53', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:11:53', '2025-07-15 02:11:53'),
(8, 1, 2, '2024-05-30', '2024-05-30', 1.0, 'Medical appointment', 'pending', '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40'),
(9, 1, 1, '2024-05-15', '2024-05-17', 3.0, 'Personal vacation', 'pending', '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40'),
(10, 2, 2, '2024-05-30', '2024-05-30', 1.0, 'Medical appointment', 'pending', '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40'),
(11, 2, 1, '2024-05-15', '2024-05-17', 3.0, 'Personal vacation', 'pending', '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40'),
(12, 3, 2, '2024-05-30', '2024-05-30', 1.0, 'Medical appointment', 'pending', '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40'),
(13, 3, 1, '2024-05-15', '2024-05-17', 3.0, 'Personal vacation', 'pending', '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40'),
(14, 4, 2, '2024-05-30', '2024-05-30', 1.0, 'Medical appointment', 'pending', '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40'),
(15, 4, 1, '2024-05-15', '2024-05-17', 3.0, 'Personal vacation', 'pending', '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40'),
(16, 5, 2, '2024-05-30', '2024-05-30', 1.0, 'Medical appointment', 'pending', '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40'),
(17, 5, 1, '2024-05-15', '2024-05-17', 3.0, 'Personal vacation', 'pending', '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40'),
(18, 6, 2, '2024-05-30', '2024-05-30', 1.0, 'Medical appointment', 'pending', '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40'),
(19, 6, 1, '2024-05-15', '2024-05-17', 3.0, 'Personal vacation', 'pending', '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40'),
(20, 7, 2, '2024-05-30', '2024-05-30', 1.0, 'Medical appointment', 'pending', '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40'),
(21, 7, 1, '2024-05-15', '2024-05-17', 3.0, 'Personal vacation', 'pending', '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40'),
(22, 8, 2, '2024-05-30', '2024-05-30', 1.0, 'Medical appointment', 'pending', '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40'),
(23, 8, 1, '2024-05-15', '2024-05-17', 3.0, 'Personal vacation', 'pending', '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40'),
(24, 9, 2, '2024-05-30', '2024-05-30', 1.0, 'Medical appointment', 'pending', '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40'),
(25, 9, 1, '2024-05-15', '2024-05-17', 3.0, 'Personal vacation', 'pending', '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40'),
(26, 10, 2, '2024-05-30', '2024-05-30', 1.0, 'Medical appointment', 'pending', '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40'),
(27, 10, 1, '2024-05-15', '2024-05-17', 3.0, 'Personal vacation', 'pending', '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40'),
(28, 11, 2, '2024-05-30', '2024-05-30', 1.0, 'Medical appointment', 'pending', '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40'),
(29, 11, 1, '2024-05-15', '2024-05-17', 3.0, 'Personal vacation', 'pending', '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40'),
(30, 12, 2, '2024-05-30', '2024-05-30', 1.0, 'Medical appointment', 'pending', '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40'),
(31, 12, 1, '2024-05-15', '2024-05-17', 3.0, 'Personal vacation', 'pending', '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40'),
(32, 13, 2, '2024-05-30', '2024-05-30', 1.0, 'Medical appointment', 'pending', '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40'),
(33, 13, 1, '2024-05-15', '2024-05-17', 3.0, 'Personal vacation', 'pending', '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40'),
(34, 14, 2, '2024-05-30', '2024-05-30', 1.0, 'Medical appointment', 'pending', '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40'),
(35, 14, 1, '2024-05-15', '2024-05-17', 3.0, 'Personal vacation', 'pending', '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40'),
(36, 15, 2, '2024-05-30', '2024-05-30', 1.0, 'Medical appointment', 'pending', '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40'),
(37, 15, 1, '2024-05-15', '2024-05-17', 3.0, 'Personal vacation', 'pending', '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40'),
(38, 19, 2, '2024-05-30', '2024-05-30', 1.0, 'Medical appointment', 'pending', '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40'),
(39, 19, 1, '2024-05-15', '2024-05-17', 3.0, 'Personal vacation', 'pending', '2025-07-15 02:16:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 02:16:40', '2025-07-15 02:16:40'),
(40, 19, 5, '2025-08-07', '2025-08-29', 23.0, 'Gonna be a father', 'pending', '2025-07-15 15:29:15', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-15 15:29:15', '2025-07-15 15:29:15');

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
  `id` bigint(20) NOT NULL,
  `run_date` datetime(6) NOT NULL,
  `status` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payroll_runs`
--

INSERT INTO `payroll_runs` (`id`, `run_date`, `status`) VALUES
(1, '2024-05-31 00:00:00.000000', 'COMPLETED'),
(2, '2024-04-30 00:00:00.000000', 'COMPLETED'),
(3, '2024-05-31 00:00:00.000000', 'COMPLETED'),
(4, '2024-04-30 00:00:00.000000', 'COMPLETED'),
(5, '2024-05-31 00:00:00.000000', 'COMPLETED'),
(6, '2024-04-30 00:00:00.000000', 'COMPLETED'),
(7, '2024-05-31 00:00:00.000000', 'COMPLETED'),
(8, '2024-04-30 00:00:00.000000', 'COMPLETED'),
(9, '2024-05-31 00:00:00.000000', 'COMPLETED'),
(10, '2024-04-30 00:00:00.000000', 'COMPLETED'),
(11, '2024-05-31 00:00:00.000000', 'COMPLETED'),
(12, '2024-04-30 00:00:00.000000', 'COMPLETED'),
(13, '2024-05-31 00:00:00.000000', 'COMPLETED'),
(14, '2024-04-30 00:00:00.000000', 'COMPLETED'),
(15, '2024-05-31 00:00:00.000000', 'COMPLETED'),
(16, '2024-04-30 00:00:00.000000', 'COMPLETED'),
(17, '2024-05-31 00:00:00.000000', 'COMPLETED'),
(18, '2024-04-30 00:00:00.000000', 'COMPLETED'),
(19, '2024-05-31 00:00:00.000000', 'COMPLETED'),
(20, '2024-04-30 00:00:00.000000', 'COMPLETED'),
(21, '2024-05-31 00:00:00.000000', 'COMPLETED'),
(22, '2024-04-30 00:00:00.000000', 'COMPLETED'),
(23, '2024-05-31 00:00:00.000000', 'COMPLETED'),
(24, '2024-04-30 00:00:00.000000', 'COMPLETED'),
(25, '2024-05-31 00:00:00.000000', 'COMPLETED'),
(26, '2024-04-30 00:00:00.000000', 'COMPLETED'),
(27, '2024-05-31 00:00:00.000000', 'COMPLETED'),
(28, '2024-04-30 00:00:00.000000', 'COMPLETED'),
(29, '2024-05-31 00:00:00.000000', 'COMPLETED'),
(30, '2024-04-30 00:00:00.000000', 'COMPLETED'),
(31, '2024-05-31 00:00:00.000000', 'COMPLETED'),
(32, '2024-04-30 00:00:00.000000', 'COMPLETED');

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
  `payroll_run_id` bigint(20) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payslips`
--

INSERT INTO `payslips` (`id`, `gross_pay`, `net_pay`, `other_deductions`, `pay_period_end`, `pay_period_start`, `tax_deductions`, `payroll_run_id`, `user_id`) VALUES
(1, 6500.00, 5722.92, 350.00, '2024-05-31', '2024-05-01', 427.08, 1, 1),
(2, 6400.00, 5691.67, 350.00, '2024-04-30', '2024-04-01', 408.33, 2, 1),
(3, 6500.00, 5722.92, 350.00, '2024-05-31', '2024-05-01', 427.08, 3, 2),
(4, 6400.00, 5691.67, 350.00, '2024-04-30', '2024-04-01', 408.33, 4, 2),
(5, 6500.00, 5722.92, 350.00, '2024-05-31', '2024-05-01', 427.08, 5, 3),
(6, 6400.00, 5691.67, 350.00, '2024-04-30', '2024-04-01', 408.33, 6, 3),
(7, 6500.00, 5722.92, 350.00, '2024-05-31', '2024-05-01', 427.08, 7, 4),
(8, 6400.00, 5691.67, 350.00, '2024-04-30', '2024-04-01', 408.33, 8, 4),
(9, 6500.00, 5722.92, 350.00, '2024-05-31', '2024-05-01', 427.08, 9, 5),
(10, 6400.00, 5691.67, 350.00, '2024-04-30', '2024-04-01', 408.33, 10, 5),
(11, 6500.00, 5722.92, 350.00, '2024-05-31', '2024-05-01', 427.08, 11, 6),
(12, 6400.00, 5691.67, 350.00, '2024-04-30', '2024-04-01', 408.33, 12, 6),
(13, 6500.00, 5722.92, 350.00, '2024-05-31', '2024-05-01', 427.08, 13, 7),
(14, 6400.00, 5691.67, 350.00, '2024-04-30', '2024-04-01', 408.33, 14, 7),
(15, 6500.00, 5722.92, 350.00, '2024-05-31', '2024-05-01', 427.08, 15, 8),
(16, 6400.00, 5691.67, 350.00, '2024-04-30', '2024-04-01', 408.33, 16, 8),
(17, 6500.00, 5722.92, 350.00, '2024-05-31', '2024-05-01', 427.08, 17, 9),
(18, 6400.00, 5691.67, 350.00, '2024-04-30', '2024-04-01', 408.33, 18, 9),
(19, 6500.00, 5722.92, 350.00, '2024-05-31', '2024-05-01', 427.08, 19, 10),
(20, 6400.00, 5691.67, 350.00, '2024-04-30', '2024-04-01', 408.33, 20, 10),
(21, 6500.00, 5722.92, 350.00, '2024-05-31', '2024-05-01', 427.08, 21, 11),
(22, 6400.00, 5691.67, 350.00, '2024-04-30', '2024-04-01', 408.33, 22, 11),
(23, 6500.00, 5722.92, 350.00, '2024-05-31', '2024-05-01', 427.08, 23, 12),
(24, 6400.00, 5691.67, 350.00, '2024-04-30', '2024-04-01', 408.33, 24, 12),
(25, 6500.00, 5722.92, 350.00, '2024-05-31', '2024-05-01', 427.08, 25, 13),
(26, 6400.00, 5691.67, 350.00, '2024-04-30', '2024-04-01', 408.33, 26, 13),
(27, 6500.00, 5722.92, 350.00, '2024-05-31', '2024-05-01', 427.08, 27, 14),
(28, 6400.00, 5691.67, 350.00, '2024-04-30', '2024-04-01', 408.33, 28, 14),
(29, 6500.00, 5722.92, 350.00, '2024-05-31', '2024-05-01', 427.08, 29, 15),
(30, 6400.00, 5691.67, 350.00, '2024-04-30', '2024-04-01', 408.33, 30, 15),
(31, 6500.00, 5722.92, 350.00, '2024-05-31', '2024-05-01', 427.08, 31, 19),
(32, 6400.00, 5691.67, 350.00, '2024-04-30', '2024-04-01', 408.33, 32, 19);

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
  `tenant_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `module` varchar(50) NOT NULL,
  `action` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `tenant_id`, `name`, `description`, `module`, `action`, `created_at`) VALUES
(1, 0, 'user.create', 'Create new users', 'auth', 'create', '2025-07-07 13:16:00'),
(2, 0, 'user.read', 'View user information', 'auth', 'read', '2025-07-07 13:16:00'),
(3, 0, 'user.update', 'Update user information', 'auth', 'update', '2025-07-07 13:16:00'),
(4, 0, 'user.delete', 'Delete users', 'auth', 'delete', '2025-07-07 13:16:00'),
(5, 0, 'user.manage_roles', 'Assign roles to users', 'auth', 'manage', '2025-07-07 13:16:00'),
(6, 0, 'attendance.view_own', 'View own attendance records', 'attendance', 'read', '2025-07-07 13:16:00'),
(7, 0, 'attendance.view_department', 'View department attendance records', 'attendance', 'read', '2025-07-07 13:16:00'),
(8, 0, 'attendance.view_all', 'View all attendance records', 'attendance', 'read', '2025-07-07 13:16:00'),
(9, 0, 'attendance.manage', 'Manage attendance records', 'attendance', 'manage', '2025-07-07 13:16:00'),
(10, 0, 'attendance.approve', 'Approve attendance modifications', 'attendance', 'approve', '2025-07-07 13:16:00'),
(11, 0, 'leave.request', 'Submit leave requests', 'leave', 'create', '2025-07-07 13:16:00'),
(12, 0, 'leave.view_own', 'View own leave requests', 'leave', 'read', '2025-07-07 13:16:00'),
(13, 0, 'leave.view_department', 'View department leave requests', 'leave', 'read', '2025-07-07 13:16:00'),
(14, 0, 'leave.approve', 'Approve leave requests', 'leave', 'approve', '2025-07-07 13:16:00'),
(15, 0, 'leave.view_statistics', 'View leave statistics', 'leave', 'read', '2025-07-07 13:16:00'),
(16, 0, 'finance.view_dashboard', 'View finance dashboard', 'finance', 'read', '2025-07-07 13:16:00'),
(17, 0, 'finance.manage_accounts', 'Manage chart of accounts', 'finance', 'manage', '2025-07-07 13:16:00'),
(18, 0, 'finance.manage_budgets', 'Manage budgets', 'finance', 'manage', '2025-07-07 13:16:00'),
(19, 0, 'finance.approve_budgets', 'Approve budgets', 'finance', 'approve', '2025-07-07 13:16:00'),
(20, 0, 'finance.manage_journal', 'Manage journal entries', 'finance', 'manage', '2025-07-07 13:16:00'),
(21, 0, 'finance.view_reports', 'View financial reports', 'finance', 'read', '2025-07-07 13:16:00'),
(22, 0, 'procurement.request', 'Submit procurement requests', 'procurement', 'create', '2025-07-07 13:16:00'),
(23, 0, 'procurement.view', 'View procurement requests', 'procurement', 'read', '2025-07-07 13:16:00'),
(24, 0, 'procurement.approve', 'Approve procurement requests', 'procurement', 'approve', '2025-07-07 13:16:00'),
(25, 0, 'procurement.manage', 'Manage procurement system', 'procurement', 'manage', '2025-07-07 13:16:00'),
(26, 0, 'procurement.view_statistics', 'View procurement statistics', 'procurement', 'read', '2025-07-07 13:16:00'),
(27, 0, 'asset.view', 'View assets', 'asset', 'read', '2025-07-07 13:16:00'),
(28, 0, 'asset.create', 'Create new assets', 'asset', 'create', '2025-07-07 13:16:00'),
(29, 0, 'asset.update', 'Update asset information', 'asset', 'update', '2025-07-07 13:16:00'),
(30, 0, 'asset.delete', 'Delete assets', 'asset', 'delete', '2025-07-07 13:16:00'),
(31, 0, 'asset.assign', 'Assign assets to users', 'asset', 'manage', '2025-07-07 13:16:00'),
(32, 0, 'biometric.enroll', 'Enroll biometric data', 'biometric', 'create', '2025-07-07 13:16:00'),
(33, 0, 'biometric.verify', 'Verify biometric data', 'biometric', 'read', '2025-07-07 13:16:00'),
(34, 0, 'biometric.manage', 'Manage biometric system', 'biometric', 'manage', '2025-07-07 13:16:00'),
(35, 0, 'reports.view', 'View reports', 'reports', 'read', '2025-07-07 13:16:00'),
(36, 0, 'reports.generate', 'Generate reports', 'reports', 'create', '2025-07-07 13:16:00'),
(37, 0, 'reports.manage', 'Manage report templates', 'reports', 'manage', '2025-07-07 13:16:00'),
(38, 0, 'analytics.view', 'View analytics dashboard', 'analytics', 'read', '2025-07-07 13:16:00'),
(39, 0, 'system.settings', 'Manage system settings', 'system', 'manage', '2025-07-07 13:16:00'),
(40, 0, 'system.audit', 'View audit logs', 'system', 'read', '2025-07-07 13:16:00'),
(41, 0, 'system.backup', 'Perform system backups', 'system', 'manage', '2025-07-07 13:16:00');

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
  `tenant_id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `level` int(11) DEFAULT 1,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `tenant_id`, `name`, `description`, `level`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 0, 'Super Admin', 'Full system access and administration', 10, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(2, 0, 'Department Head', 'Manages department operations and staff', 8, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(3, 0, 'Manager', 'Supervises team members and projects', 6, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(4, 0, 'Senior Officer', 'Experienced staff with specialized skills', 5, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(5, 0, 'Officer', 'Regular staff member', 4, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(6, 0, 'Junior Officer', 'Entry-level staff member', 3, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(7, 0, 'Intern', 'Temporary learning position', 2, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(8, 0, 'Contractor', 'External service provider', 1, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(9, 0, 'HR Manager', 'Human Resources management', 7, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(10, 0, 'Finance Manager', 'Financial operations management', 7, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(11, 0, 'IT Manager', 'Information Technology management', 7, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(12, 0, 'Operations Manager', 'Operations oversight', 7, 1, '2025-07-07 13:16:00', '2025-07-07 13:16:00'),
(13, 0, 'FINANCE_OFFICER', 'Auto-created role', 1, 1, '2025-07-07 15:56:32', '2025-07-07 15:56:32'),
(14, 0, '2', 'Auto-created role', 1, 1, '2025-07-15 15:32:26', '2025-07-15 15:32:26');

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
(120, 5, 16, '2025-07-16 11:23:28', NULL);

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
  `tenant_id` int(11) NOT NULL,
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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `date_of_joining` datetime(6) DEFAULT NULL,
  `employee_number` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `tenant_id`, `employee_id`, `email`, `password`, `first_name`, `last_name`, `middle_name`, `phone`, `address`, `date_of_birth`, `hire_date`, `department_id`, `role_id`, `manager_id`, `salary`, `is_active`, `biometric_enrollment_status`, `last_login`, `failed_login_attempts`, `account_locked_until`, `password_reset_token`, `password_reset_expires`, `created_at`, `updated_at`, `date_of_joining`, `employee_number`) VALUES
(1, 0, 'EMP001', 'garrisonsayor@gmail.com', '$2b$10$rQZ8kHp0rJ0YvGjK5X9ZJeF8vQZ8kHp0rJ0YvGjK5X9ZJeF8vQZ8k', 'System', 'Administrator', NULL, '+250791955398', NULL, NULL, '2024-01-01', 3, 1, NULL, 120000.00, 1, 'NONE', NULL, 0, NULL, NULL, NULL, '2025-07-07 13:16:00', '2025-07-07 13:16:00', NULL, ''),
(2, 0, 'EMP002', 'hr.head@craftresource.gov', '$2b$10$rQZ8kHp0rJ0YvGjK5X9ZJeF8vQZ8kHp0rJ0YvGjK5X9ZJeF8vQZ8k', 'Garrison', 'Sayor', NULL, '+250791955398', NULL, NULL, '2024-01-15', 1, 2, NULL, 95000.00, 1, 'NONE', NULL, 0, NULL, NULL, NULL, '2025-07-07 13:16:00', '2025-07-07 13:16:00', NULL, ''),
(3, 0, 'EMP003', 'finance.head@craftresource.gov', '$2b$10$rQZ8kHp0rJ0YvGjK5X9ZJeF8vQZ8kHp0rJ0YvGjK5X9ZJeF8vQZ8k', 'Christopher', 'Leabon', NULL, '+1234567892', NULL, NULL, '2024-01-15', 2, 2, NULL, 98000.00, 1, 'NONE', NULL, 0, NULL, NULL, NULL, '2025-07-07 13:16:00', '2025-07-07 13:16:00', NULL, ''),
(4, 0, 'EMP004', 'it.head@craftresource.gov', '$2b$10$rQZ8kHp0rJ0YvGjK5X9ZJeF8vQZ8kHp0rJ0YvGjK5X9ZJeF8vQZ8k', 'George', 'Kona', NULL, '+1234567893', NULL, NULL, '2024-01-15', 3, 2, NULL, 105000.00, 1, 'NONE', NULL, 0, NULL, NULL, NULL, '2025-07-07 13:16:00', '2025-07-07 13:16:00', NULL, ''),
(5, 0, 'EMP005', 'ops.head@craftresource.gov', '$2b$10$rQZ8kHp0rJ0YvGjK5X9ZJeF8vQZ8kHp0rJ0YvGjK5X9ZJeF8vQZ8k', 'Thomas', 'Sneh', NULL, '+1234567894', NULL, NULL, '2024-01-15', 4, 2, NULL, 92000.00, 1, 'NONE', NULL, 0, NULL, NULL, NULL, '2025-07-07 13:16:00', '2025-07-07 13:16:00', NULL, ''),
(6, 0, 'EMP006', 'hr.manager@craftresource.gov', '$2b$10$rQZ8kHp0rJ0YvGjK5X9ZJeF8vQZ8kHp0rJ0YvGjK5X9ZJeF8vQZ8k', 'Jennifer', 'Davis', NULL, '+1234567895', NULL, NULL, '2024-02-01', 1, 9, NULL, 75000.00, 1, 'NONE', NULL, 0, NULL, NULL, NULL, '2025-07-07 13:16:00', '2025-07-07 13:16:00', NULL, ''),
(7, 0, 'EMP007', 'finance.manager@craftresource.gov', '$2b$10$rQZ8kHp0rJ0YvGjK5X9ZJeF8vQZ8kHp0rJ0YvGjK5X9ZJeF8vQZ8k', 'Robert', 'Wilson', NULL, '+1234567896', NULL, NULL, '2024-02-01', 2, 10, NULL, 78000.00, 1, 'NONE', NULL, 0, NULL, NULL, NULL, '2025-07-07 13:16:00', '2025-07-07 13:16:00', NULL, ''),
(8, 0, 'EMP008', 'it.manager@craftresource.gov', '$2b$10$rQZ8kHp0rJ0YvGjK5X9ZJeF8vQZ8kHp0rJ0YvGjK5X9ZJeF8vQZ8k', 'Amanda', 'Brown', NULL, '+1234567897', NULL, NULL, '2024-02-01', 3, 11, NULL, 82000.00, 1, 'NONE', NULL, 0, NULL, NULL, NULL, '2025-07-07 13:16:00', '2025-07-07 13:16:00', NULL, ''),
(9, 0, 'EMP009', 'john.doe@craftresource.gov', '$2b$10$rQZ8kHp0rJ0YvGjK5X9ZJeF8vQZ8kHp0rJ0YvGjK5X9ZJeF8vQZ8k', 'John', 'Doe', NULL, '+1234567898', NULL, NULL, '2024-03-01', 1, 5, NULL, 55000.00, 1, 'NONE', NULL, 0, NULL, NULL, NULL, '2025-07-07 13:16:00', '2025-07-07 13:16:00', NULL, ''),
(10, 0, 'EMP010', 'jane.smith@craftresource.gov', '$2b$10$rQZ8kHp0rJ0YvGjK5X9ZJeF8vQZ8kHp0rJ0YvGjK5X9ZJeF8vQZ8k', 'Jane', 'Smith', NULL, '+1234567899', NULL, NULL, '2024-03-01', 2, 5, NULL, 58000.00, 1, 'NONE', NULL, 0, NULL, NULL, NULL, '2025-07-07 13:16:00', '2025-07-07 13:16:00', NULL, ''),
(11, 0, 'EMP011', 'mark.jones@craftresource.gov', '$2b$10$rQZ8kHp0rJ0YvGjK5X9ZJeF8vQZ8kHp0rJ0YvGjK5X9ZJeF8vQZ8k', 'Mark', 'Jones', NULL, '+1234567800', NULL, NULL, '2024-03-15', 3, 5, NULL, 62000.00, 1, 'NONE', NULL, 0, NULL, NULL, NULL, '2025-07-07 13:16:00', '2025-07-07 13:16:00', NULL, ''),
(12, 0, 'EMP012', 'emily.white@craftresource.gov', '$2b$10$rQZ8kHp0rJ0YvGjK5X9ZJeF8vQZ8kHp0rJ0YvGjK5X9ZJeF8vQZ8k', 'Emily', 'White', NULL, '+1234567801', NULL, NULL, '2024-03-15', 4, 5, NULL, 54000.00, 1, 'NONE', NULL, 0, NULL, NULL, NULL, '2025-07-07 13:16:00', '2025-07-07 13:16:00', NULL, ''),
(13, 0, 'EMP013', 'alex.green@craftresource.gov', '$2b$10$rQZ8kHp0rJ0YvGjK5X9ZJeF8vQZ8kHp0rJ0YvGjK5X9ZJeF8vQZ8k', 'Alex', 'Green', NULL, '+1234567802', NULL, NULL, '2024-04-01', 5, 5, NULL, 59000.00, 1, 'NONE', NULL, 0, NULL, NULL, NULL, '2025-07-07 13:16:00', '2025-07-07 13:16:00', NULL, ''),
(14, 0, 'EMP014', 'maria.garcia@craftresource.gov', '$2b$10$rQZ8kHp0rJ0YvGjK5X9ZJeF8vQZ8kHp0rJ0YvGjK5X9ZJeF8vQZ8k', 'Maria', 'Garcia', NULL, '+1234567803', NULL, NULL, '2024-04-01', 6, 5, NULL, 56000.00, 1, 'NONE', NULL, 0, NULL, NULL, NULL, '2025-07-07 13:16:00', '2025-07-07 13:16:00', NULL, ''),
(15, 0, 'EMP015', 'chris.taylor@craftresource.gov', '$2b$10$rQZ8kHp0rJ0YvGjK5X9ZJeF8vQZ8kHp0rJ0YvGjK5X9ZJeF8vQZ8k', 'Chris', 'Taylor', NULL, '+1234567804', NULL, NULL, '2024-04-15', 7, 5, NULL, 57000.00, 1, 'NONE', NULL, 0, NULL, NULL, NULL, '2025-07-07 13:16:00', '2025-07-07 13:16:00', NULL, ''),
(19, 0, 'EMP016', 'garrisonsay@gmail.com', '$2b$10$XGBRmLq8mC9Gc7iTanRKleChAi2udpDM9.WYhkzPLlnfdgTtOgcnu', 'Crafty', 'Dev', NULL, NULL, NULL, NULL, '0000-00-00', 2, 5, NULL, NULL, 1, 'NONE', '2025-09-01 19:03:59', 0, NULL, NULL, NULL, '2025-07-07 16:06:52', '2025-09-01 19:03:59', NULL, ''),
(20, 0, 'EMP017', 'issaadamx@gmail.com', '$2b$10$jUxFTCxwwUmioD8NvHVxge3/jOf5TOiqIhL1AYAtBu7SycAFdJPE.', 'Issa', 'Adams', NULL, NULL, NULL, NULL, '0000-00-00', 1, 14, NULL, NULL, 1, 'NONE', '2025-09-01 19:08:43', 0, NULL, NULL, NULL, '2025-07-15 15:32:26', '2025-09-01 19:08:43', NULL, '');

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
  `tenant_id` int(11) NOT NULL,
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

INSERT INTO `vendors` (`id`, `tenant_id`, `vendor_code`, `company_name`, `contact_person`, `email`, `phone`, `address`, `tax_id`, `bank_account`, `payment_terms`, `category`, `rating`, `is_active`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 0, 'VEN001', 'Office Supplies Inc.', 'John Manager', 'john@officesupplies.com', '+1555-0101', '123 Business St, City, State 12345', NULL, NULL, NULL, 'Office Supplies', 4.50, 1, 1, '2025-07-07 13:16:01', '2025-07-07 13:16:01'),
(2, 0, 'VEN002', 'Tech Solutions Ltd.', 'Sarah Tech', 'sarah@techsolutions.com', '+1555-0102', '456 Tech Ave, City, State 12345', NULL, NULL, NULL, 'Technology', 4.80, 1, 1, '2025-07-07 13:16:01', '2025-07-07 13:16:01'),
(3, 0, 'VEN003', 'Furniture World', 'Mike Furniture', 'mike@furnitureworld.com', '+1555-0103', '789 Furniture Blvd, City, State 12345', NULL, NULL, NULL, 'Furniture', 4.20, 1, 1, '2025-07-07 13:16:01', '2025-07-07 13:16:01'),
(4, 0, 'VEN004', 'Professional Services Co.', 'Lisa Professional', 'lisa@proservices.com', '+1555-0104', '321 Service Rd, City, State 12345', NULL, NULL, NULL, 'Professional Services', 4.60, 1, 1, '2025-07-07 13:16:01', '2025-07-07 13:16:01'),
(5, 0, 'VEN005', 'Fleet Management Inc.', 'David Fleet', 'david@fleetmgmt.com', '+1555-0105', '654 Auto Way, City, State 12345', NULL, NULL, NULL, 'Transportation', 4.30, 1, 1, '2025-07-07 13:16:01', '2025-07-07 13:16:01');

-- --------------------------------------------------------

--
-- Table structure for table `visitors`
--

CREATE TABLE `visitors` (
  `id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `visitor_id` varchar(20) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `company` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `purpose_of_visit` text DEFAULT NULL,
  `employee_to_visit` int(11) DEFAULT NULL,
  `id_document_type` varchar(50) DEFAULT NULL,
  `id_document_number` varchar(50) DEFAULT NULL,
  `photo_path` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `visitors`
--

INSERT INTO `visitors` (`id`, `tenant_id`, `visitor_id`, `first_name`, `last_name`, `company`, `email`, `phone`, `purpose_of_visit`, `employee_to_visit`, `id_document_type`, `id_document_number`, `photo_path`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 0, 'VIS001', 'James', 'Anderson', 'Tech Consulting Inc.', 'james@techconsulting.com', '+1555-0201', 'IT consultation meeting', 4, NULL, NULL, NULL, 1, '2025-07-07 13:16:01', '2025-07-07 13:16:01'),
(2, 0, 'VIS002', 'Mary', 'Johnson', 'Legal Associates', 'mary@legalassoc.com', '+1555-0202', 'Legal document review', 13, NULL, NULL, NULL, 1, '2025-07-07 13:16:01', '2025-07-07 13:16:01'),
(3, 0, 'VIS003', 'Robert', 'Williams', 'Audit Firm LLC', 'robert@auditfirm.com', '+1555-0203', 'Annual audit meeting', 3, NULL, NULL, NULL, 1, '2025-07-07 13:16:01', '2025-07-07 13:16:01'),
(4, 0, 'VIS004', 'Susan', 'Davis', 'Training Solutions', 'susan@trainingsol.com', '+1555-0204', 'Employee training session', 2, NULL, NULL, NULL, 1, '2025-07-07 13:16:01', '2025-07-07 13:16:01');

-- --------------------------------------------------------

--
-- Table structure for table `visitor_checkins`
--

CREATE TABLE `visitor_checkins` (
  `id` int(11) NOT NULL,
  `visitor_id` int(11) NOT NULL,
  `check_in_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `check_out_time` timestamp NULL DEFAULT NULL,
  `check_in_method` enum('manual','biometric_face','id_card') DEFAULT 'manual',
  `check_out_method` enum('manual','biometric_face','id_card') DEFAULT 'manual',
  `location` varchar(100) DEFAULT NULL,
  `purpose` text DEFAULT NULL,
  `host_employee_id` int(11) DEFAULT NULL,
  `badge_number` varchar(20) DEFAULT NULL,
  `vehicle_registration` varchar(20) DEFAULT NULL,
  `status` enum('checked_in','checked_out','overstayed') DEFAULT 'checked_in',
  `notes` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `visitor_checkins`
--

INSERT INTO `visitor_checkins` (`id`, `visitor_id`, `check_in_time`, `check_out_time`, `check_in_method`, `check_out_method`, `location`, `purpose`, `host_employee_id`, `badge_number`, `vehicle_registration`, `status`, `notes`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 1, '2024-12-01 07:00:00', '2024-12-01 10:00:00', 'manual', 'manual', 'Main Lobby', 'IT consultation meeting', 4, 'BADGE001', NULL, 'checked_out', NULL, NULL, '2025-07-07 13:16:01', '2025-07-07 13:16:01'),
(2, 2, '2024-12-01 12:00:00', '2024-12-01 14:00:00', 'id_card', 'id_card', 'Main Lobby', 'Legal document review', 13, 'BADGE002', NULL, 'checked_out', NULL, NULL, '2025-07-07 13:16:01', '2025-07-07 13:16:01'),
(3, 3, '2024-12-02 08:00:00', NULL, 'manual', 'manual', 'Main Lobby', 'Annual audit meeting', 3, 'BADGE003', NULL, 'checked_in', NULL, NULL, '2025-07-07 13:16:01', '2025-07-07 13:16:01'),
(4, 4, '2024-12-02 11:00:00', NULL, 'manual', 'manual', 'Main Lobby', 'Employee training session', 2, 'BADGE004', NULL, 'checked_in', NULL, NULL, '2025-07-07 13:16:01', '2025-07-07 13:16:01');

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

--
-- Indexes for dumped tables
--

--
-- Indexes for table `account_payables`
--
ALTER TABLE `account_payables`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `account_receivables`
--
ALTER TABLE `account_receivables`
  ADD PRIMARY KEY (`id`);

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
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `attendance_records`
--
ALTER TABLE `attendance_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `idx_user_date` (`user_id`,`clock_in_time`),
  ADD KEY `idx_date_range` (`clock_in_time`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_attendance_tenant` (`tenant_id`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_action` (`user_id`,`action`),
  ADD KEY `idx_table_record` (`table_name`,`record_id`),
  ADD KEY `idx_timestamp` (`timestamp`);

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
  ADD KEY `idx_dept_tenant` (`tenant_id`),
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
-- Indexes for table `id_cards`
--
ALTER TABLE `id_cards`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `card_unique_identifier` (`card_unique_identifier`),
  ADD KEY `idx_id_cards_holder` (`holder_id`),
  ADD KEY `idx_id_cards_active` (`is_active`);

--
-- Indexes for table `journal_entries`
--
ALTER TABLE `journal_entries`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `entry_number` (`entry_number`),
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
-- Indexes for table `leave_balances`
--
ALTER TABLE `leave_balances`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_leave_year` (`user_id`,`leave_type_id`,`year`),
  ADD KEY `leave_type_id` (`leave_type_id`),
  ADD KEY `idx_user_year` (`user_id`,`year`);

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
  ADD PRIMARY KEY (`id`);

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
  ADD KEY `idx_perm_module` (`module`),
  ADD KEY `idx_perm_action` (`action`),
  ADD KEY `idx_perm_tenant` (`tenant_id`);

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
  ADD KEY `idx_role_name` (`name`),
  ADD KEY `idx_role_level` (`level`),
  ADD KEY `idx_role_tenant` (`tenant_id`);

--
-- Indexes for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_role_permissions_role` (`role_id`),
  ADD KEY `fk_role_permissions_permission` (`permission_id`);

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
  ADD KEY `idx_user_tenant` (`tenant_id`),
  ADD KEY `idx_users_dept_active` (`department_id`,`is_active`);

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
  ADD KEY `idx_active` (`is_active`),
  ADD KEY `idx_vendor_tenant` (`tenant_id`);

--
-- Indexes for table `visitors`
--
ALTER TABLE `visitors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `visitor_id` (`visitor_id`),
  ADD KEY `idx_visitor_id` (`visitor_id`),
  ADD KEY `idx_name` (`first_name`,`last_name`),
  ADD KEY `idx_company` (`company`),
  ADD KEY `idx_employee_to_visit` (`employee_to_visit`),
  ADD KEY `idx_visitor_tenant` (`tenant_id`);

--
-- Indexes for table `visitor_checkins`
--
ALTER TABLE `visitor_checkins`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_visitor_checkin` (`visitor_id`,`check_in_time`),
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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=64;

--
-- AUTO_INCREMENT for table `benefit_plans`
--
ALTER TABLE `benefit_plans`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `biometric_access_logs`
--
ALTER TABLE `biometric_access_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `biometric_templates`
--
ALTER TABLE `biometric_templates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `budgets`
--
ALTER TABLE `budgets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `budget_line_items`
--
ALTER TABLE `budget_line_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `budget_requests`
--
ALTER TABLE `budget_requests`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `chart_of_accounts`
--
ALTER TABLE `chart_of_accounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

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
-- AUTO_INCREMENT for table `id_cards`
--
ALTER TABLE `id_cards`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `journal_entries`
--
ALTER TABLE `journal_entries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=75;

--
-- AUTO_INCREMENT for table `journal_entry_lines`
--
ALTER TABLE `journal_entry_lines`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `leave_balances`
--
ALTER TABLE `leave_balances`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=130;

--
-- AUTO_INCREMENT for table `leave_requests`
--
ALTER TABLE `leave_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

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
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `role_permissions`
--
ALTER TABLE `role_permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=121;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `vendors`
--
ALTER TABLE `vendors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `visitors`
--
ALTER TABLE `visitors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `visitor_checkins`
--
ALTER TABLE `visitor_checkins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `visitor_logs`
--
ALTER TABLE `visitor_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

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
  ADD CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

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
-- Constraints for table `payslips`
--
ALTER TABLE `payslips`
  ADD CONSTRAINT `FK_payslips_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FKmaj3wje7q7n9vsjbjx91pmmrj` FOREIGN KEY (`payroll_run_id`) REFERENCES `payroll_runs` (`id`);

--
-- Constraints for table `performance_reviews`
--
ALTER TABLE `performance_reviews`
  ADD CONSTRAINT `FK_performance_reviews_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

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
  ADD CONSTRAINT `fk_role_permissions_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
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
  ADD CONSTRAINT `visitor_checkins_ibfk_1` FOREIGN KEY (`visitor_id`) REFERENCES `visitors` (`id`),
  ADD CONSTRAINT `visitor_checkins_ibfk_2` FOREIGN KEY (`host_employee_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `visitor_checkins_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `visitor_logs`
--
ALTER TABLE `visitor_logs`
  ADD CONSTRAINT `visitor_logs_ibfk_1` FOREIGN KEY (`visitor_id`) REFERENCES `visitors` (`id`),
  ADD CONSTRAINT `visitor_logs_ibfk_2` FOREIGN KEY (`employee_to_visit_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `visitor_logs_ibfk_3` FOREIGN KEY (`biometric_template_id`) REFERENCES `biometric_templates` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
