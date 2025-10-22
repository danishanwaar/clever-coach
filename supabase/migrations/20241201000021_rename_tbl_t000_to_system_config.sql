-- Rename tbl_t000 to tbl_system_config and add system configuration data

-- First, let's add the missing fields that are referenced in the code
ALTER TABLE tbl_t000 
ADD COLUMN IF NOT EXISTS fld_cflag VARCHAR(10) DEFAULT 'Active',
ADD COLUMN IF NOT EXISTS fld_femail VARCHAR(100),
ADD COLUMN IF NOT EXISTS fld_email VARCHAR(100);

-- Rename the table
ALTER TABLE tbl_t000 RENAME TO tbl_system_config;

-- Update the sequence name
ALTER SEQUENCE tbl_t000_fld_id_seq RENAME TO tbl_system_config_fld_id_seq;

-- Update the trigger
DROP TRIGGER IF EXISTS update_tbl_t000_updated_at ON tbl_system_config;
CREATE TRIGGER update_tbl_system_config_updated_at 
    BEFORE UPDATE ON tbl_system_config 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert system configuration data
INSERT INTO tbl_system_config (
    fld_id,
    fld_burks,
    fld_name1,
    fld_cntry,
    fld_name2,
    fld_cflag,
    fld_femail,
    fld_email,
    created_at,
    updated_at
) VALUES (
    1,
    'DE',
    'CleverCoach Nachhilfe',
    49,
    'Tav & Uzun GbR',
    'Active',
    'kontakt@clevercoach-nachhilfe.de',
    'admin@clevercoach-nachhilfe.de',
    NOW(),
    NOW()
);

-- Update the sequence to start from the correct value
SELECT setval('tbl_system_config_fld_id_seq', 1, true);
