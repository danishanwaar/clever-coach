-- Remove extra fields from tbl_teachers_invoices that don't exist in legacy database
-- Legacy tbl_teachers_invoices only has: FLD_ID, FLD_TID, FLD_LHID, FLD_CID, FLD_INVOICE_TOTAL, FLD_EDATE, FLD_UNAME, FLD_STATUS

-- Remove fields that don't exist in legacy
ALTER TABLE tbl_teachers_invoices 
DROP COLUMN IF EXISTS fld_invoice_hr,
DROP COLUMN IF EXISTS fld_min_lesson,
DROP COLUMN IF EXISTS fld_ch_hr,
DROP COLUMN IF EXISTS fld_notes;
