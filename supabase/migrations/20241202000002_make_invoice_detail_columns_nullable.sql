-- Make fld_ssid, fld_cid, and fld_sid nullable in invoice detail tables
-- These are set to null in the invoice creation logic but marked as NOT NULL

-- For tbl_students_invoices_detail
ALTER TABLE tbl_students_invoices_detail 
ALTER COLUMN fld_ssid DROP NOT NULL;

ALTER TABLE tbl_students_invoices_detail 
ALTER COLUMN fld_cid DROP NOT NULL;

-- For tbl_teachers_invoices_detail  
ALTER TABLE tbl_teachers_invoices_detail 
ALTER COLUMN fld_sid DROP NOT NULL;

ALTER TABLE tbl_teachers_invoices_detail 
ALTER COLUMN fld_ssid DROP NOT NULL;

ALTER TABLE tbl_teachers_invoices_detail 
ALTER COLUMN fld_cid DROP NOT NULL;
