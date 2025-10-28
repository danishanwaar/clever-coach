-- Fix final migration issues

-- 1. Add missing fld_invno column to tbl_urls
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tbl_urls' AND column_name = 'fld_invno'
    ) THEN
        ALTER TABLE tbl_urls ADD COLUMN fld_invno VARCHAR(255);
    END IF;
END $$;

-- 2. Make more columns nullable to avoid constraint violations

-- Make fld_tid nullable in tbl_students_mediation_stages
ALTER TABLE tbl_students_mediation_stages 
ALTER COLUMN fld_tid DROP NOT NULL;

-- Make fld_tid nullable in tbl_teachers_students_activity
ALTER TABLE tbl_teachers_students_activity 
ALTER COLUMN fld_tid DROP NOT NULL;

-- Make fld_subject nullable in tbl_teachers_students_notes
ALTER TABLE tbl_teachers_students_notes 
ALTER COLUMN fld_subject DROP NOT NULL;

-- Make fld_unavailable_to nullable in tbl_teachers_unavailability_history
ALTER TABLE tbl_teachers_unavailability_history 
ALTER COLUMN fld_unavailable_to DROP NOT NULL;

-- 3. Make contract foreign keys nullable to handle 0 values

-- Make fld_cid nullable in tbl_students_subjects
ALTER TABLE tbl_students_subjects 
ALTER COLUMN fld_cid DROP NOT NULL;

-- Make fld_cid nullable in tbl_students_invoices_detail
ALTER TABLE tbl_students_invoices_detail 
ALTER COLUMN fld_cid DROP NOT NULL;

-- Make fld_cid nullable in tbl_teachers_invoices_detail
ALTER TABLE tbl_teachers_invoices_detail 
ALTER COLUMN fld_cid DROP NOT NULL;

-- 4. Update foreign key constraints to handle NULL values properly
-- Keep the foreign key constraints but make them handle NULL values

-- Update foreign key for students subjects contract (allow NULL)
ALTER TABLE tbl_students_subjects
DROP CONSTRAINT IF EXISTS fk_student_subjects_contract;

ALTER TABLE tbl_students_subjects
ADD CONSTRAINT fk_student_subjects_contract
FOREIGN KEY (fld_cid) REFERENCES tbl_contracts(fld_id) ON DELETE SET NULL;

-- Update foreign key for students invoices detail contract (allow NULL)
ALTER TABLE tbl_students_invoices_detail
DROP CONSTRAINT IF EXISTS fk_student_invoice_detail_contract;

ALTER TABLE tbl_students_invoices_detail
ADD CONSTRAINT fk_student_invoice_detail_contract
FOREIGN KEY (fld_cid) REFERENCES tbl_contracts(fld_id) ON DELETE SET NULL;

-- Update foreign key for teachers invoices detail contract (allow NULL)
ALTER TABLE tbl_teachers_invoices_detail
DROP CONSTRAINT IF EXISTS fk_teacher_invoice_detail_contract;

ALTER TABLE tbl_teachers_invoices_detail
ADD CONSTRAINT fk_teacher_invoice_detail_contract
FOREIGN KEY (fld_cid) REFERENCES tbl_contracts(fld_id) ON DELETE SET NULL;
