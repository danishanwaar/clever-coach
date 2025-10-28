-- Fix null constraint violations by making problematic columns nullable or setting defaults

-- Make fld_uname nullable in tbl_students_subjects
ALTER TABLE tbl_students_subjects 
ALTER COLUMN fld_uname DROP NOT NULL;

-- Make fld_tid nullable in tbl_teachers_students_notes
ALTER TABLE tbl_teachers_students_notes 
ALTER COLUMN fld_tid DROP NOT NULL;

-- Make fld_unavailable_from nullable in tbl_teachers_unavailability_history
ALTER TABLE tbl_teachers_unavailability_history 
ALTER COLUMN fld_unavailable_from DROP NOT NULL;
