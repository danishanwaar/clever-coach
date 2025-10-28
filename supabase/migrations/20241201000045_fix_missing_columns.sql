-- Add missing fld_edate column to tbl_urls (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tbl_urls' AND column_name = 'fld_edate'
    ) THEN
        ALTER TABLE tbl_urls ADD COLUMN fld_edate TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Add missing fld_uname column to tbl_teachers_students_activity (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tbl_teachers_students_activity' AND column_name = 'fld_uname'
    ) THEN
        ALTER TABLE tbl_teachers_students_activity ADD COLUMN fld_uname INTEGER;
    END IF;
END $$;
