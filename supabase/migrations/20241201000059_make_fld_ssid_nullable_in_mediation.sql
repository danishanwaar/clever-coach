-- Make fld_ssid nullable in tbl_students_mediation_stages
-- This allows records without a valid student subject reference

-- First, drop the existing foreign key constraint
ALTER TABLE tbl_students_mediation_stages 
DROP CONSTRAINT IF EXISTS fk_mediation_student_subject;

-- Alter the column to allow NULL values
ALTER TABLE tbl_students_mediation_stages 
ALTER COLUMN fld_ssid DROP NOT NULL;

-- Re-add the foreign key constraint with ON DELETE SET NULL to handle cases where the referenced record is deleted
ALTER TABLE tbl_students_mediation_stages 
ADD CONSTRAINT fk_mediation_student_subject 
FOREIGN KEY (fld_ssid) REFERENCES tbl_students_subjects(fld_id) 
ON DELETE SET NULL;
