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
