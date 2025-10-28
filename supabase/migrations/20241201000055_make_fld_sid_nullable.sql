-- Make fld_sid nullable in tbl_teachers_invoices_detail
-- This allows setting fld_sid to null when the student reference is invalid

-- Make fld_sid nullable
ALTER TABLE tbl_teachers_invoices_detail 
ALTER COLUMN fld_sid DROP NOT NULL;

-- Update existing 0 values to NULL
UPDATE tbl_teachers_invoices_detail 
SET fld_sid = NULL 
WHERE fld_sid = 0;
