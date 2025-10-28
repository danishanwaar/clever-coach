-- Fix foreign key constraints with correct column names
-- The previous constraints were created with uppercase column names (FLD_TID, FLD_ID)
-- but the actual database uses lowercase column names (fld_tid, fld_id)

-- Fix tbl_teachers_subjects_expertise foreign key constraints
ALTER TABLE tbl_teachers_subjects_expertise DROP CONSTRAINT IF EXISTS fk_teacher_subjects_teacher;
ALTER TABLE tbl_teachers_subjects_expertise 
ADD CONSTRAINT fk_teacher_subjects_teacher 
FOREIGN KEY (fld_tid) REFERENCES tbl_teachers(fld_id) ON DELETE CASCADE;

-- Fix tbl_students_subjects foreign key constraints  
ALTER TABLE tbl_students_subjects DROP CONSTRAINT IF EXISTS fk_student_subjects_student;
ALTER TABLE tbl_students_subjects 
ADD CONSTRAINT fk_student_subjects_student 
FOREIGN KEY (fld_sid) REFERENCES tbl_students(fld_id) ON DELETE CASCADE;

-- Fix other foreign key constraints that might have the same issue
ALTER TABLE tbl_teachers_subjects_expertise DROP CONSTRAINT IF EXISTS fk_teacher_subjects_subject;
ALTER TABLE tbl_teachers_subjects_expertise 
ADD CONSTRAINT fk_teacher_subjects_subject 
FOREIGN KEY (fld_sid) REFERENCES tbl_subjects(fld_id) ON DELETE CASCADE;

ALTER TABLE tbl_teachers_subjects_expertise DROP CONSTRAINT IF EXISTS fk_teacher_subjects_level;
ALTER TABLE tbl_teachers_subjects_expertise 
ADD CONSTRAINT fk_teacher_subjects_level 
FOREIGN KEY (fld_level) REFERENCES tbl_levels(fld_id) ON DELETE CASCADE;

ALTER TABLE tbl_teachers_subjects_expertise DROP CONSTRAINT IF EXISTS fk_teacher_subjects_created_by;
ALTER TABLE tbl_teachers_subjects_expertise 
ADD CONSTRAINT fk_teacher_subjects_created_by 
FOREIGN KEY (fld_uname) REFERENCES tbl_users(fld_id) ON DELETE CASCADE;

-- Fix tbl_students_subjects foreign key constraints
ALTER TABLE tbl_students_subjects DROP CONSTRAINT IF EXISTS fk_student_subjects_subject;
ALTER TABLE tbl_students_subjects 
ADD CONSTRAINT fk_student_subjects_subject 
FOREIGN KEY (fld_suid) REFERENCES tbl_subjects(fld_id) ON DELETE CASCADE;

ALTER TABLE tbl_students_subjects DROP CONSTRAINT IF EXISTS fk_student_subjects_contract;
ALTER TABLE tbl_students_subjects 
ADD CONSTRAINT fk_student_subjects_contract 
FOREIGN KEY (fld_cid) REFERENCES tbl_contracts(fld_id) ON DELETE SET NULL;

ALTER TABLE tbl_students_subjects DROP CONSTRAINT IF EXISTS fk_student_subjects_engagement;
ALTER TABLE tbl_students_subjects 
ADD CONSTRAINT fk_student_subjects_engagement 
FOREIGN KEY (fld_c_eid) REFERENCES tbl_contracts_engagement(fld_id) ON DELETE SET NULL;

ALTER TABLE tbl_students_subjects DROP CONSTRAINT IF EXISTS fk_student_subjects_created_by;
ALTER TABLE tbl_students_subjects 
ADD CONSTRAINT fk_student_subjects_created_by 
FOREIGN KEY (fld_uname) REFERENCES tbl_users(fld_id) ON DELETE SET NULL;
