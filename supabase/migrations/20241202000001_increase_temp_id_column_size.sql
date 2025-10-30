-- Increase FLD_TEMPID column size to accommodate longer temporary IDs
-- The tempId format is: temp_{timestamp}_{random} which can be ~28 characters
ALTER TABLE tbl_temp_students_invoices_detail 
ALTER COLUMN FLD_TEMPID TYPE VARCHAR(100);

