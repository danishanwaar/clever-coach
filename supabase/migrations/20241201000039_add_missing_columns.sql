-- Add missing fld_cname column to tbl_urls (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tbl_urls' AND column_name = 'fld_cname'
    ) THEN
        ALTER TABLE tbl_urls ADD COLUMN fld_cname VARCHAR(255);
    END IF;
END $$;

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

-- Add missing fld_note_subject column to tbl_teachers_students_notes (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tbl_teachers_students_notes' AND column_name = 'fld_note_subject'
    ) THEN
        ALTER TABLE tbl_teachers_students_notes ADD COLUMN fld_note_subject VARCHAR(255);
    END IF;
END $$;

-- Add missing fld_start_date column to tbl_teachers_unavailability_history (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tbl_teachers_unavailability_history' AND column_name = 'fld_start_date'
    ) THEN
        ALTER TABLE tbl_teachers_unavailability_history ADD COLUMN fld_start_date TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;
