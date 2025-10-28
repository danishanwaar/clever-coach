-- Add is_legacy boolean column to tbl_users
-- This column will help identify legacy users vs new users

-- Add is_legacy column with default value false
ALTER TABLE tbl_users 
ADD COLUMN is_legacy BOOLEAN NOT NULL DEFAULT false;

-- Add index for performance when filtering by legacy status
CREATE INDEX IF NOT EXISTS idx_tbl_users_is_legacy ON tbl_users(is_legacy);

-- Add comment to document the column purpose
COMMENT ON COLUMN tbl_users.is_legacy IS 'Indicates whether this user was migrated from the legacy system (true) or created in the new system (false)';
