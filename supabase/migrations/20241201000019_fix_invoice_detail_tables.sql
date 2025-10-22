-- Drop and recreate invoice detail tables to match legacy structure
-- This migration fixes the invoice detail tables to match the legacy PHP structure

-- Drop existing tables (in correct order due to foreign key constraints)
DROP TABLE IF EXISTS tbl_temp_students_invoices_detail CASCADE;
DROP TABLE IF EXISTS tbl_teachers_invoices_detail CASCADE;
DROP TABLE IF EXISTS tbl_students_invoices_detail CASCADE;

-- Recreate tbl_students_invoices_detail with legacy structure
CREATE TABLE tbl_students_invoices_detail (
    FLD_ID SERIAL PRIMARY KEY,
    FLD_IID INTEGER NOT NULL,                    -- Invoice ID -> tbl_students_invoices
    FLD_SSID INTEGER NOT NULL,                   -- Student Subject ID -> tbl_students_subjects
    FLD_CID INTEGER DEFAULT NULL,                -- Contract ID -> tbl_contracts
    FLD_DETAIL TEXT NOT NULL,                    -- Detail
    FLD_LEN_LESSON VARCHAR(100) NOT NULL,        -- Lesson Length
    FLD_L_DATE DATE NOT NULL,                    -- Lessons Date
    FLD_LESSON DECIMAL(10,2) NOT NULL,           -- No of Lesson Learnt
    FLD_S_RATE DECIMAL(10,2) NOT NULL,           -- Student Per Lesson Rate
    FLD_MY VARCHAR(10) NOT NULL,                 -- Month/Year
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate tbl_teachers_invoices_detail with legacy structure
CREATE TABLE tbl_teachers_invoices_detail (
    FLD_ID SERIAL PRIMARY KEY,
    FLD_IID INTEGER NOT NULL,                    -- Invoice ID -> tbl_teachers_invoices
    FLD_SID INTEGER NOT NULL,                    -- Student ID -> tbl_students
    FLD_SSID INTEGER NOT NULL,                    -- Student Subject ID -> tbl_students_subjects
    FLD_CID INTEGER NOT NULL,                     -- Contract ID -> tbl_contracts
    FLD_DETAIL TEXT NOT NULL,                     -- Detail
    FLD_LEN_LESSON VARCHAR(100) NOT NULL,        -- Lesson Length
    FLD_L_DATE DATE NOT NULL,                    -- Lessons Date
    FLD_LESSON DECIMAL(10,2) NOT NULL,           -- No of Lesson Taught
    FLD_T_RATE DECIMAL(10,2) NOT NULL,           -- Teacher Per Lesson Rate
    FLD_MY VARCHAR(10) NOT NULL,                 -- Month/Year
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate tbl_temp_students_invoices_detail with legacy structure
CREATE TABLE tbl_temp_students_invoices_detail (
    FLD_ID SERIAL PRIMARY KEY,
    FLD_TEMPID VARCHAR(20) NOT NULL,              -- Temporary ID for session
    FLD_DETAIL TEXT NOT NULL,                    -- Detail
    FLD_LESSON DECIMAL(10,2) NOT NULL,           -- No of Lesson Learnt
    FLD_S_RATE DECIMAL(10,2) NOT NULL,           -- Student Per Lesson Rate
    FLD_LEN_LESSON VARCHAR(100) NOT NULL,        -- Lesson Length
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraints for tbl_students_invoices_detail
ALTER TABLE tbl_students_invoices_detail 
ADD CONSTRAINT fk_student_invoice_detail_invoice 
FOREIGN KEY (FLD_IID) REFERENCES tbl_students_invoices(FLD_ID) ON DELETE CASCADE;

ALTER TABLE tbl_students_invoices_detail 
ADD CONSTRAINT fk_student_invoice_detail_subject 
FOREIGN KEY (FLD_SSID) REFERENCES tbl_students_subjects(FLD_ID) ON DELETE CASCADE;

ALTER TABLE tbl_students_invoices_detail 
ADD CONSTRAINT fk_student_invoice_detail_contract 
FOREIGN KEY (FLD_CID) REFERENCES tbl_contracts(FLD_ID) ON DELETE SET NULL;

-- Add foreign key constraints for tbl_teachers_invoices_detail
ALTER TABLE tbl_teachers_invoices_detail 
ADD CONSTRAINT fk_teacher_invoice_detail_invoice 
FOREIGN KEY (FLD_IID) REFERENCES tbl_teachers_invoices(FLD_ID) ON DELETE CASCADE;

ALTER TABLE tbl_teachers_invoices_detail 
ADD CONSTRAINT fk_teacher_invoice_detail_student 
FOREIGN KEY (FLD_SID) REFERENCES tbl_students(FLD_ID) ON DELETE CASCADE;

ALTER TABLE tbl_teachers_invoices_detail 
ADD CONSTRAINT fk_teacher_invoice_detail_subject 
FOREIGN KEY (FLD_SSID) REFERENCES tbl_students_subjects(FLD_ID) ON DELETE CASCADE;

ALTER TABLE tbl_teachers_invoices_detail 
ADD CONSTRAINT fk_teacher_invoice_detail_contract 
FOREIGN KEY (FLD_CID) REFERENCES tbl_contracts(FLD_ID) ON DELETE CASCADE;

-- Add indexes for performance
CREATE INDEX idx_students_invoices_detail_iid ON tbl_students_invoices_detail(FLD_IID);
CREATE INDEX idx_students_invoices_detail_ssid ON tbl_students_invoices_detail(FLD_SSID);
CREATE INDEX idx_students_invoices_detail_cid ON tbl_students_invoices_detail(FLD_CID);

CREATE INDEX idx_teachers_invoices_detail_iid ON tbl_teachers_invoices_detail(FLD_IID);
CREATE INDEX idx_teachers_invoices_detail_sid ON tbl_teachers_invoices_detail(FLD_SID);
CREATE INDEX idx_teachers_invoices_detail_ssid ON tbl_teachers_invoices_detail(FLD_SSID);
CREATE INDEX idx_teachers_invoices_detail_cid ON tbl_teachers_invoices_detail(FLD_CID);

CREATE INDEX idx_temp_invoices_detail_tempid ON tbl_temp_students_invoices_detail(FLD_TEMPID);

-- Add comments for documentation
COMMENT ON TABLE tbl_students_invoices_detail IS 'Student invoice line items with lesson details';
COMMENT ON TABLE tbl_teachers_invoices_detail IS 'Teacher invoice line items with lesson details';
COMMENT ON TABLE tbl_temp_students_invoices_detail IS 'Temporary invoice details for invoice creation workflow';

COMMENT ON COLUMN tbl_students_invoices_detail.FLD_IID IS 'Invoice ID reference to tbl_students_invoices';
COMMENT ON COLUMN tbl_students_invoices_detail.FLD_SSID IS 'Student Subject ID reference to tbl_students_subjects';
COMMENT ON COLUMN tbl_students_invoices_detail.FLD_CID IS 'Contract ID reference to tbl_contracts';
COMMENT ON COLUMN tbl_students_invoices_detail.FLD_LEN_LESSON IS 'Lesson duration (e.g., 60 min, 90 min)';
COMMENT ON COLUMN tbl_students_invoices_detail.FLD_L_DATE IS 'Date when lesson was conducted';
COMMENT ON COLUMN tbl_students_invoices_detail.FLD_LESSON IS 'Number of lessons (quantity)';
COMMENT ON COLUMN tbl_students_invoices_detail.FLD_S_RATE IS 'Student rate per lesson';
COMMENT ON COLUMN tbl_students_invoices_detail.FLD_MY IS 'Month/Year for billing period';

COMMENT ON COLUMN tbl_teachers_invoices_detail.FLD_IID IS 'Invoice ID reference to tbl_teachers_invoices';
COMMENT ON COLUMN tbl_teachers_invoices_detail.FLD_SID IS 'Student ID reference to tbl_students';
COMMENT ON COLUMN tbl_teachers_invoices_detail.FLD_SSID IS 'Student Subject ID reference to tbl_students_subjects';
COMMENT ON COLUMN tbl_teachers_invoices_detail.FLD_CID IS 'Contract ID reference to tbl_contracts';
COMMENT ON COLUMN tbl_teachers_invoices_detail.FLD_LEN_LESSON IS 'Lesson duration (e.g., 60 min, 90 min)';
COMMENT ON COLUMN tbl_teachers_invoices_detail.FLD_L_DATE IS 'Date when lesson was conducted';
COMMENT ON COLUMN tbl_teachers_invoices_detail.FLD_LESSON IS 'Number of lessons taught';
COMMENT ON COLUMN tbl_teachers_invoices_detail.FLD_T_RATE IS 'Teacher rate per lesson';
COMMENT ON COLUMN tbl_teachers_invoices_detail.FLD_MY IS 'Month/Year for billing period';

COMMENT ON COLUMN tbl_temp_students_invoices_detail.FLD_TEMPID IS 'Temporary session ID for invoice creation';
COMMENT ON COLUMN tbl_temp_students_invoices_detail.FLD_DETAIL IS 'Invoice line item description';
COMMENT ON COLUMN tbl_temp_students_invoices_detail.FLD_LESSON IS 'Number of lessons';
COMMENT ON COLUMN tbl_temp_students_invoices_detail.FLD_S_RATE IS 'Student rate per lesson';
COMMENT ON COLUMN tbl_temp_students_invoices_detail.FLD_LEN_LESSON IS 'Lesson duration';
