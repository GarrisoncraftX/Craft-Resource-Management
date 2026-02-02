-- Migration Script: Remove Face/Biometric Features
-- Keep only: QR Code, Card, and Manual methods
-- Date: 2024

-- 1. Update attendance_records table - change enum values
ALTER TABLE `attendance_records` 
MODIFY COLUMN `clock_in_method` ENUM('manual','card','qr_scan') DEFAULT 'manual',
MODIFY COLUMN `clock_out_method` ENUM('manual','card','qr_scan') DEFAULT 'manual';

-- 2. Update biometric_templates table - change enum to only support card
ALTER TABLE `biometric_templates` 
MODIFY COLUMN `biometric_type` ENUM('card') NOT NULL;

-- 3. Update biometric_access_logs table - change enum to only support card
ALTER TABLE `biometric_access_logs` 
MODIFY COLUMN `biometric_type` ENUM('card') NOT NULL;

-- 4. Update visitor_logs table - remove biometric face options
ALTER TABLE `visitor_logs` 
MODIFY COLUMN `check_in_method` ENUM('MANUAL','CARD','QR_SCAN') DEFAULT 'MANUAL',
MODIFY COLUMN `check_out_method` ENUM('MANUAL','CARD','QR_SCAN') DEFAULT NULL;

-- 5. Delete face/fingerprint biometric templates
DELETE FROM `biometric_templates` WHERE `biometric_type` IN ('face', 'fingerprint');

-- 6. Delete face/fingerprint access logs
DELETE FROM `biometric_access_logs` WHERE `biometric_type` IN ('face', 'fingerprint');

-- 7. Update existing attendance records with face/fingerprint methods to 'manual'
UPDATE `attendance_records` 
SET `clock_in_method` = 'manual' 
WHERE `clock_in_method` IN ('biometric_face', 'biometric_fingerprint');

UPDATE `attendance_records` 
SET `clock_out_method` = 'manual' 
WHERE `clock_out_method` IN ('biometric_face', 'biometric_fingerprint');

-- 8. Update visitor logs with biometric face to manual
UPDATE `visitor_logs` 
SET `check_in_method` = 'MANUAL' 
WHERE `check_in_method` = 'BIOMETRIC_FACE';

UPDATE `visitor_logs` 
SET `check_out_method` = 'MANUAL' 
WHERE `check_out_method` = 'BIOMETRIC_FACE';

-- 9. Update system settings - remove biometric confidence threshold
DELETE FROM `system_settings` WHERE `setting_key` = 'biometric_confidence_threshold';

-- 10. Update permissions - remove face-related biometric permissions
DELETE FROM `permissions` WHERE `permission_name` IN ('biometric.enroll', 'biometric.verify', 'biometric.manage');

-- 11. Update notifications - remove biometric reminders
DELETE FROM `notifications` WHERE `message` LIKE '%biometric%';

-- 12. Reset user biometric enrollment status
UPDATE `users` SET `biometric_enrollment_status` = 'NONE';

-- Verification queries (run these to check the migration)
-- SELECT DISTINCT clock_in_method FROM attendance_records;
-- SELECT DISTINCT clock_out_method FROM attendance_records;
-- SELECT DISTINCT biometric_type FROM biometric_templates;
-- SELECT DISTINCT biometric_type FROM biometric_access_logs;
-- SELECT DISTINCT check_in_method FROM visitor_logs;
-- SELECT DISTINCT check_out_method FROM visitor_logs;
