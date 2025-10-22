-- Drop the current tbl_activity_teacher table
DROP TABLE IF EXISTS tbl_activity_teacher CASCADE;

-- Recreate tbl_activity_teacher with exact legacy structure
CREATE TABLE tbl_activity_teacher (
  FLD_ID SERIAL PRIMARY KEY,
  FLD_TID INTEGER NOT NULL,
  FLD_TITLE VARCHAR(256) NOT NULL,
  FLD_CONTENT TEXT NOT NULL,
  FLD_ERDAT TIMESTAMP NOT NULL,
  FLD_UID INTEGER NOT NULL
);

-- Add foreign key constraint to tbl_users
ALTER TABLE tbl_activity_teacher 
ADD CONSTRAINT fk_activity_teacher_user 
FOREIGN KEY (FLD_UID) REFERENCES tbl_users(FLD_ID);

-- Add foreign key constraint to tbl_teachers
ALTER TABLE tbl_activity_teacher 
ADD CONSTRAINT fk_activity_teacher_teacher 
FOREIGN KEY (FLD_TID) REFERENCES tbl_teachers(FLD_ID);