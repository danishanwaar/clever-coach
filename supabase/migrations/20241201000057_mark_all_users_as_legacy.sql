-- Mark all existing users in tbl_users as legacy
-- This migration sets is_legacy = true for all users that were migrated from the legacy system

-- Update all existing users to be marked as legacy
UPDATE tbl_users 
SET is_legacy = true 
WHERE is_legacy = false;

-- Add comment to document this migration
COMMENT ON COLUMN tbl_users.is_legacy IS 'Indicates whether this user was migrated from the legacy system (true) or created in the new system (false). All existing users are marked as legacy.';
