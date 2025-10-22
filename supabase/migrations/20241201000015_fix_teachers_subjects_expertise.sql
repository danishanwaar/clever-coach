-- Fix tbl_teachers_subjects_expertise to match legacy structure
-- Drop existing table and recreate with correct structure

DROP TABLE IF EXISTS tbl_teachers_subjects_expertise CASCADE;

CREATE TABLE tbl_teachers_subjects_expertise (
    FLD_ID SERIAL PRIMARY KEY, -- Primary Key
    FLD_TID INTEGER NOT NULL, -- Teacher ID -> tbl_teachers
    FLD_SID INTEGER NOT NULL, -- Subject ID -> tbl_subjects (not FLD_SUID)
    FLD_LEVEL INTEGER NOT NULL, -- Level ID -> tbl_levels (not FLD_EXPERTISE_LEVEL)
    FLD_EXPERIENCE DECIMAL(2,2) NOT NULL, -- Teaching Experience (not FLD_YEARS_EXPERIENCE)
    FLD_EDATE DATE NOT NULL, -- Entered On
    FLD_UNAME INTEGER NOT NULL, -- Entered By
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraints
ALTER TABLE tbl_teachers_subjects_expertise ADD CONSTRAINT fk_teacher_subjects_teacher FOREIGN KEY (FLD_TID) REFERENCES tbl_teachers(FLD_ID);
ALTER TABLE tbl_teachers_subjects_expertise ADD CONSTRAINT fk_teacher_subjects_subject FOREIGN KEY (FLD_SID) REFERENCES tbl_subjects(FLD_ID);
ALTER TABLE tbl_teachers_subjects_expertise ADD CONSTRAINT fk_teacher_subjects_level FOREIGN KEY (FLD_LEVEL) REFERENCES tbl_levels(FLD_ID);
ALTER TABLE tbl_teachers_subjects_expertise ADD CONSTRAINT fk_teacher_subjects_created_by FOREIGN KEY (FLD_UNAME) REFERENCES tbl_users(FLD_ID);

-- Add indexes
CREATE INDEX idx_tbl_teachers_subjects_teacher_id ON tbl_teachers_subjects_expertise(FLD_TID);
CREATE INDEX idx_tbl_teachers_subjects_subject_id ON tbl_teachers_subjects_expertise(FLD_SID);

-- Add trigger for updated_at
CREATE TRIGGER update_tbl_teachers_subjects_expertise_updated_at 
    BEFORE UPDATE ON tbl_teachers_subjects_expertise 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


