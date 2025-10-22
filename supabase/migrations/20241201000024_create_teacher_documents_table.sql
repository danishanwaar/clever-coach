-- Create teacher documents table
CREATE TABLE tbl_teacher_documents (
    fld_id SERIAL PRIMARY KEY,
    fld_tid INTEGER NOT NULL,
    fld_name VARCHAR(255) NOT NULL,
    fld_type VARCHAR(100) NOT NULL,
    fld_size BIGINT NOT NULL,
    fld_path VARCHAR(500) NOT NULL,
    fld_description TEXT,
    fld_upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fld_status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_teacher_documents_teacher 
        FOREIGN KEY (fld_tid) REFERENCES tbl_teachers(fld_id) ON DELETE CASCADE
);

-- Create index for better performance
CREATE INDEX idx_teacher_documents_tid ON tbl_teacher_documents(fld_tid);
CREATE INDEX idx_teacher_documents_status ON tbl_teacher_documents(fld_status);
CREATE INDEX idx_teacher_documents_upload_date ON tbl_teacher_documents(fld_upload_date);
