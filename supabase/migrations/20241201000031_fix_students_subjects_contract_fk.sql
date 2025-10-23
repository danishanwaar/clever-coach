-- Fix foreign key constraint for tbl_students_subjects
-- Make fld_cid nullable and update foreign key constraint

-- First, drop the existing foreign key constraint
ALTER TABLE tbl_students_subjects 
DROP CONSTRAINT IF EXISTS fk_student_subjects_contract;

-- Make fld_cid nullable
ALTER TABLE tbl_students_subjects 
ALTER COLUMN fld_cid DROP NOT NULL;

-- Add the foreign key constraint back with ON DELETE SET NULL
ALTER TABLE tbl_students_subjects 
ADD CONSTRAINT fk_student_subjects_contract 
FOREIGN KEY (fld_cid) REFERENCES tbl_contracts(fld_id) 
ON DELETE SET NULL;

-- Update any existing records with fld_cid = 0 to NULL
UPDATE tbl_students_subjects 
SET fld_cid = NULL 
WHERE fld_cid = 0;
