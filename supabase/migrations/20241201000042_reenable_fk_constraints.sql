-- Re-enable foreign key constraints after migration
-- This should be run after the data migration is complete

-- Re-enable foreign key checks for students table
ALTER TABLE tbl_students 
ADD CONSTRAINT fk_students_user 
FOREIGN KEY (fld_uid) REFERENCES tbl_users(fld_id) ON DELETE SET NULL;

-- Re-enable foreign key checks for teachers table  
ALTER TABLE tbl_teachers
ADD CONSTRAINT fk_teachers_onboarded_by
FOREIGN KEY (fld_onboard_uid) REFERENCES tbl_users(fld_id) ON DELETE SET NULL;

-- Re-enable foreign key checks for student subjects
ALTER TABLE tbl_students_subjects
ADD CONSTRAINT fk_student_subjects_student
FOREIGN KEY (fld_sid) REFERENCES tbl_students(fld_id) ON DELETE CASCADE;

-- Re-enable foreign key checks for teacher subjects
ALTER TABLE tbl_teachers_subjects_expertise
ADD CONSTRAINT fk_teacher_subjects_teacher
FOREIGN KEY (fld_tid) REFERENCES tbl_teachers(fld_id) ON DELETE CASCADE;

-- Re-enable foreign key checks for contracts
ALTER TABLE tbl_contracts
ADD CONSTRAINT fk_contracts_student
FOREIGN KEY (fld_sid) REFERENCES tbl_students(fld_id) ON DELETE CASCADE;

-- Re-enable foreign key checks for contract engagements
ALTER TABLE tbl_contracts_engagement
ADD CONSTRAINT fk_engagement_student_subject
FOREIGN KEY (fld_ssid) REFERENCES tbl_students_subjects(fld_id) ON DELETE CASCADE;

-- Re-enable foreign key checks for activity tables
ALTER TABLE tbl_activity_students
ADD CONSTRAINT fk_activity_students_student
FOREIGN KEY (fld_sid) REFERENCES tbl_students(fld_id) ON DELETE CASCADE;

ALTER TABLE tbl_activity_teacher
ADD CONSTRAINT fk_activity_teacher_teacher
FOREIGN KEY (fld_tid) REFERENCES tbl_teachers(fld_id) ON DELETE CASCADE;

-- Re-enable foreign key checks for mediation stages
ALTER TABLE tbl_students_mediation_stages
ADD CONSTRAINT fk_mediation_teacher
FOREIGN KEY (fld_tid) REFERENCES tbl_teachers(fld_id) ON DELETE CASCADE;

-- Re-enable foreign key checks for lessons history
ALTER TABLE tbl_teachers_lessons_history
ADD CONSTRAINT fk_lessons_history_teacher
FOREIGN KEY (fld_tid) REFERENCES tbl_teachers(fld_id) ON DELETE CASCADE;

-- Re-enable foreign key checks for teacher documents
ALTER TABLE tbl_teachers_documents
ADD CONSTRAINT fk_teacher_docs_teacher
FOREIGN KEY (fld_tid) REFERENCES tbl_teachers(fld_id) ON DELETE CASCADE;

-- Re-enable foreign key checks for invoices
ALTER TABLE tbl_students_invoices
ADD CONSTRAINT fk_student_invoices_student
FOREIGN KEY (fld_sid) REFERENCES tbl_students(fld_id) ON DELETE CASCADE;

ALTER TABLE tbl_teachers_invoices
ADD CONSTRAINT fk_teacher_invoices_teacher
FOREIGN KEY (fld_tid) REFERENCES tbl_teachers(fld_id) ON DELETE CASCADE;
