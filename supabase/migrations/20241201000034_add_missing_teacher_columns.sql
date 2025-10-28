-- Add missing fld_a_body column to tbl_teachers_students_activity (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tbl_teachers_students_activity' AND column_name = 'fld_a_body'
    ) THEN
        ALTER TABLE tbl_teachers_students_activity ADD COLUMN fld_a_body TEXT;
    END IF;
END $$;

-- Add missing fld_note_body column to tbl_teachers_students_notes (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tbl_teachers_students_notes' AND column_name = 'fld_note_body'
    ) THEN
        ALTER TABLE tbl_teachers_students_notes ADD COLUMN fld_note_body TEXT;
    END IF;
END $$;
