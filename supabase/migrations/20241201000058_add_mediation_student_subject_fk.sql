-- Add back the missing foreign key constraint for tbl_students_mediation_stages
-- This constraint was dropped in migration 20241201000047 but not re-added

ALTER TABLE tbl_students_mediation_stages 
ADD CONSTRAINT fk_mediation_student_subject 
FOREIGN KEY (fld_ssid) REFERENCES tbl_students_subjects(fld_id) 
ON DELETE CASCADE;
