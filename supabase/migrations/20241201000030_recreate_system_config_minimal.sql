-- Drop and recreate tbl_system_config with minimal fields only
-- This migration removes all extra fields and keeps only the essential ones

-- Drop the existing table
DROP TABLE IF EXISTS tbl_system_config CASCADE;

-- Recreate the table with only the specified fields
CREATE TABLE tbl_system_config (
    fld_id SERIAL PRIMARY KEY,
    fld_burks VARCHAR(4),
    fld_name1 VARCHAR(30) NOT NULL,
    fld_cntry INTEGER NOT NULL DEFAULT 0,
    fld_name2 VARCHAR(30),
    fld_cflag VARCHAR(10) DEFAULT 'Active' CHECK (fld_cflag IN ('Active', 'Inactive')),
    fld_femail TEXT,
    fld_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the sequence (only if it doesn't exist)
CREATE SEQUENCE IF NOT EXISTS tbl_system_config_fld_id_seq;
ALTER TABLE tbl_system_config ALTER COLUMN fld_id SET DEFAULT nextval('tbl_system_config_fld_id_seq');
ALTER SEQUENCE tbl_system_config_fld_id_seq OWNED BY tbl_system_config.fld_id;

-- Add foreign key constraint for fld_cntry -> tbl_countries
ALTER TABLE tbl_system_config 
ADD CONSTRAINT fk_system_config_country 
FOREIGN KEY (fld_cntry) REFERENCES tbl_countries(fld_id);

-- Create updated_at trigger
CREATE TRIGGER update_tbl_system_config_updated_at 
    BEFORE UPDATE ON tbl_system_config 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default system configuration data
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
    'CLC',
    'CleverCoach Nachhilfe',
    1, -- Default to Germany (fld_id = 1 from countries seed)
    'Tav & Uzun GbR',
    'Active',
    'kontakt@clevercoach-nachhilfe.de',
    'admin@clevercoach-nachhilfe.de',
    NOW(),
    NOW()
);

-- Update the sequence to start from the correct value
SELECT setval('tbl_system_config_fld_id_seq', 1, true);

-- Add column comments
COMMENT ON TABLE tbl_system_config IS 'System configuration table with minimal fields';
COMMENT ON COLUMN tbl_system_config.fld_id IS 'Primary key';
COMMENT ON COLUMN tbl_system_config.fld_burks IS 'Company Code';
COMMENT ON COLUMN tbl_system_config.fld_name1 IS 'Company Name';
COMMENT ON COLUMN tbl_system_config.fld_cntry IS 'Country ID (FK to tbl_countries)';
COMMENT ON COLUMN tbl_system_config.fld_name2 IS 'Legal Name';
COMMENT ON COLUMN tbl_system_config.fld_cflag IS 'System Status';
COMMENT ON COLUMN tbl_system_config.fld_femail IS 'Contact Email';
COMMENT ON COLUMN tbl_system_config.fld_email IS 'Admin Email';
