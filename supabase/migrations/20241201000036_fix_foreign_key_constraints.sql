-- Fix foreign key constraints by making problematic columns nullable
-- and setting default values for 0 references

-- Make fld_uid nullable in tbl_students and set default for 0 values
ALTER TABLE tbl_students 
ALTER COLUMN fld_uid DROP NOT NULL;

UPDATE tbl_students 
SET fld_uid = NULL 
WHERE fld_uid = 0;

-- Make fld_onboard_uid nullable in tbl_teachers and set default for 0 values  
ALTER TABLE tbl_teachers
ALTER COLUMN fld_onboard_uid DROP NOT NULL;

UPDATE tbl_teachers
SET fld_onboard_uid = NULL 
WHERE fld_onboard_uid = 0;

-- Make fld_invoice_hr NOT NULL with default value 0 in tbl_teachers_invoices
ALTER TABLE tbl_teachers_invoices
ALTER COLUMN fld_invoice_hr SET DEFAULT 0;

UPDATE tbl_teachers_invoices
SET fld_invoice_hr = 0 
WHERE fld_invoice_hr IS NULL;
