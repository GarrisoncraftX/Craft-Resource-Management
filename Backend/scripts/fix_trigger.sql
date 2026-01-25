-- Fix for the audit_users_update trigger issue
-- This trigger is incompatible with the current audit_logs table structure

USE craft_resource_management;

-- Drop the problematic trigger
DROP TRIGGER IF EXISTS audit_users_update;

-- The trigger was trying to insert columns (table_name, record_id, old_values, new_values) 
-- that don't exist in the audit_logs table.
-- 
-- If you need audit logging for user updates, you should handle it in your application code
-- using the auditService which is already implemented in your Node.js backend.
