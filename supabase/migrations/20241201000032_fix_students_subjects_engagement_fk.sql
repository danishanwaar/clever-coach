-- Fix foreign key constraint for tbl_students_subjects engagement
-- Make fld_c_eid nullable and update foreign key constraint

-- First, drop the existing foreign key constraint
ALTER TABLE tbl_students_subjects 
DROP CONSTRAINT IF EXISTS fk_student_subjects_engagement;

-- Make fld_c_eid nullable
ALTER TABLE tbl_students_subjects 
ALTER COLUMN fld_c_eid DROP NOT NULL;

-- Add the foreign key constraint back with ON DELETE SET NULL
ALTER TABLE tbl_students_subjects 
ADD CONSTRAINT fk_student_subjects_engagement 
FOREIGN KEY (fld_c_eid) REFERENCES tbl_contracts_engagement(fld_id) 
ON DELETE SET NULL;

-- Update any existing records with fld_c_eid = 0 to NULL
UPDATE tbl_students_subjects 
SET fld_c_eid = NULL 
WHERE fld_c_eid = 0;
