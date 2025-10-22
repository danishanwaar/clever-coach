-- Drop and recreate tbl_teachers_lessons_history with correct legacy structure

-- Drop existing table and constraints
DROP TABLE IF EXISTS tbl_teachers_lessons_history CASCADE;

-- Recreate table with legacy structure
CREATE TABLE tbl_teachers_lessons_history (
    FLD_ID SERIAL PRIMARY KEY,
    FLD_TID INTEGER NOT NULL,                    -- Teacher ID -> tbl_teachers
    FLD_SID INTEGER NOT NULL,                   -- Student ID -> tbl_students
    FLD_SSID INTEGER NOT NULL,                  -- Student Subject ID -> tbl_students_subjects
    FLD_LESSON DECIMAL(10,2) NOT NULL,          -- Number of lessons
    FLD_S_RATE DECIMAL(10,2) NOT NULL,          -- Student per lesson rate
    FLD_T_RATE DECIMAL(10,2) NOT NULL,          -- Teacher per lesson rate
    FLD_NOTES TEXT,                             -- Notes
    FLD_EDATE DATE NOT NULL,                    -- Entered date
    FLD_UNAME INTEGER NOT NULL,                 -- Entered by user
    FLD_MON VARCHAR(2),                         -- Month (01-12)
    FLD_YEAR VARCHAR(4),                         -- Year (YYYY)
    FLD_STATUS VARCHAR(50) DEFAULT 'Pending',   -- Status
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraints
ALTER TABLE tbl_teachers_lessons_history 
ADD CONSTRAINT fk_lessons_history_teacher 
FOREIGN KEY (FLD_TID) REFERENCES tbl_teachers(FLD_ID);

ALTER TABLE tbl_teachers_lessons_history 
ADD CONSTRAINT fk_lessons_history_student 
FOREIGN KEY (FLD_SID) REFERENCES tbl_students(FLD_ID);

ALTER TABLE tbl_teachers_lessons_history 
ADD CONSTRAINT fk_lessons_history_student_subject 
FOREIGN KEY (FLD_SSID) REFERENCES tbl_students_subjects(FLD_ID);

ALTER TABLE tbl_teachers_lessons_history 
ADD CONSTRAINT fk_lessons_history_created_by 
FOREIGN KEY (FLD_UNAME) REFERENCES tbl_users(FLD_ID);

-- Add indexes for performance
CREATE INDEX idx_tbl_teachers_lessons_history_tid ON tbl_teachers_lessons_history(FLD_TID);
CREATE INDEX idx_tbl_teachers_lessons_history_sid ON tbl_teachers_lessons_history(FLD_SID);
CREATE INDEX idx_tbl_teachers_lessons_history_ssid ON tbl_teachers_lessons_history(FLD_SSID);
CREATE INDEX idx_tbl_teachers_lessons_history_sid_ssid ON tbl_teachers_lessons_history(FLD_SID, FLD_SSID);
CREATE INDEX idx_tbl_teachers_lessons_history_status ON tbl_teachers_lessons_history(FLD_STATUS);

-- Add trigger for updated_at
CREATE TRIGGER update_tbl_teachers_lessons_history_updated_at 
BEFORE UPDATE ON tbl_teachers_lessons_history 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE tbl_teachers_lessons_history IS 'Teacher lessons history - tracks individual lesson sessions';
COMMENT ON COLUMN tbl_teachers_lessons_history.FLD_TID IS 'Teacher ID -> tbl_teachers';
COMMENT ON COLUMN tbl_teachers_lessons_history.FLD_SID IS 'Student ID -> tbl_students';
COMMENT ON COLUMN tbl_teachers_lessons_history.FLD_SSID IS 'Student Subject ID -> tbl_students_subjects';
COMMENT ON COLUMN tbl_teachers_lessons_history.FLD_LESSON IS 'Number of lessons (usually 1.0 for single lesson)';
COMMENT ON COLUMN tbl_teachers_lessons_history.FLD_S_RATE IS 'Student per lesson rate';
COMMENT ON COLUMN tbl_teachers_lessons_history.FLD_T_RATE IS 'Teacher per lesson rate';
COMMENT ON COLUMN tbl_teachers_lessons_history.FLD_MON IS 'Month (01-12)';
COMMENT ON COLUMN tbl_teachers_lessons_history.FLD_YEAR IS 'Year (YYYY)';
COMMENT ON COLUMN tbl_teachers_lessons_history.FLD_STATUS IS 'Status: Pending, Invoice Created, Suspended, Deleted, Active';




