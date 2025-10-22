-- Add missing FLD_UID field to tbl_activity_teacher
ALTER TABLE tbl_activity_teacher ADD COLUMN FLD_UID INTEGER NOT NULL DEFAULT 1;

-- Add foreign key constraint for FLD_UID
ALTER TABLE tbl_activity_teacher ADD CONSTRAINT fk_activity_teacher_user 
    FOREIGN KEY (FLD_UID) REFERENCES tbl_users(FLD_ID);


