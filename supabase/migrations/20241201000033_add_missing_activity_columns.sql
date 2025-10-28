-- Add missing fld_uid column to tbl_activity_matcher (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tbl_activity_matcher' AND column_name = 'fld_uid'
    ) THEN
        ALTER TABLE tbl_activity_matcher ADD COLUMN fld_uid INTEGER REFERENCES tbl_users(fld_id);
    END IF;
END $$;

-- Add missing fld_uid column to tbl_activity_students (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tbl_activity_students' AND column_name = 'fld_uid'
    ) THEN
        ALTER TABLE tbl_activity_students ADD COLUMN fld_uid INTEGER REFERENCES tbl_users(fld_id);
    END IF;
END $$;
