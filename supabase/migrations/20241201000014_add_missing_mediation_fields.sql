-- Add missing fields to tbl_students_mediation_stages
-- These fields were present in the legacy PHP system but missing in our migration

ALTER TABLE tbl_students_mediation_stages 
ADD COLUMN fld_m_flag VARCHAR(1) DEFAULT NULL,
ADD COLUMN fld_note TEXT DEFAULT NULL,
ADD COLUMN fld_etime VARCHAR(10) DEFAULT NULL;

-- Add comments for the new fields
COMMENT ON COLUMN tbl_students_mediation_stages.fld_m_flag IS 'Mediation flag (X = confirmed, etc.)';
COMMENT ON COLUMN tbl_students_mediation_stages.fld_note IS 'Note / Message for the mediation stage';
COMMENT ON COLUMN tbl_students_mediation_stages.fld_etime IS 'Entry time for the mediation stage';


