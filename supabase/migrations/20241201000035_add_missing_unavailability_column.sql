-- Add missing fld_end_date column to tbl_teachers_unavailability_history (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tbl_teachers_unavailability_history' AND column_name = 'fld_end_date'
    ) THEN
        ALTER TABLE tbl_teachers_unavailability_history ADD COLUMN fld_end_date TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;
