-- Remove tbl_teacher_documents table as it doesn't exist in legacy database
-- This table was incorrectly added to the current schema

-- Drop foreign key constraints first
ALTER TABLE tbl_teacher_documents 
DROP CONSTRAINT IF EXISTS fk_teacher_documents_teacher,
DROP CONSTRAINT IF EXISTS fk_teacher_documents_user,
DROP CONSTRAINT IF EXISTS fk_teacher_documents_created_by;

-- Drop the table
DROP TABLE IF EXISTS tbl_teacher_documents;
