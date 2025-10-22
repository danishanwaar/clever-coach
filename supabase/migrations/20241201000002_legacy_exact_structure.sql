-- Legacy Exact Structure Migration
-- Based on adminclever_clever (1).sql with exact field names and structure
-- Converting MySQL to PostgreSQL with FLD_ID -> id (SERIAL)

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types based on legacy structure
CREATE TYPE activity_status AS ENUM ('Active', 'Inactive');
CREATE TYPE verification_status AS ENUM ('Y', 'N');
CREATE TYPE form_fill_status AS ENUM ('Y', 'N');
CREATE TYPE salutation AS ENUM ('Herr', 'Frau', 'Divers', 'N/A');
CREATE TYPE student_relation AS ENUM ('Sohn', 'Tochter', 'Andere', 'N/A');
CREATE TYPE gender AS ENUM ('Männlich', 'Weiblich', 'Divers');
CREATE TYPE student_status AS ENUM ('Leads', 'Mediation Open', 'Partially Mediated', 'Mediated', 'Specialist Consulting', 'Contracted Customers', 'Suspended', 'Deleted', 'Unplaceable', 'Waiting List', 'Appointment Call', 'Follow-up', 'Appl');
CREATE TYPE teacher_status AS ENUM ('New', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected', 'Deleted', 'Pending For Signature', 'Suspended', 'Inactive', 'Waiting List', 'Unclear');
CREATE TYPE contract_status AS ENUM ('Pending Signature', 'Active', 'On-Hold', 'Deleted', 'Suspended');
CREATE TYPE engagement_status AS ENUM ('Active', 'Inactive');
CREATE TYPE invoice_status AS ENUM ('Active', 'Paid', 'Suspended', 'Deleted');
CREATE TYPE invoice_type AS ENUM ('Normal', 'Negative');
CREATE TYPE yes_no AS ENUM ('Y', 'N');
CREATE TYPE availability_status AS ENUM ('Y', 'N');

-- tbl_activities_types
CREATE TABLE tbl_activities_types (
    FLD_ID SERIAL PRIMARY KEY, -- Primary Key
    FLD_ACTIVITY_NAME VARCHAR(256) NOT NULL, -- Name
    FLD_STATUS activity_status NOT NULL, -- Status
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- tbl_activity_applicants
CREATE TABLE tbl_activity_applicants (
    FLD_ID SERIAL PRIMARY KEY, -- Primary Key
    FLD_AID INTEGER NOT NULL, -- Applicant ID
    FLD_TITLE VARCHAR(256) NOT NULL, -- Title
    FLD_CONTENT TEXT NOT NULL, -- Content
    FLD_ERDAT TIMESTAMP WITH TIME ZONE NOT NULL, -- Entry Date
    FLD_UID INTEGER NOT NULL, -- User ID -> tbl_users
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- tbl_activity_matcher
CREATE TABLE tbl_activity_matcher (
    FLD_ID SERIAL PRIMARY KEY,
    FLD_TID INTEGER NOT NULL,
    FLD_TITLE VARCHAR(256) NOT NULL,
    FLD_CONTENT TEXT NOT NULL,
    FLD_ERDAT TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- tbl_activity_students
CREATE TABLE tbl_activity_students (
    FLD_ID SERIAL PRIMARY KEY, -- Primary Key
    FLD_SID INTEGER NOT NULL, -- Student ID -> tbl_students
    FLD_TITLE VARCHAR(256) NOT NULL, -- Title
    FLD_CONTENT TEXT NOT NULL, -- Content
    FLD_ERDAT TIMESTAMP WITH TIME ZONE NOT NULL, -- Entry Date
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- tbl_activity_teacher
CREATE TABLE tbl_activity_teacher (
    FLD_ID SERIAL PRIMARY KEY, -- Primary Key
    FLD_TID INTEGER NOT NULL, -- Teacher ID -> tbl_teachers
    FLD_TITLE VARCHAR(256) NOT NULL, -- Title
    FLD_CONTENT TEXT NOT NULL, -- Content
    FLD_ERDAT TIMESTAMP WITH TIME ZONE NOT NULL, -- Entry Date
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- tbl_contracts
CREATE TABLE tbl_contracts (
    FLD_ID SERIAL PRIMARY KEY, -- Primary Key
    FLD_SID INTEGER NOT NULL, -- Student ID -> tbl_students
    FLD_CT VARCHAR(10), -- Contract Type
    FLD_START_DATE DATE NOT NULL, -- Start Date
    FLD_END_DATE DATE NOT NULL, -- End Date
    FLD_P_MODE VARCHAR(256) NOT NULL, -- Payment Mode
    FLD_LP VARCHAR(20) NOT NULL, -- Lesson Package
    FLD_LESSON_DUR VARCHAR(256) NOT NULL, -- Lesson Duration
    FLD_MIN_LESSON DECIMAL(10,2) NOT NULL, -- Minimum Lessons
    FLD_REG_FEE DECIMAL(16,2) NOT NULL, -- Registration Fee
    FLD_S_PER_LESSON_RATE DECIMAL(16,2) NOT NULL, -- Student Per Lesson Rate
    FLD_FILE TEXT, -- PDF File
    FLD_BI VARCHAR(256), -- Banking Institution
    FLD_IBAN VARCHAR(256), -- IBAN
    FLD_BIC VARCHAR(256), -- BIC
    FLD_MNO VARCHAR(256), -- Mandate Reference
    FLD_SIGNATURE TEXT, -- Signature
    FLD_BPS VARCHAR(10), -- Bypass Signature
    FLD_ENAME INTEGER NOT NULL, -- Entered By
    FLD_EDATE DATE NOT NULL, -- Entered On
    FLD_STATUS contract_status NOT NULL, -- Status
    FLD_EDTIM TIMESTAMP WITH TIME ZONE, -- Entry Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- tbl_contracts_engagement
CREATE TABLE tbl_contracts_engagement (
    FLD_ID SERIAL PRIMARY KEY, -- Primary Key
    FLD_SSID INTEGER NOT NULL, -- Student Subject ID -> tbl_students_subjects
    FLD_CID INTEGER NOT NULL, -- Contract ID -> tbl_contracts
    FLD_TID INTEGER NOT NULL, -- Teacher ID -> tbl_teachers
    FLD_T_PER_LESSON_RATE DECIMAL(16,2) NOT NULL, -- Teacher Per Lesson Rate
    FLD_ENAME INTEGER NOT NULL, -- Entered By
    FLD_EDATE DATE NOT NULL, -- Entered On
    FLD_STATUS engagement_status NOT NULL, -- Status
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- tbl_contracts_log
CREATE TABLE tbl_contracts_log (
    FLD_ID SERIAL PRIMARY KEY,
    FLD_CID INTEGER NOT NULL,
    FLD_STATUS VARCHAR(100) NOT NULL,
    FLD_EDATE DATE NOT NULL,
    FLD_UNAME INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- tbl_countries
CREATE TABLE tbl_countries (
    FLD_ID SERIAL PRIMARY KEY,
    FLD_LANDX VARCHAR(15) NOT NULL,
    FLD_LANDX50 VARCHAR(50) NOT NULL,
    FLD_LFLAG activity_status DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- tbl_degrees
CREATE TABLE tbl_degrees (
    FLD_ID SERIAL PRIMARY KEY,
    FLD_DEGREE_NAME VARCHAR(256) NOT NULL,
    FLD_STATUS activity_status NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- tbl_delete_reasons
CREATE TABLE tbl_delete_reasons (
    FLD_ID SERIAL PRIMARY KEY,
    FLD_REASON VARCHAR(256) NOT NULL,
    FLD_TYPE VARCHAR(20) NOT NULL,
    FLD_STATUS activity_status NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- tbl_educational
CREATE TABLE tbl_educational (
    FLD_ID SERIAL PRIMARY KEY,
    FLD_ENAME VARCHAR(256) NOT NULL,
    FLD_STATUS activity_status NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- tbl_lesson_durations
CREATE TABLE tbl_lesson_durations (
    FLD_ID SERIAL PRIMARY KEY,
    FLD_L_DURATION VARCHAR(256) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- tbl_levels
CREATE TABLE tbl_levels (
    FLD_ID SERIAL PRIMARY KEY,
    FLD_LEVEL VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- tbl_mediation_types
CREATE TABLE tbl_mediation_types (
    FLD_ID SERIAL PRIMARY KEY,
    FLD_RID INTEGER NOT NULL,
    FLD_STAGE_NAME VARCHAR(256) NOT NULL,
    FLD_STATUS activity_status NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- tbl_reasons
CREATE TABLE tbl_reasons (
    FLD_ID SERIAL PRIMARY KEY,
    FLD_REASON VARCHAR(256) NOT NULL,
    FLD_STATUS activity_status NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- tbl_roles
CREATE TABLE tbl_roles (
    FLD_ID SERIAL PRIMARY KEY, -- Primary Key
    FLD_ROLE VARCHAR(20) NOT NULL, -- Role Name
    FLD_EDATE DATE NOT NULL, -- Entered On
    FLD_STATUS activity_status NOT NULL DEFAULT 'Active', -- Status
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- tbl_source
CREATE TABLE tbl_source (
    FLD_ID SERIAL PRIMARY KEY,
    FLD_TYPE VARCHAR(20) NOT NULL,
    FLD_SOURCE VARCHAR(256) NOT NULL,
    FLD_STATUS activity_status NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- tbl_students
CREATE TABLE tbl_students (
    FLD_ID SERIAL PRIMARY KEY, -- Primary Key
    FLD_SAL salutation, -- Salutation
    FLD_FIRST_NAME VARCHAR(100) NOT NULL, -- First Name
    FLD_LAST_NAME VARCHAR(100) NOT NULL, -- Last Name
    FLD_SD student_relation, -- Student Relation
    FLD_S_FIRST_NAME VARCHAR(256), -- Father Name
    FLD_S_LAST_NAME VARCHAR(256), -- Father Last Name
    FLD_LEVEL VARCHAR(256), -- Level
    FLD_SCHOOL VARCHAR(256), -- School
    FLD_GENDER gender, -- Gender
    FLD_DOB DATE, -- Date of birth
    FLD_EMAIL TEXT NOT NULL, -- Email
    FLD_PHONE VARCHAR(20) NOT NULL, -- Phone
    FLD_MOBILE VARCHAR(20), -- Mobile
    FLD_CITY VARCHAR(100) NOT NULL, -- City
    FLD_STATE VARCHAR(100), -- State
    FLD_ZIP VARCHAR(100), -- Zip Code
    FLD_COUNTRY VARCHAR(100) DEFAULT 'Germany', -- Country
    FLD_ADDRESS TEXT, -- Address
    FLD_LATITUDE VARCHAR(256), -- Latitude
    FLD_LONGITUDE VARCHAR(256), -- Longitude
    FLD_BANK_ACT VARCHAR(50), -- Bank Account
    FLD_BAKK_RNO VARCHAR(50), -- Routing No
    FLD_BANK_NAME VARCHAR(256), -- Bank Name
    FLD_L_MODE VARCHAR(50), -- Mode of Learning
    FLD_SHORT_BIO TEXT, -- Short BIO
    FLD_SU_TYPE VARCHAR(256), -- Subject Type
    FLD_REASON VARCHAR(256), -- Reason
    FLD_F_LEAD VARCHAR(256), -- First Lead
    FLD_NOTES TEXT, -- Notes
    FLD_SELF_PAID yes_no, -- Self Paid
    FLD_PAYER VARCHAR(256), -- Payer
    FLD_CT VARCHAR(256), -- Contract Type
    FLD_WH VARCHAR(50), -- Working Hours
    FLD_LD VARCHAR(50), -- Lesson Duration
    FLD_PRICE DECIMAL(16,2), -- Price
    FLD_REG_FEE DECIMAL(10,2) DEFAULT 0.00, -- Registration Fee
    FLD_UID INTEGER NOT NULL, -- User ID -> tbl_users
    FLD_STATUS student_status NOT NULL, -- Status
    FLD_IM_STATUS INTEGER DEFAULT 0, -- IM Status
    FLD_EDATE TIMESTAMP WITH TIME ZONE NOT NULL, -- Created On
    FLD_UNAME INTEGER, -- Created By
    FLD_NEC yes_no, -- Needs Contract
    FLD_RF_FLAG yes_no, -- Registration Fee Flag
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- tbl_students_documents
CREATE TABLE tbl_students_documents (
    FLD_ID SERIAL PRIMARY KEY,
    FLD_SID INTEGER NOT NULL DEFAULT 0,
    FLD_UID INTEGER NOT NULL,
    FLD_DOC_FILE TEXT NOT NULL,
    FLD_EDATE DATE NOT NULL,
    FLD_UNAME INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- tbl_students_invoices
CREATE TABLE tbl_students_invoices (
    FLD_ID SERIAL PRIMARY KEY, -- Primary Key
    FLD_I_TYPE invoice_type DEFAULT 'Normal', -- Invoice Type
    FLD_SID INTEGER NOT NULL, -- Student ID -> tbl_students
    FLD_LHID VARCHAR(256), -- Lesson History ID
    FLD_CID VARCHAR(100), -- Contract ID
    FLD_INVOICE_TOTAL DECIMAL(16,2) NOT NULL, -- Invoice Total
    FLD_INVOICE_HR DECIMAL(10,2) NOT NULL, -- Invoice Hours
    FLD_MIN_LESSON DECIMAL(10,2), -- Minimum Lessons
    FLD_CH_HR yes_no DEFAULT 'N', -- Charge Hours
    FLD_NOTES TEXT, -- Notes
    FLD_EDATE DATE NOT NULL, -- Entered Date
    FLD_UNAME INTEGER NOT NULL, -- Entered By
    FLD_STATUS invoice_status NOT NULL, -- Status
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- tbl_students_invoices_detail
CREATE TABLE tbl_students_invoices_detail (
    FLD_ID SERIAL PRIMARY KEY, -- Primary Key
    FLD_IID INTEGER NOT NULL, -- Invoice ID -> tbl_students_invoices
    FLD_SSID INTEGER NOT NULL, -- Student Subject ID -> tbl_students_subjects
    FLD_CID INTEGER, -- Contract ID -> tbl_contracts
    FLD_DETAIL TEXT NOT NULL, -- Detail
    FLD_EDATE DATE NOT NULL, -- Entered Date
    FLD_UNAME INTEGER NOT NULL, -- Entered By
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- tbl_students_mediation_stages
CREATE TABLE tbl_students_mediation_stages (
    FLD_ID SERIAL PRIMARY KEY,
    FLD_TID INTEGER NOT NULL,
    FLD_SID INTEGER NOT NULL,
    FLD_SSID INTEGER NOT NULL,
    FLD_M_TYPE INTEGER NOT NULL,
    FLD_EDATE DATE NOT NULL,
    FLD_UNAME INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- tbl_students_subjects
CREATE TABLE tbl_students_subjects (
    FLD_ID SERIAL PRIMARY KEY, -- Primary Key
    FLD_SID INTEGER NOT NULL, -- Student ID -> tbl_students
    FLD_SUID INTEGER NOT NULL, -- Subject ID -> tbl_subjects
    FLD_CID INTEGER NOT NULL, -- Contract ID -> tbl_contracts
    FLD_C_EID INTEGER DEFAULT 0, -- Contract Engagement ID -> tbl_contracts_engagement
    FLD_DETAIL TEXT, -- Detail
    FLD_EDATE DATE NOT NULL, -- Entered Date
    FLD_UNAME INTEGER NOT NULL, -- Entered By
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- tbl_subjects
CREATE TABLE tbl_subjects (
    FLD_ID SERIAL PRIMARY KEY, -- Primary Key
    FLD_SUBJECT VARCHAR(256) NOT NULL, -- Subject Name
    FLD_IMAGE VARCHAR(256), -- Image
    FLD_STATUS activity_status NOT NULL, -- Status
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- tbl_su_types
CREATE TABLE tbl_su_types (
    FLD_ID SERIAL PRIMARY KEY,
    FLD_NAME VARCHAR(256) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- tbl_t000
CREATE TABLE tbl_t000 (
    FLD_ID SERIAL PRIMARY KEY,
    FLD_BURKS VARCHAR(4),
    FLD_NAME1 VARCHAR(30) NOT NULL,
    FLD_CNTRY INTEGER NOT NULL DEFAULT 0,
    FLD_NAME2 VARCHAR(30),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- tbl_teachers
CREATE TABLE tbl_teachers (
    FLD_ID SERIAL PRIMARY KEY, -- Primary Key
    FLD_FIRST_NAME VARCHAR(100) NOT NULL, -- First Name
    FLD_LAST_NAME VARCHAR(100) NOT NULL, -- Last Name
    FLD_GENDER gender NOT NULL, -- Gender
    FLD_DOB DATE NOT NULL, -- Date of Birth
    FLD_ID_NO VARCHAR(50), -- ID Number
    FLD_EMAIL TEXT NOT NULL, -- Email
    FLD_PHONE VARCHAR(20) NOT NULL, -- Phone
    FLD_STREET VARCHAR(50), -- Street
    FLD_CITY VARCHAR(100) NOT NULL, -- City
    FLD_STATE VARCHAR(100), -- State
    FLD_ZIP VARCHAR(100) NOT NULL, -- Zip Code
    FLD_COUNTRY VARCHAR(100) DEFAULT 'Germany', -- Country
    FLD_ADDRESS TEXT, -- Address
    FLD_ADDRESS2 TEXT, -- Address 2
    FLD_EDUCATION TEXT NOT NULL, -- Education
    FLD_LATITUDE VARCHAR(256), -- Latitude
    FLD_LONGITUDE VARCHAR(256), -- Longitude
    FLD_BANK_ACT VARCHAR(50), -- Bank Account
    FLD_BAKK_RNO VARCHAR(50), -- Bank Routing Number
    FLD_BANK_NAME VARCHAR(256), -- Bank Name
    FLD_T_MODE VARCHAR(50) NOT NULL, -- Transport Mode
    FLD_L_MODE VARCHAR(50), -- Learning Mode
    FLD_IS_AVAILABLE availability_status DEFAULT 'Y', -- Is Available
    FLD_SHORT_BIO TEXT, -- Short Bio
    FLD_SELF TEXT NOT NULL, -- Self Description
    FLD_SOURCE VARCHAR(256) NOT NULL, -- Source
    FLD_T_SUBJECTS VARCHAR(50), -- Teacher Subjects
    FLD_UID INTEGER NOT NULL, -- User ID -> tbl_users
    FLD_STATUS teacher_status NOT NULL, -- Status
    FLD_EDATE TIMESTAMP WITH TIME ZONE NOT NULL, -- Created On
    FLD_UNAME INTEGER NOT NULL, -- Created By
    FLD_ONBOARD_DATE TIMESTAMP WITH TIME ZONE, -- Onboard Date
    FLD_ONBOARD_UID INTEGER DEFAULT 0, -- Onboarded By
    FLD_SIGNATURE TEXT, -- Signature
    FLD_PIMAGE TEXT, -- Profile Image
    FLD_PER_L_RATE VARCHAR(20) DEFAULT '0.00', -- Per Lesson Rate
    FLD_REASON TEXT, -- Reason
    FLD_EVALUATION TEXT, -- Evaluation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- tbl_teachers_documents
CREATE TABLE tbl_teachers_documents (
    FLD_ID SERIAL PRIMARY KEY,
    FLD_TID INTEGER NOT NULL DEFAULT 0,
    FLD_UID INTEGER NOT NULL,
    FLD_DOC_FILE TEXT NOT NULL,
    FLD_EDATE DATE NOT NULL,
    FLD_UNAME INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- tbl_teachers_invoices
CREATE TABLE tbl_teachers_invoices (
    FLD_ID SERIAL PRIMARY KEY, -- Primary Key
    FLD_TID INTEGER NOT NULL, -- Teacher ID -> tbl_teachers
    FLD_LHID VARCHAR(256), -- Lesson History ID
    FLD_CID VARCHAR(100), -- Contract ID
    FLD_INVOICE_TOTAL DECIMAL(16,2) NOT NULL, -- Invoice Total
    FLD_INVOICE_HR DECIMAL(10,2) NOT NULL, -- Invoice Hours
    FLD_MIN_LESSON DECIMAL(10,2), -- Minimum Lessons
    FLD_CH_HR yes_no DEFAULT 'N', -- Charge Hours
    FLD_NOTES TEXT, -- Notes
    FLD_EDATE DATE NOT NULL, -- Entered Date
    FLD_UNAME INTEGER NOT NULL, -- Entered By
    FLD_STATUS invoice_status NOT NULL, -- Status
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- tbl_teachers_invoices_detail
CREATE TABLE tbl_teachers_invoices_detail (
    FLD_ID SERIAL PRIMARY KEY,
    FLD_IID INTEGER NOT NULL,
    FLD_TSID INTEGER NOT NULL,
    FLD_CID INTEGER,
    FLD_DETAIL TEXT NOT NULL,
    FLD_EDATE DATE NOT NULL,
    FLD_UNAME INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- tbl_teachers_lessons_history
CREATE TABLE tbl_teachers_lessons_history (
    FLD_ID SERIAL PRIMARY KEY,
    FLD_TID INTEGER NOT NULL,
    FLD_SID INTEGER NOT NULL,
    FLD_SUID INTEGER NOT NULL,
    FLD_LESSON_DATE DATE NOT NULL,
    FLD_LESSON_DURATION INTEGER NOT NULL,
    FLD_LESSON_RATE DECIMAL(10,2) NOT NULL,
    FLD_TOTAL_AMOUNT DECIMAL(10,2) NOT NULL,
    FLD_STATUS VARCHAR(50),
    FLD_NOTES TEXT,
    FLD_EDATE TIMESTAMP WITH TIME ZONE NOT NULL,
    FLD_UNAME INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- tbl_teachers_students_activity
CREATE TABLE tbl_teachers_students_activity (
    FLD_ID SERIAL PRIMARY KEY,
    FLD_TID INTEGER NOT NULL,
    FLD_SID INTEGER NOT NULL,
    FLD_ACTIVITY_TYPE_ID INTEGER NOT NULL,
    FLD_DESCRIPTION TEXT,
    FLD_NOTES TEXT,
    FLD_EDATE TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- tbl_teachers_students_notes
CREATE TABLE tbl_teachers_students_notes (
    FLD_ID SERIAL PRIMARY KEY,
    FLD_TID INTEGER NOT NULL,
    FLD_SID INTEGER NOT NULL,
    FLD_SUBJECT VARCHAR(256) NOT NULL,
    FLD_BODY TEXT NOT NULL,
    FLD_EDATE TIMESTAMP WITH TIME ZONE NOT NULL,
    FLD_UNAME INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- tbl_teachers_subjects_expertise
CREATE TABLE tbl_teachers_subjects_expertise (
    FLD_ID SERIAL PRIMARY KEY, -- Primary Key
    FLD_TID INTEGER NOT NULL, -- Teacher ID -> tbl_teachers
    FLD_SUID INTEGER NOT NULL, -- Subject ID -> tbl_subjects
    FLD_EXPERTISE_LEVEL VARCHAR(50), -- Expertise Level
    FLD_YEARS_EXPERIENCE INTEGER, -- Years Experience
    FLD_HOURLY_RATE DECIMAL(10,2), -- Hourly Rate
    FLD_IS_ACTIVE availability_status DEFAULT 'Y', -- Is Active
    FLD_EDATE TIMESTAMP WITH TIME ZONE NOT NULL, -- Entered Date
    FLD_UNAME INTEGER NOT NULL, -- Entered By
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- tbl_teachers_unavailability_history
CREATE TABLE tbl_teachers_unavailability_history (
    FLD_ID SERIAL PRIMARY KEY,
    FLD_TID INTEGER NOT NULL,
    FLD_UNAVAILABLE_FROM DATE NOT NULL,
    FLD_UNAVAILABLE_TO DATE NOT NULL,
    FLD_REASON TEXT,
    FLD_IS_ACTIVE availability_status DEFAULT 'Y',
    FLD_EDATE TIMESTAMP WITH TIME ZONE NOT NULL,
    FLD_UNAME INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- tbl_temp_students_invoices_detail
CREATE TABLE tbl_temp_students_invoices_detail (
    FLD_ID SERIAL PRIMARY KEY,
    FLD_IID INTEGER NOT NULL,
    FLD_SSID INTEGER NOT NULL,
    FLD_CID INTEGER,
    FLD_DETAIL TEXT NOT NULL,
    FLD_EDATE DATE NOT NULL,
    FLD_UNAME INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- tbl_urls
CREATE TABLE tbl_urls (
    FLD_ID SERIAL PRIMARY KEY,
    FLD_URL TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- tbl_users
CREATE TABLE tbl_users (
    FLD_ID SERIAL PRIMARY KEY, -- Primary Key
    AUTH_USER_ID UUID REFERENCES auth.users(id), -- Supabase Auth User ID
    FLD_RID INTEGER NOT NULL, -- Role ID -> tbl_roles
    FLD_NAME VARCHAR(256) NOT NULL, -- Name
    FLD_EMAIL TEXT NOT NULL, -- Email
    FLD_PASSCODE TEXT NOT NULL, -- Password
    FLD_IS_VERIFY verification_status NOT NULL, -- Is Verified
    FLD_IS_FORM_FILL form_fill_status NOT NULL, -- Is Form Filled
    FLD_LAST_LOGIN DATE, -- Last Login
    FLD_OTP VARCHAR(6), -- OTP
    FLD_F_TIME_LOGIN yes_no, -- First Time Login
    FLD_STATUS activity_status NOT NULL, -- Status
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- tbl_users_activities
CREATE TABLE tbl_users_activities (
    FLD_ID SERIAL PRIMARY KEY,
    FLD_UID INTEGER NOT NULL,
    FLD_ACTIVITY_TYPE_ID INTEGER NOT NULL,
    FLD_TITLE VARCHAR(256) NOT NULL,
    FLD_CONTENT TEXT NOT NULL,
    FLD_ERDAT TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- tbl_users_time_log
CREATE TABLE tbl_users_time_log (
    FLD_ID SERIAL PRIMARY KEY,
    FLD_UID INTEGER NOT NULL,
    FLD_LOGIN_TIME TIMESTAMP WITH TIME ZONE,
    FLD_LOGOUT_TIME TIMESTAMP WITH TIME ZONE,
    FLD_SESSION_DURATION INTEGER,
    FLD_IP_ADDRESS INET,
    FLD_USER_AGENT TEXT,
    FLD_ERDAT TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_tbl_activities_types_updated_at BEFORE UPDATE ON tbl_activities_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tbl_activity_applicants_updated_at BEFORE UPDATE ON tbl_activity_applicants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tbl_activity_matcher_updated_at BEFORE UPDATE ON tbl_activity_matcher FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tbl_activity_students_updated_at BEFORE UPDATE ON tbl_activity_students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tbl_activity_teacher_updated_at BEFORE UPDATE ON tbl_activity_teacher FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tbl_contracts_updated_at BEFORE UPDATE ON tbl_contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tbl_contracts_engagement_updated_at BEFORE UPDATE ON tbl_contracts_engagement FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tbl_contracts_log_updated_at BEFORE UPDATE ON tbl_contracts_log FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tbl_countries_updated_at BEFORE UPDATE ON tbl_countries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tbl_degrees_updated_at BEFORE UPDATE ON tbl_degrees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tbl_delete_reasons_updated_at BEFORE UPDATE ON tbl_delete_reasons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tbl_educational_updated_at BEFORE UPDATE ON tbl_educational FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tbl_lesson_durations_updated_at BEFORE UPDATE ON tbl_lesson_durations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tbl_levels_updated_at BEFORE UPDATE ON tbl_levels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tbl_mediation_types_updated_at BEFORE UPDATE ON tbl_mediation_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tbl_reasons_updated_at BEFORE UPDATE ON tbl_reasons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tbl_roles_updated_at BEFORE UPDATE ON tbl_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tbl_source_updated_at BEFORE UPDATE ON tbl_source FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tbl_students_updated_at BEFORE UPDATE ON tbl_students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tbl_students_documents_updated_at BEFORE UPDATE ON tbl_students_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tbl_students_invoices_updated_at BEFORE UPDATE ON tbl_students_invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tbl_students_invoices_detail_updated_at BEFORE UPDATE ON tbl_students_invoices_detail FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tbl_students_mediation_stages_updated_at BEFORE UPDATE ON tbl_students_mediation_stages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tbl_students_subjects_updated_at BEFORE UPDATE ON tbl_students_subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tbl_subjects_updated_at BEFORE UPDATE ON tbl_subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tbl_su_types_updated_at BEFORE UPDATE ON tbl_su_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tbl_t000_updated_at BEFORE UPDATE ON tbl_t000 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tbl_teachers_updated_at BEFORE UPDATE ON tbl_teachers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tbl_teachers_documents_updated_at BEFORE UPDATE ON tbl_teachers_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tbl_teachers_invoices_updated_at BEFORE UPDATE ON tbl_teachers_invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tbl_teachers_invoices_detail_updated_at BEFORE UPDATE ON tbl_teachers_invoices_detail FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tbl_teachers_lessons_history_updated_at BEFORE UPDATE ON tbl_teachers_lessons_history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tbl_teachers_students_activity_updated_at BEFORE UPDATE ON tbl_teachers_students_activity FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tbl_teachers_students_notes_updated_at BEFORE UPDATE ON tbl_teachers_students_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tbl_teachers_subjects_expertise_updated_at BEFORE UPDATE ON tbl_teachers_subjects_expertise FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tbl_teachers_unavailability_history_updated_at BEFORE UPDATE ON tbl_teachers_unavailability_history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tbl_temp_students_invoices_detail_updated_at BEFORE UPDATE ON tbl_temp_students_invoices_detail FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tbl_urls_updated_at BEFORE UPDATE ON tbl_urls FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tbl_users_updated_at BEFORE UPDATE ON tbl_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tbl_users_activities_updated_at BEFORE UPDATE ON tbl_users_activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tbl_users_time_log_updated_at BEFORE UPDATE ON tbl_users_time_log FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add foreign key constraints
ALTER TABLE tbl_contracts ADD CONSTRAINT fk_contracts_student FOREIGN KEY (FLD_SID) REFERENCES tbl_students(FLD_ID);
ALTER TABLE tbl_contracts ADD CONSTRAINT fk_contracts_entered_by FOREIGN KEY (FLD_ENAME) REFERENCES tbl_users(FLD_ID);

ALTER TABLE tbl_contracts_engagement ADD CONSTRAINT fk_engagement_student_subject FOREIGN KEY (FLD_SSID) REFERENCES tbl_students_subjects(FLD_ID);
ALTER TABLE tbl_contracts_engagement ADD CONSTRAINT fk_engagement_contract FOREIGN KEY (FLD_CID) REFERENCES tbl_contracts(FLD_ID);
ALTER TABLE tbl_contracts_engagement ADD CONSTRAINT fk_engagement_teacher FOREIGN KEY (FLD_TID) REFERENCES tbl_teachers(FLD_ID);
ALTER TABLE tbl_contracts_engagement ADD CONSTRAINT fk_engagement_entered_by FOREIGN KEY (FLD_ENAME) REFERENCES tbl_users(FLD_ID);

ALTER TABLE tbl_contracts_log ADD CONSTRAINT fk_contract_log_contract FOREIGN KEY (FLD_CID) REFERENCES tbl_contracts(FLD_ID);
ALTER TABLE tbl_contracts_log ADD CONSTRAINT fk_contract_log_user FOREIGN KEY (FLD_UNAME) REFERENCES tbl_users(FLD_ID);

ALTER TABLE tbl_mediation_types ADD CONSTRAINT fk_mediation_types_role FOREIGN KEY (FLD_RID) REFERENCES tbl_roles(FLD_ID);

ALTER TABLE tbl_students ADD CONSTRAINT fk_students_user FOREIGN KEY (FLD_UID) REFERENCES tbl_users(FLD_ID);
ALTER TABLE tbl_students ADD CONSTRAINT fk_students_created_by FOREIGN KEY (FLD_UNAME) REFERENCES tbl_users(FLD_ID);

ALTER TABLE tbl_students_documents ADD CONSTRAINT fk_student_docs_student FOREIGN KEY (FLD_SID) REFERENCES tbl_students(FLD_ID);
ALTER TABLE tbl_students_documents ADD CONSTRAINT fk_student_docs_user FOREIGN KEY (FLD_UID) REFERENCES tbl_users(FLD_ID);
ALTER TABLE tbl_students_documents ADD CONSTRAINT fk_student_docs_created_by FOREIGN KEY (FLD_UNAME) REFERENCES tbl_users(FLD_ID);

ALTER TABLE tbl_students_invoices ADD CONSTRAINT fk_student_invoices_student FOREIGN KEY (FLD_SID) REFERENCES tbl_students(FLD_ID);
ALTER TABLE tbl_students_invoices ADD CONSTRAINT fk_student_invoices_created_by FOREIGN KEY (FLD_UNAME) REFERENCES tbl_users(FLD_ID);

ALTER TABLE tbl_students_invoices_detail ADD CONSTRAINT fk_student_invoice_detail_invoice FOREIGN KEY (FLD_IID) REFERENCES tbl_students_invoices(FLD_ID);
ALTER TABLE tbl_students_invoices_detail ADD CONSTRAINT fk_student_invoice_detail_subject FOREIGN KEY (FLD_SSID) REFERENCES tbl_students_subjects(FLD_ID);
ALTER TABLE tbl_students_invoices_detail ADD CONSTRAINT fk_student_invoice_detail_contract FOREIGN KEY (FLD_CID) REFERENCES tbl_contracts(FLD_ID);
ALTER TABLE tbl_students_invoices_detail ADD CONSTRAINT fk_student_invoice_detail_user FOREIGN KEY (FLD_UNAME) REFERENCES tbl_users(FLD_ID);

ALTER TABLE tbl_students_mediation_stages ADD CONSTRAINT fk_mediation_teacher FOREIGN KEY (FLD_TID) REFERENCES tbl_teachers(FLD_ID);
ALTER TABLE tbl_students_mediation_stages ADD CONSTRAINT fk_mediation_student FOREIGN KEY (FLD_SID) REFERENCES tbl_students(FLD_ID);
ALTER TABLE tbl_students_mediation_stages ADD CONSTRAINT fk_mediation_student_subject FOREIGN KEY (FLD_SSID) REFERENCES tbl_students_subjects(FLD_ID);
ALTER TABLE tbl_students_mediation_stages ADD CONSTRAINT fk_mediation_type FOREIGN KEY (FLD_M_TYPE) REFERENCES tbl_mediation_types(FLD_ID);
ALTER TABLE tbl_students_mediation_stages ADD CONSTRAINT fk_mediation_created_by FOREIGN KEY (FLD_UNAME) REFERENCES tbl_users(FLD_ID);

ALTER TABLE tbl_students_subjects ADD CONSTRAINT fk_student_subjects_student FOREIGN KEY (FLD_SID) REFERENCES tbl_students(FLD_ID);
ALTER TABLE tbl_students_subjects ADD CONSTRAINT fk_student_subjects_subject FOREIGN KEY (FLD_SUID) REFERENCES tbl_subjects(FLD_ID);
ALTER TABLE tbl_students_subjects ADD CONSTRAINT fk_student_subjects_contract FOREIGN KEY (FLD_CID) REFERENCES tbl_contracts(FLD_ID);
ALTER TABLE tbl_students_subjects ADD CONSTRAINT fk_student_subjects_engagement FOREIGN KEY (FLD_C_EID) REFERENCES tbl_contracts_engagement(FLD_ID);
ALTER TABLE tbl_students_subjects ADD CONSTRAINT fk_student_subjects_created_by FOREIGN KEY (FLD_UNAME) REFERENCES tbl_users(FLD_ID);

ALTER TABLE tbl_teachers ADD CONSTRAINT fk_teachers_user FOREIGN KEY (FLD_UID) REFERENCES tbl_users(FLD_ID);
ALTER TABLE tbl_teachers ADD CONSTRAINT fk_teachers_created_by FOREIGN KEY (FLD_UNAME) REFERENCES tbl_users(FLD_ID);
ALTER TABLE tbl_teachers ADD CONSTRAINT fk_teachers_onboarded_by FOREIGN KEY (FLD_ONBOARD_UID) REFERENCES tbl_users(FLD_ID);

ALTER TABLE tbl_teachers_documents ADD CONSTRAINT fk_teacher_docs_teacher FOREIGN KEY (FLD_TID) REFERENCES tbl_teachers(FLD_ID);
ALTER TABLE tbl_teachers_documents ADD CONSTRAINT fk_teacher_docs_user FOREIGN KEY (FLD_UID) REFERENCES tbl_users(FLD_ID);
ALTER TABLE tbl_teachers_documents ADD CONSTRAINT fk_teacher_docs_created_by FOREIGN KEY (FLD_UNAME) REFERENCES tbl_users(FLD_ID);

ALTER TABLE tbl_teachers_invoices ADD CONSTRAINT fk_teacher_invoices_teacher FOREIGN KEY (FLD_TID) REFERENCES tbl_teachers(FLD_ID);
ALTER TABLE tbl_teachers_invoices ADD CONSTRAINT fk_teacher_invoices_created_by FOREIGN KEY (FLD_UNAME) REFERENCES tbl_users(FLD_ID);

ALTER TABLE tbl_teachers_invoices_detail ADD CONSTRAINT fk_teacher_invoice_detail_invoice FOREIGN KEY (FLD_IID) REFERENCES tbl_teachers_invoices(FLD_ID);
ALTER TABLE tbl_teachers_invoices_detail ADD CONSTRAINT fk_teacher_invoice_detail_teacher_subject FOREIGN KEY (FLD_TSID) REFERENCES tbl_teachers_subjects_expertise(FLD_ID);
ALTER TABLE tbl_teachers_invoices_detail ADD CONSTRAINT fk_teacher_invoice_detail_contract FOREIGN KEY (FLD_CID) REFERENCES tbl_contracts(FLD_ID);
ALTER TABLE tbl_teachers_invoices_detail ADD CONSTRAINT fk_teacher_invoice_detail_user FOREIGN KEY (FLD_UNAME) REFERENCES tbl_users(FLD_ID);

ALTER TABLE tbl_teachers_lessons_history ADD CONSTRAINT fk_lessons_history_teacher FOREIGN KEY (FLD_TID) REFERENCES tbl_teachers(FLD_ID);
ALTER TABLE tbl_teachers_lessons_history ADD CONSTRAINT fk_lessons_history_student FOREIGN KEY (FLD_SID) REFERENCES tbl_students(FLD_ID);
ALTER TABLE tbl_teachers_lessons_history ADD CONSTRAINT fk_lessons_history_subject FOREIGN KEY (FLD_SUID) REFERENCES tbl_subjects(FLD_ID);
ALTER TABLE tbl_teachers_lessons_history ADD CONSTRAINT fk_lessons_history_created_by FOREIGN KEY (FLD_UNAME) REFERENCES tbl_users(FLD_ID);

ALTER TABLE tbl_teachers_students_activity ADD CONSTRAINT fk_teacher_student_activity_teacher FOREIGN KEY (FLD_TID) REFERENCES tbl_teachers(FLD_ID);
ALTER TABLE tbl_teachers_students_activity ADD CONSTRAINT fk_teacher_student_activity_student FOREIGN KEY (FLD_SID) REFERENCES tbl_students(FLD_ID);
ALTER TABLE tbl_teachers_students_activity ADD CONSTRAINT fk_teacher_student_activity_type FOREIGN KEY (FLD_ACTIVITY_TYPE_ID) REFERENCES tbl_activities_types(FLD_ID);

ALTER TABLE tbl_teachers_students_notes ADD CONSTRAINT fk_teacher_student_notes_teacher FOREIGN KEY (FLD_TID) REFERENCES tbl_teachers(FLD_ID);
ALTER TABLE tbl_teachers_students_notes ADD CONSTRAINT fk_teacher_student_notes_student FOREIGN KEY (FLD_SID) REFERENCES tbl_students(FLD_ID);
ALTER TABLE tbl_teachers_students_notes ADD CONSTRAINT fk_teacher_student_notes_created_by FOREIGN KEY (FLD_UNAME) REFERENCES tbl_users(FLD_ID);

ALTER TABLE tbl_teachers_subjects_expertise ADD CONSTRAINT fk_teacher_subjects_teacher FOREIGN KEY (FLD_TID) REFERENCES tbl_teachers(FLD_ID);
ALTER TABLE tbl_teachers_subjects_expertise ADD CONSTRAINT fk_teacher_subjects_subject FOREIGN KEY (FLD_SUID) REFERENCES tbl_subjects(FLD_ID);
ALTER TABLE tbl_teachers_subjects_expertise ADD CONSTRAINT fk_teacher_subjects_created_by FOREIGN KEY (FLD_UNAME) REFERENCES tbl_users(FLD_ID);

ALTER TABLE tbl_teachers_unavailability_history ADD CONSTRAINT fk_teacher_unavailability_teacher FOREIGN KEY (FLD_TID) REFERENCES tbl_teachers(FLD_ID);
ALTER TABLE tbl_teachers_unavailability_history ADD CONSTRAINT fk_teacher_unavailability_created_by FOREIGN KEY (FLD_UNAME) REFERENCES tbl_users(FLD_ID);

ALTER TABLE tbl_temp_students_invoices_detail ADD CONSTRAINT fk_temp_invoice_detail_invoice FOREIGN KEY (FLD_IID) REFERENCES tbl_students_invoices(FLD_ID);
ALTER TABLE tbl_temp_students_invoices_detail ADD CONSTRAINT fk_temp_invoice_detail_subject FOREIGN KEY (FLD_SSID) REFERENCES tbl_students_subjects(FLD_ID);
ALTER TABLE tbl_temp_students_invoices_detail ADD CONSTRAINT fk_temp_invoice_detail_contract FOREIGN KEY (FLD_CID) REFERENCES tbl_contracts(FLD_ID);
ALTER TABLE tbl_temp_students_invoices_detail ADD CONSTRAINT fk_temp_invoice_detail_user FOREIGN KEY (FLD_UNAME) REFERENCES tbl_users(FLD_ID);

ALTER TABLE tbl_users ADD CONSTRAINT fk_users_role FOREIGN KEY (FLD_RID) REFERENCES tbl_roles(FLD_ID);
-- AUTH_USER_ID already has inline foreign key constraint to auth.users(id)

ALTER TABLE tbl_users_activities ADD CONSTRAINT fk_user_activities_user FOREIGN KEY (FLD_UID) REFERENCES tbl_users(FLD_ID);
ALTER TABLE tbl_users_activities ADD CONSTRAINT fk_user_activities_type FOREIGN KEY (FLD_ACTIVITY_TYPE_ID) REFERENCES tbl_activities_types(FLD_ID);

ALTER TABLE tbl_users_time_log ADD CONSTRAINT fk_user_time_log_user FOREIGN KEY (FLD_UID) REFERENCES tbl_users(FLD_ID);

-- Activity tables foreign keys
ALTER TABLE tbl_activity_applicants ADD CONSTRAINT fk_activity_applicants_user FOREIGN KEY (FLD_UID) REFERENCES tbl_users(FLD_ID);
ALTER TABLE tbl_activity_students ADD CONSTRAINT fk_activity_students_student FOREIGN KEY (FLD_SID) REFERENCES tbl_students(FLD_ID);
ALTER TABLE tbl_activity_teacher ADD CONSTRAINT fk_activity_teacher_teacher FOREIGN KEY (FLD_TID) REFERENCES tbl_teachers(FLD_ID);

-- Insert default data from legacy file
INSERT INTO tbl_activities_types (FLD_ID, FLD_ACTIVITY_NAME, FLD_STATUS) VALUES
(1, 'Kunde', 'Active'),
(2, 'Lehrkraft', 'Active'),
(3, 'Kn n.e.', 'Active'),
(4, 'LK hat Kn n.e.', 'Active'),
(5, 'Kn wartet auf Anruf von LK', 'Active'),
(6, 'Sonstiges', 'Active');

INSERT INTO tbl_roles (FLD_ID, FLD_ROLE, FLD_EDATE, FLD_STATUS) VALUES
(1, 'Admin', '2024-03-07', 'Active'),
(2, 'Teacher', '2024-03-07', 'Active'),
(3, 'Student', '2024-03-07', 'Active');

INSERT INTO tbl_subjects (FLD_ID, FLD_SUBJECT, FLD_IMAGE, FLD_STATUS) VALUES
(1, 'Mathematik', 'Mathematics.png', 'Active'),
(2, 'Englisch', 'united-kingdom.png', 'Active'),
(3, 'Deutsch', 'germany.png', 'Active'),
(4, 'Französisch', 'france.png', 'Active'),
(5, 'Spanisch', 'spain.png', 'Active'),
(6, 'Latein', 'History.png', 'Active'),
(7, 'BWL', 'BA.png', 'Active'),
(8, 'Physik', 'physics.png', 'Active'),
(9, 'Chemie', 'chemistry.png', 'Active'),
(10, 'Biologie', 'Biology.png', 'Active'),
(11, 'Geschichte', 'Story.png', 'Active'),
(12, 'Geografie', 'Geography.png', 'Active'),
(13, 'Informatik', 'IT.png', 'Active'),
(14, 'Wirtschaft', 'business.jpeg', 'Active'),
(15, 'Recht', 'law.png', 'Active'),
(16, 'Philosophie', 'philosophy.png', 'Active'),
(17, 'Psychologie', 'Psychology.png', 'Active'),
(18, 'Kunst', 'art.png', 'Active');

-- Create indexes for better performance
CREATE INDEX idx_tbl_users_auth_user_id ON tbl_users(AUTH_USER_ID);
CREATE INDEX idx_tbl_users_email ON tbl_users(FLD_EMAIL);
CREATE INDEX idx_tbl_students_email ON tbl_students(FLD_EMAIL);
CREATE INDEX idx_tbl_teachers_email ON tbl_teachers(FLD_EMAIL);
CREATE INDEX idx_tbl_contracts_student_id ON tbl_contracts(FLD_SID);
CREATE INDEX idx_tbl_students_subjects_student_id ON tbl_students_subjects(FLD_SID);
CREATE INDEX idx_tbl_teachers_subjects_teacher_id ON tbl_teachers_subjects_expertise(FLD_TID);

-- Function to handle new auth user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.tbl_users (
    AUTH_USER_ID,
    FLD_RID,
    FLD_NAME,
    FLD_EMAIL,
    FLD_PASSCODE,
    FLD_IS_VERIFY,
    FLD_IS_FORM_FILL,
    FLD_F_TIME_LOGIN,
    FLD_STATUS
  )
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role_id')::int, 2),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    '', -- Empty password since using Supabase auth
    'Y', -- Verified by Supabase auth
    'N', -- Form not filled initially
    'Y', -- First time login
    'Active'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create tbl_users entry on new auth user
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
