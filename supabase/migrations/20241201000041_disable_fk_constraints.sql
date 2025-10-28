-- Temporarily disable foreign key constraints for migration
-- This allows us to insert data in any order

-- Disable foreign key checks for students table
ALTER TABLE tbl_students 
DROP CONSTRAINT IF EXISTS fk_students_user;

-- Disable foreign key checks for teachers table  
ALTER TABLE tbl_teachers
DROP CONSTRAINT IF EXISTS fk_teachers_onboarded_by;

-- Disable foreign key checks for student subjects
ALTER TABLE tbl_students_subjects
DROP CONSTRAINT IF EXISTS fk_student_subjects_student;

-- Disable foreign key checks for teacher subjects
ALTER TABLE tbl_teachers_subjects_expertise
DROP CONSTRAINT IF EXISTS fk_teacher_subjects_teacher;

-- Disable foreign key checks for contracts
ALTER TABLE tbl_contracts
DROP CONSTRAINT IF EXISTS fk_contracts_student;

-- Disable foreign key checks for contract engagements
ALTER TABLE tbl_contracts_engagement
DROP CONSTRAINT IF EXISTS fk_engagement_student_subject;

-- Disable foreign key checks for activity tables
ALTER TABLE tbl_activity_students
DROP CONSTRAINT IF EXISTS fk_activity_students_student;

ALTER TABLE tbl_activity_teacher
DROP CONSTRAINT IF EXISTS fk_activity_teacher_teacher;

-- Disable foreign key checks for mediation stages
ALTER TABLE tbl_students_mediation_stages
DROP CONSTRAINT IF EXISTS fk_mediation_teacher;

-- Disable foreign key checks for lessons history
ALTER TABLE tbl_teachers_lessons_history
DROP CONSTRAINT IF EXISTS fk_lessons_history_teacher;

-- Disable foreign key checks for teacher documents
ALTER TABLE tbl_teachers_documents
DROP CONSTRAINT IF EXISTS fk_teacher_docs_teacher;

-- Disable foreign key checks for invoices
ALTER TABLE tbl_students_invoices
DROP CONSTRAINT IF EXISTS fk_student_invoices_student;

ALTER TABLE tbl_teachers_invoices
DROP CONSTRAINT IF EXISTS fk_teacher_invoices_teacher;
