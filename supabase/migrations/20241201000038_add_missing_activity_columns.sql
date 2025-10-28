-- Add missing fld_aid column to tbl_teachers_students_activity (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tbl_teachers_students_activity' AND column_name = 'fld_aid'
    ) THEN
        ALTER TABLE tbl_teachers_students_activity ADD COLUMN fld_aid INTEGER;
    END IF;
END $$;
