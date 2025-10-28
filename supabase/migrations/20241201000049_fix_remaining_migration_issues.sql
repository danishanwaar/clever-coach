-- Fix remaining migration issues
-- This migration addresses the final set of issues found during data migration

-- 1. Fix fld_c_eid foreign key constraint for tbl_students_subjects
-- Make fld_c_eid nullable and update foreign key constraint
ALTER TABLE tbl_students_subjects 
ALTER COLUMN fld_c_eid DROP NOT NULL;

-- Update existing 0 values to NULL
UPDATE tbl_students_subjects 
SET fld_c_eid = NULL 
WHERE fld_c_eid = 0;

-- Drop and recreate foreign key constraint with ON DELETE SET NULL
ALTER TABLE tbl_students_subjects
DROP CONSTRAINT IF EXISTS fk_student_subjects_engagement;

ALTER TABLE tbl_students_subjects
ADD CONSTRAINT fk_student_subjects_engagement
FOREIGN KEY (fld_c_eid) REFERENCES tbl_contracts_engagement(fld_id) ON DELETE SET NULL;

-- 2. Fix fld_activity_type_id null constraint in tbl_teachers_students_activity
-- Make fld_activity_type_id nullable
ALTER TABLE tbl_teachers_students_activity 
ALTER COLUMN fld_activity_type_id DROP NOT NULL;

-- Update existing NULL values to a default activity type (assuming 1 exists)
UPDATE tbl_teachers_students_activity 
SET fld_activity_type_id = 1 
WHERE fld_activity_type_id IS NULL;

-- 3. Fix fld_body null constraint in tbl_teachers_students_notes
-- Make fld_body nullable
ALTER TABLE tbl_teachers_students_notes 
ALTER COLUMN fld_body DROP NOT NULL;

-- Update existing NULL values to empty string
UPDATE tbl_teachers_students_notes 
SET fld_body = '' 
WHERE fld_body IS NULL;

-- 4. Fix tbl_urls structure to match legacy
-- Add missing fld_itype column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tbl_urls' AND column_name = 'fld_itype'
    ) THEN
        ALTER TABLE tbl_urls ADD COLUMN fld_itype VARCHAR(15) NOT NULL DEFAULT 'General';
    END IF;
END $$;

-- Update fld_invno to be integer type to match legacy
DO $$
BEGIN
    -- Check if fld_invno is currently text/varchar and needs to be converted
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tbl_urls' AND column_name = 'fld_invno' 
        AND data_type IN ('text', 'character varying')
    ) THEN
        -- Convert text to integer, handling non-numeric values
        ALTER TABLE tbl_urls 
        ALTER COLUMN fld_invno TYPE INTEGER 
        USING CASE 
            WHEN fld_invno ~ '^[0-9]+$' THEN fld_invno::INTEGER 
            ELSE 0 
        END;
    END IF;
END $$;

-- 5. Fix contract foreign key issues in invoice detail tables
-- Update existing 0 values to NULL for fld_cid in invoice detail tables
UPDATE tbl_students_invoices_detail 
SET fld_cid = NULL 
WHERE fld_cid = 0;

UPDATE tbl_teachers_invoices_detail 
SET fld_cid = NULL 
WHERE fld_cid = 0;

-- Update foreign key constraints to handle NULL values
ALTER TABLE tbl_students_invoices_detail
DROP CONSTRAINT IF EXISTS fk_student_invoice_detail_contract;

ALTER TABLE tbl_students_invoices_detail
ADD CONSTRAINT fk_student_invoice_detail_contract
FOREIGN KEY (fld_cid) REFERENCES tbl_contracts(fld_id) ON DELETE SET NULL;

ALTER TABLE tbl_teachers_invoices_detail
DROP CONSTRAINT IF EXISTS fk_teacher_invoice_detail_contract;

ALTER TABLE tbl_teachers_invoices_detail
ADD CONSTRAINT fk_teacher_invoice_detail_contract
FOREIGN KEY (fld_cid) REFERENCES tbl_contracts(fld_id) ON DELETE SET NULL;
