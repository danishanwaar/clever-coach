-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.tbl_activities_types (
  fld_id integer NOT NULL DEFAULT nextval('tbl_activities_types_fld_id_seq'::regclass),
  fld_activity_name character varying NOT NULL,
  fld_status USER-DEFINED NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tbl_activities_types_pkey PRIMARY KEY (fld_id)
);
CREATE TABLE public.tbl_activity_applicants (
  fld_id integer NOT NULL DEFAULT nextval('tbl_activity_applicants_fld_id_seq'::regclass),
  fld_aid integer NOT NULL,
  fld_title character varying NOT NULL,
  fld_content text NOT NULL,
  fld_erdat timestamp with time zone NOT NULL,
  fld_uid integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tbl_activity_applicants_pkey PRIMARY KEY (fld_id),
  CONSTRAINT fk_activity_applicants_user FOREIGN KEY (fld_uid) REFERENCES public.tbl_users(fld_id)
);
CREATE TABLE public.tbl_activity_matcher (
  fld_id integer NOT NULL DEFAULT nextval('tbl_activity_matcher_fld_id_seq'::regclass),
  fld_tid integer NOT NULL,
  fld_title character varying NOT NULL,
  fld_content text NOT NULL,
  fld_erdat timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tbl_activity_matcher_pkey PRIMARY KEY (fld_id)
);
CREATE TABLE public.tbl_activity_students (
  fld_id integer NOT NULL DEFAULT nextval('tbl_activity_students_fld_id_seq'::regclass),
  fld_sid integer NOT NULL,
  fld_title character varying NOT NULL,
  fld_content text NOT NULL,
  fld_erdat timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tbl_activity_students_pkey PRIMARY KEY (fld_id),
  CONSTRAINT fk_activity_students_student FOREIGN KEY (fld_sid) REFERENCES public.tbl_students(fld_id)
);
CREATE TABLE public.tbl_activity_teacher (
  fld_id integer NOT NULL DEFAULT nextval('tbl_activity_teacher_fld_id_seq'::regclass),
  fld_tid integer NOT NULL,
  fld_title character varying NOT NULL,
  fld_content text NOT NULL,
  fld_erdat timestamp without time zone NOT NULL,
  fld_uid integer NOT NULL,
  CONSTRAINT tbl_activity_teacher_pkey PRIMARY KEY (fld_id),
  CONSTRAINT fk_activity_teacher_user FOREIGN KEY (fld_uid) REFERENCES public.tbl_users(fld_id),
  CONSTRAINT fk_activity_teacher_teacher FOREIGN KEY (fld_tid) REFERENCES public.tbl_teachers(fld_id)
);
CREATE TABLE public.tbl_contracts (
  fld_id integer NOT NULL DEFAULT nextval('tbl_contracts_fld_id_seq'::regclass),
  fld_sid integer NOT NULL,
  fld_ct character varying,
  fld_start_date date NOT NULL,
  fld_end_date date NOT NULL,
  fld_p_mode character varying NOT NULL,
  fld_lp character varying NOT NULL,
  fld_lesson_dur character varying NOT NULL,
  fld_min_lesson numeric NOT NULL,
  fld_reg_fee numeric NOT NULL,
  fld_s_per_lesson_rate numeric NOT NULL,
  fld_file text,
  fld_bi character varying,
  fld_iban character varying,
  fld_bic character varying,
  fld_mno character varying,
  fld_signature text,
  fld_bps character varying,
  fld_ename integer NOT NULL,
  fld_edate date NOT NULL,
  fld_status USER-DEFINED NOT NULL,
  fld_edtim timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tbl_contracts_pkey PRIMARY KEY (fld_id),
  CONSTRAINT fk_contracts_student FOREIGN KEY (fld_sid) REFERENCES public.tbl_students(fld_id),
  CONSTRAINT fk_contracts_entered_by FOREIGN KEY (fld_ename) REFERENCES public.tbl_users(fld_id)
);
CREATE TABLE public.tbl_contracts_engagement (
  fld_id integer NOT NULL DEFAULT nextval('tbl_contracts_engagement_fld_id_seq'::regclass),
  fld_ssid integer NOT NULL,
  fld_cid integer NOT NULL,
  fld_tid integer NOT NULL,
  fld_t_per_lesson_rate numeric NOT NULL,
  fld_ename integer NOT NULL,
  fld_edate date NOT NULL,
  fld_status USER-DEFINED NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tbl_contracts_engagement_pkey PRIMARY KEY (fld_id),
  CONSTRAINT fk_engagement_student_subject FOREIGN KEY (fld_ssid) REFERENCES public.tbl_students_subjects(fld_id),
  CONSTRAINT fk_engagement_contract FOREIGN KEY (fld_cid) REFERENCES public.tbl_contracts(fld_id),
  CONSTRAINT fk_engagement_teacher FOREIGN KEY (fld_tid) REFERENCES public.tbl_teachers(fld_id),
  CONSTRAINT fk_engagement_entered_by FOREIGN KEY (fld_ename) REFERENCES public.tbl_users(fld_id)
);
CREATE TABLE public.tbl_contracts_log (
  fld_id integer NOT NULL DEFAULT nextval('tbl_contracts_log_fld_id_seq'::regclass),
  fld_cid integer NOT NULL,
  fld_status character varying NOT NULL,
  fld_edate date NOT NULL,
  fld_uname integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tbl_contracts_log_pkey PRIMARY KEY (fld_id),
  CONSTRAINT fk_contract_log_contract FOREIGN KEY (fld_cid) REFERENCES public.tbl_contracts(fld_id),
  CONSTRAINT fk_contract_log_user FOREIGN KEY (fld_uname) REFERENCES public.tbl_users(fld_id)
);
CREATE TABLE public.tbl_countries (
  fld_id integer NOT NULL DEFAULT nextval('tbl_countries_fld_id_seq'::regclass),
  fld_landx character varying NOT NULL,
  fld_landx50 character varying NOT NULL,
  fld_lflag USER-DEFINED DEFAULT 'Active'::activity_status,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tbl_countries_pkey PRIMARY KEY (fld_id)
);
CREATE TABLE public.tbl_degrees (
  fld_id integer NOT NULL DEFAULT nextval('tbl_degrees_fld_id_seq'::regclass),
  fld_degree_name character varying NOT NULL,
  fld_status USER-DEFINED NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tbl_degrees_pkey PRIMARY KEY (fld_id)
);
CREATE TABLE public.tbl_delete_reasons (
  fld_id integer NOT NULL DEFAULT nextval('tbl_delete_reasons_fld_id_seq'::regclass),
  fld_reason character varying NOT NULL,
  fld_type character varying NOT NULL,
  fld_status USER-DEFINED NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tbl_delete_reasons_pkey PRIMARY KEY (fld_id)
);
CREATE TABLE public.tbl_educational (
  fld_id integer NOT NULL DEFAULT nextval('tbl_educational_fld_id_seq'::regclass),
  fld_ename character varying NOT NULL,
  fld_status USER-DEFINED NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tbl_educational_pkey PRIMARY KEY (fld_id)
);
CREATE TABLE public.tbl_lesson_durations (
  fld_id integer NOT NULL DEFAULT nextval('tbl_lesson_durations_fld_id_seq'::regclass),
  fld_l_duration character varying NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tbl_lesson_durations_pkey PRIMARY KEY (fld_id)
);
CREATE TABLE public.tbl_levels (
  fld_id integer NOT NULL DEFAULT nextval('tbl_levels_fld_id_seq'::regclass),
  fld_level character varying NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tbl_levels_pkey PRIMARY KEY (fld_id)
);
CREATE TABLE public.tbl_mediation_types (
  fld_id integer NOT NULL DEFAULT nextval('tbl_mediation_types_fld_id_seq'::regclass),
  fld_rid integer NOT NULL,
  fld_stage_name character varying NOT NULL,
  fld_status USER-DEFINED NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tbl_mediation_types_pkey PRIMARY KEY (fld_id),
  CONSTRAINT fk_mediation_types_role FOREIGN KEY (fld_rid) REFERENCES public.tbl_roles(fld_id)
);
CREATE TABLE public.tbl_reasons (
  fld_id integer NOT NULL DEFAULT nextval('tbl_reasons_fld_id_seq'::regclass),
  fld_reason character varying NOT NULL,
  fld_status USER-DEFINED NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tbl_reasons_pkey PRIMARY KEY (fld_id)
);
CREATE TABLE public.tbl_roles (
  fld_id integer NOT NULL DEFAULT nextval('tbl_roles_fld_id_seq'::regclass),
  fld_role character varying NOT NULL,
  fld_edate date NOT NULL,
  fld_status USER-DEFINED NOT NULL DEFAULT 'Active'::activity_status,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tbl_roles_pkey PRIMARY KEY (fld_id)
);
CREATE TABLE public.tbl_source (
  fld_id integer NOT NULL DEFAULT nextval('tbl_source_fld_id_seq'::regclass),
  fld_type character varying NOT NULL,
  fld_source character varying NOT NULL,
  fld_status USER-DEFINED NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tbl_source_pkey PRIMARY KEY (fld_id)
);
CREATE TABLE public.tbl_students (
  fld_id integer NOT NULL DEFAULT nextval('tbl_students_fld_id_seq'::regclass),
  fld_sal USER-DEFINED,
  fld_first_name character varying NOT NULL,
  fld_last_name character varying NOT NULL,
  fld_sd USER-DEFINED,
  fld_s_first_name character varying,
  fld_s_last_name character varying,
  fld_level character varying,
  fld_school character varying,
  fld_gender USER-DEFINED,
  fld_dob date,
  fld_email text NOT NULL,
  fld_phone character varying NOT NULL,
  fld_mobile character varying,
  fld_city character varying NOT NULL,
  fld_state character varying,
  fld_zip character varying,
  fld_country character varying DEFAULT 'Germany'::character varying,
  fld_address text,
  fld_latitude character varying,
  fld_longitude character varying,
  fld_bank_act character varying,
  fld_bakk_rno character varying,
  fld_bank_name character varying,
  fld_l_mode character varying,
  fld_short_bio text,
  fld_su_type character varying,
  fld_reason character varying,
  fld_f_lead character varying,
  fld_notes text,
  fld_self_paid USER-DEFINED,
  fld_payer character varying,
  fld_ct character varying,
  fld_wh character varying,
  fld_ld character varying,
  fld_price numeric,
  fld_reg_fee numeric DEFAULT 0.00,
  fld_uid integer NOT NULL,
  fld_status USER-DEFINED NOT NULL,
  fld_im_status integer DEFAULT 0,
  fld_edate timestamp with time zone NOT NULL,
  fld_uname integer,
  fld_nec USER-DEFINED,
  fld_rf_flag USER-DEFINED,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tbl_students_pkey PRIMARY KEY (fld_id),
  CONSTRAINT fk_students_user FOREIGN KEY (fld_uid) REFERENCES public.tbl_users(fld_id),
  CONSTRAINT fk_students_created_by FOREIGN KEY (fld_uname) REFERENCES public.tbl_users(fld_id)
);
CREATE TABLE public.tbl_students_documents (
  fld_id integer NOT NULL DEFAULT nextval('tbl_students_documents_fld_id_seq'::regclass),
  fld_sid integer NOT NULL DEFAULT 0,
  fld_uid integer NOT NULL,
  fld_doc_file text NOT NULL,
  fld_edate date NOT NULL,
  fld_uname integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tbl_students_documents_pkey PRIMARY KEY (fld_id),
  CONSTRAINT fk_student_docs_student FOREIGN KEY (fld_sid) REFERENCES public.tbl_students(fld_id),
  CONSTRAINT fk_student_docs_user FOREIGN KEY (fld_uid) REFERENCES public.tbl_users(fld_id),
  CONSTRAINT fk_student_docs_created_by FOREIGN KEY (fld_uname) REFERENCES public.tbl_users(fld_id)
);
CREATE TABLE public.tbl_students_invoices (
  fld_id integer NOT NULL DEFAULT nextval('tbl_students_invoices_fld_id_seq'::regclass),
  fld_i_type USER-DEFINED DEFAULT 'Normal'::invoice_type,
  fld_sid integer NOT NULL,
  fld_lhid character varying,
  fld_cid character varying,
  fld_invoice_total numeric NOT NULL,
  fld_invoice_hr numeric NOT NULL,
  fld_min_lesson numeric,
  fld_ch_hr USER-DEFINED DEFAULT 'N'::yes_no,
  fld_notes text,
  fld_edate date NOT NULL,
  fld_uname integer NOT NULL,
  fld_status USER-DEFINED NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tbl_students_invoices_pkey PRIMARY KEY (fld_id),
  CONSTRAINT fk_student_invoices_student FOREIGN KEY (fld_sid) REFERENCES public.tbl_students(fld_id),
  CONSTRAINT fk_student_invoices_created_by FOREIGN KEY (fld_uname) REFERENCES public.tbl_users(fld_id)
);
CREATE TABLE public.tbl_students_invoices_detail (
  fld_id integer NOT NULL DEFAULT nextval('tbl_students_invoices_detail_fld_id_seq'::regclass),
  fld_iid integer NOT NULL,
  fld_ssid integer NOT NULL,
  fld_cid integer,
  fld_detail text NOT NULL,
  fld_len_lesson character varying NOT NULL,
  fld_l_date date NOT NULL,
  fld_lesson numeric NOT NULL,
  fld_s_rate numeric NOT NULL,
  fld_my character varying NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tbl_students_invoices_detail_pkey PRIMARY KEY (fld_id),
  CONSTRAINT fk_student_invoice_detail_invoice FOREIGN KEY (fld_iid) REFERENCES public.tbl_students_invoices(fld_id),
  CONSTRAINT fk_student_invoice_detail_subject FOREIGN KEY (fld_ssid) REFERENCES public.tbl_students_subjects(fld_id),
  CONSTRAINT fk_student_invoice_detail_contract FOREIGN KEY (fld_cid) REFERENCES public.tbl_contracts(fld_id)
);
CREATE TABLE public.tbl_students_mediation_stages (
  fld_id integer NOT NULL DEFAULT nextval('tbl_students_mediation_stages_fld_id_seq'::regclass),
  fld_tid integer NOT NULL,
  fld_sid integer NOT NULL,
  fld_ssid integer NOT NULL,
  fld_m_type integer NOT NULL,
  fld_edate date NOT NULL,
  fld_uname integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  fld_m_flag character varying DEFAULT NULL::character varying,
  fld_note text,
  fld_etime character varying DEFAULT NULL::character varying,
  CONSTRAINT tbl_students_mediation_stages_pkey PRIMARY KEY (fld_id),
  CONSTRAINT fk_mediation_teacher FOREIGN KEY (fld_tid) REFERENCES public.tbl_teachers(fld_id),
  CONSTRAINT fk_mediation_student FOREIGN KEY (fld_sid) REFERENCES public.tbl_students(fld_id),
  CONSTRAINT fk_mediation_student_subject FOREIGN KEY (fld_ssid) REFERENCES public.tbl_students_subjects(fld_id),
  CONSTRAINT fk_mediation_type FOREIGN KEY (fld_m_type) REFERENCES public.tbl_mediation_types(fld_id),
  CONSTRAINT fk_mediation_created_by FOREIGN KEY (fld_uname) REFERENCES public.tbl_users(fld_id)
);
CREATE TABLE public.tbl_students_subjects (
  fld_id integer NOT NULL DEFAULT nextval('tbl_students_subjects_fld_id_seq'::regclass),
  fld_sid integer NOT NULL,
  fld_suid integer NOT NULL,
  fld_cid integer,
  fld_c_eid integer DEFAULT 0,
  fld_detail text,
  fld_edate date NOT NULL,
  fld_uname integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tbl_students_subjects_pkey PRIMARY KEY (fld_id),
  CONSTRAINT fk_student_subjects_student FOREIGN KEY (fld_sid) REFERENCES public.tbl_students(fld_id),
  CONSTRAINT fk_student_subjects_subject FOREIGN KEY (fld_suid) REFERENCES public.tbl_subjects(fld_id),
  CONSTRAINT fk_student_subjects_created_by FOREIGN KEY (fld_uname) REFERENCES public.tbl_users(fld_id),
  CONSTRAINT fk_student_subjects_contract FOREIGN KEY (fld_cid) REFERENCES public.tbl_contracts(fld_id),
  CONSTRAINT fk_student_subjects_engagement FOREIGN KEY (fld_c_eid) REFERENCES public.tbl_contracts_engagement(fld_id)
);
CREATE TABLE public.tbl_su_types (
  fld_id integer NOT NULL DEFAULT nextval('tbl_su_types_fld_id_seq'::regclass),
  fld_name character varying NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tbl_su_types_pkey PRIMARY KEY (fld_id)
);
CREATE TABLE public.tbl_subjects (
  fld_id integer NOT NULL DEFAULT nextval('tbl_subjects_fld_id_seq'::regclass),
  fld_subject character varying NOT NULL,
  fld_image character varying,
  fld_status USER-DEFINED NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tbl_subjects_pkey PRIMARY KEY (fld_id)
);
CREATE TABLE public.tbl_system_config (
  fld_id integer NOT NULL DEFAULT nextval('tbl_system_config_fld_id_seq'::regclass),
  fld_burks character varying,
  fld_name1 character varying NOT NULL,
  fld_cntry integer NOT NULL DEFAULT 0,
  fld_name2 character varying,
  fld_cflag character varying DEFAULT 'Active'::character varying CHECK (fld_cflag::text = ANY (ARRAY['Active'::character varying, 'Inactive'::character varying]::text[])),
  fld_femail text,
  fld_email text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tbl_system_config_pkey PRIMARY KEY (fld_id),
  CONSTRAINT fk_system_config_country FOREIGN KEY (fld_cntry) REFERENCES public.tbl_countries(fld_id)
);
CREATE TABLE public.tbl_teacher_documents (
  fld_id integer NOT NULL DEFAULT nextval('tbl_teacher_documents_fld_id_seq'::regclass),
  fld_tid integer NOT NULL,
  fld_name character varying NOT NULL,
  fld_type character varying NOT NULL,
  fld_size bigint NOT NULL,
  fld_path character varying NOT NULL,
  fld_description text,
  fld_upload_date timestamp with time zone DEFAULT now(),
  fld_status character varying DEFAULT 'Active'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tbl_teacher_documents_pkey PRIMARY KEY (fld_id),
  CONSTRAINT fk_teacher_documents_teacher FOREIGN KEY (fld_tid) REFERENCES public.tbl_teachers(fld_id)
);
CREATE TABLE public.tbl_teachers (
  fld_id integer NOT NULL DEFAULT nextval('tbl_teachers_fld_id_seq'::regclass),
  fld_first_name character varying NOT NULL,
  fld_last_name character varying NOT NULL,
  fld_gender USER-DEFINED NOT NULL,
  fld_dob date NOT NULL,
  fld_id_no character varying,
  fld_email text NOT NULL,
  fld_phone character varying NOT NULL,
  fld_street character varying,
  fld_city character varying NOT NULL,
  fld_state character varying,
  fld_zip character varying NOT NULL,
  fld_country character varying DEFAULT 'Germany'::character varying,
  fld_address text,
  fld_address2 text,
  fld_education text NOT NULL,
  fld_latitude character varying,
  fld_longitude character varying,
  fld_bank_act character varying,
  fld_bakk_rno character varying,
  fld_bank_name character varying,
  fld_t_mode character varying NOT NULL,
  fld_l_mode character varying,
  fld_is_available USER-DEFINED DEFAULT 'Y'::availability_status,
  fld_short_bio text,
  fld_self text NOT NULL,
  fld_source character varying NOT NULL,
  fld_t_subjects character varying,
  fld_uid integer NOT NULL,
  fld_status USER-DEFINED NOT NULL,
  fld_edate timestamp with time zone NOT NULL,
  fld_uname integer NOT NULL,
  fld_onboard_date timestamp with time zone,
  fld_onboard_uid integer DEFAULT 0,
  fld_signature text,
  fld_pimage text,
  fld_per_l_rate character varying DEFAULT '0.00'::character varying,
  fld_reason text,
  fld_evaluation text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tbl_teachers_pkey PRIMARY KEY (fld_id),
  CONSTRAINT fk_teachers_user FOREIGN KEY (fld_uid) REFERENCES public.tbl_users(fld_id),
  CONSTRAINT fk_teachers_created_by FOREIGN KEY (fld_uname) REFERENCES public.tbl_users(fld_id),
  CONSTRAINT fk_teachers_onboarded_by FOREIGN KEY (fld_onboard_uid) REFERENCES public.tbl_users(fld_id)
);
CREATE TABLE public.tbl_teachers_documents (
  fld_id integer NOT NULL DEFAULT nextval('tbl_teachers_documents_fld_id_seq'::regclass),
  fld_tid integer NOT NULL DEFAULT 0,
  fld_uid integer NOT NULL,
  fld_doc_file text NOT NULL,
  fld_edate date NOT NULL,
  fld_uname integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tbl_teachers_documents_pkey PRIMARY KEY (fld_id),
  CONSTRAINT fk_teacher_docs_teacher FOREIGN KEY (fld_tid) REFERENCES public.tbl_teachers(fld_id),
  CONSTRAINT fk_teacher_docs_user FOREIGN KEY (fld_uid) REFERENCES public.tbl_users(fld_id),
  CONSTRAINT fk_teacher_docs_created_by FOREIGN KEY (fld_uname) REFERENCES public.tbl_users(fld_id)
);
CREATE TABLE public.tbl_teachers_invoices (
  fld_id integer NOT NULL DEFAULT nextval('tbl_teachers_invoices_fld_id_seq'::regclass),
  fld_tid integer NOT NULL,
  fld_lhid character varying,
  fld_cid character varying,
  fld_invoice_total numeric NOT NULL,
  fld_invoice_hr numeric NOT NULL,
  fld_min_lesson numeric,
  fld_ch_hr USER-DEFINED DEFAULT 'N'::yes_no,
  fld_notes text,
  fld_edate date NOT NULL,
  fld_uname integer NOT NULL,
  fld_status USER-DEFINED NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tbl_teachers_invoices_pkey PRIMARY KEY (fld_id),
  CONSTRAINT fk_teacher_invoices_teacher FOREIGN KEY (fld_tid) REFERENCES public.tbl_teachers(fld_id),
  CONSTRAINT fk_teacher_invoices_created_by FOREIGN KEY (fld_uname) REFERENCES public.tbl_users(fld_id)
);
CREATE TABLE public.tbl_teachers_invoices_detail (
  fld_id integer NOT NULL DEFAULT nextval('tbl_teachers_invoices_detail_fld_id_seq'::regclass),
  fld_iid integer NOT NULL,
  fld_sid integer NOT NULL,
  fld_ssid integer NOT NULL,
  fld_cid integer NOT NULL,
  fld_detail text NOT NULL,
  fld_len_lesson character varying NOT NULL,
  fld_l_date date NOT NULL,
  fld_lesson numeric NOT NULL,
  fld_t_rate numeric NOT NULL,
  fld_my character varying NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tbl_teachers_invoices_detail_pkey PRIMARY KEY (fld_id),
  CONSTRAINT fk_teacher_invoice_detail_invoice FOREIGN KEY (fld_iid) REFERENCES public.tbl_teachers_invoices(fld_id),
  CONSTRAINT fk_teacher_invoice_detail_student FOREIGN KEY (fld_sid) REFERENCES public.tbl_students(fld_id),
  CONSTRAINT fk_teacher_invoice_detail_subject FOREIGN KEY (fld_ssid) REFERENCES public.tbl_students_subjects(fld_id),
  CONSTRAINT fk_teacher_invoice_detail_contract FOREIGN KEY (fld_cid) REFERENCES public.tbl_contracts(fld_id)
);
CREATE TABLE public.tbl_teachers_lessons_history (
  fld_id integer NOT NULL DEFAULT nextval('tbl_teachers_lessons_history_fld_id_seq'::regclass),
  fld_tid integer NOT NULL,
  fld_sid integer NOT NULL,
  fld_ssid integer NOT NULL,
  fld_lesson numeric NOT NULL,
  fld_s_rate numeric NOT NULL,
  fld_t_rate numeric NOT NULL,
  fld_notes text,
  fld_edate date NOT NULL,
  fld_uname integer NOT NULL,
  fld_mon character varying,
  fld_year character varying,
  fld_status character varying DEFAULT 'Pending'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tbl_teachers_lessons_history_pkey PRIMARY KEY (fld_id),
  CONSTRAINT fk_lessons_history_teacher FOREIGN KEY (fld_tid) REFERENCES public.tbl_teachers(fld_id),
  CONSTRAINT fk_lessons_history_student FOREIGN KEY (fld_sid) REFERENCES public.tbl_students(fld_id),
  CONSTRAINT fk_lessons_history_student_subject FOREIGN KEY (fld_ssid) REFERENCES public.tbl_students_subjects(fld_id),
  CONSTRAINT fk_lessons_history_created_by FOREIGN KEY (fld_uname) REFERENCES public.tbl_users(fld_id)
);
CREATE TABLE public.tbl_teachers_students_activity (
  fld_id integer NOT NULL DEFAULT nextval('tbl_teachers_students_activity_fld_id_seq'::regclass),
  fld_tid integer NOT NULL,
  fld_sid integer NOT NULL,
  fld_activity_type_id integer NOT NULL,
  fld_description text,
  fld_notes text,
  fld_edate timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tbl_teachers_students_activity_pkey PRIMARY KEY (fld_id),
  CONSTRAINT fk_teacher_student_activity_teacher FOREIGN KEY (fld_tid) REFERENCES public.tbl_teachers(fld_id),
  CONSTRAINT fk_teacher_student_activity_student FOREIGN KEY (fld_sid) REFERENCES public.tbl_students(fld_id),
  CONSTRAINT fk_teacher_student_activity_type FOREIGN KEY (fld_activity_type_id) REFERENCES public.tbl_activities_types(fld_id)
);
CREATE TABLE public.tbl_teachers_students_notes (
  fld_id integer NOT NULL DEFAULT nextval('tbl_teachers_students_notes_fld_id_seq'::regclass),
  fld_tid integer NOT NULL,
  fld_sid integer NOT NULL,
  fld_subject character varying NOT NULL,
  fld_body text NOT NULL,
  fld_edate timestamp with time zone NOT NULL,
  fld_uname integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tbl_teachers_students_notes_pkey PRIMARY KEY (fld_id),
  CONSTRAINT fk_teacher_student_notes_teacher FOREIGN KEY (fld_tid) REFERENCES public.tbl_teachers(fld_id),
  CONSTRAINT fk_teacher_student_notes_student FOREIGN KEY (fld_sid) REFERENCES public.tbl_students(fld_id),
  CONSTRAINT fk_teacher_student_notes_created_by FOREIGN KEY (fld_uname) REFERENCES public.tbl_users(fld_id)
);
CREATE TABLE public.tbl_teachers_subjects_expertise (
  fld_id integer NOT NULL DEFAULT nextval('tbl_teachers_subjects_expertise_fld_id_seq'::regclass),
  fld_tid integer NOT NULL,
  fld_sid integer NOT NULL,
  fld_level integer NOT NULL,
  fld_experience numeric NOT NULL,
  fld_edate date NOT NULL,
  fld_uname integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tbl_teachers_subjects_expertise_pkey PRIMARY KEY (fld_id),
  CONSTRAINT fk_teacher_subjects_teacher FOREIGN KEY (fld_tid) REFERENCES public.tbl_teachers(fld_id),
  CONSTRAINT fk_teacher_subjects_subject FOREIGN KEY (fld_sid) REFERENCES public.tbl_subjects(fld_id),
  CONSTRAINT fk_teacher_subjects_level FOREIGN KEY (fld_level) REFERENCES public.tbl_levels(fld_id),
  CONSTRAINT fk_teacher_subjects_created_by FOREIGN KEY (fld_uname) REFERENCES public.tbl_users(fld_id)
);
CREATE TABLE public.tbl_teachers_unavailability_history (
  fld_id integer NOT NULL DEFAULT nextval('tbl_teachers_unavailability_history_fld_id_seq'::regclass),
  fld_tid integer NOT NULL,
  fld_unavailable_from date NOT NULL,
  fld_unavailable_to date NOT NULL,
  fld_reason text,
  fld_is_active USER-DEFINED DEFAULT 'Y'::availability_status,
  fld_edate timestamp with time zone NOT NULL,
  fld_uname integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tbl_teachers_unavailability_history_pkey PRIMARY KEY (fld_id),
  CONSTRAINT fk_teacher_unavailability_teacher FOREIGN KEY (fld_tid) REFERENCES public.tbl_teachers(fld_id),
  CONSTRAINT fk_teacher_unavailability_created_by FOREIGN KEY (fld_uname) REFERENCES public.tbl_users(fld_id)
);
CREATE TABLE public.tbl_temp_students_invoices_detail (
  fld_id integer NOT NULL DEFAULT nextval('tbl_temp_students_invoices_detail_fld_id_seq'::regclass),
  fld_tempid character varying NOT NULL,
  fld_detail text NOT NULL,
  fld_lesson numeric NOT NULL,
  fld_s_rate numeric NOT NULL,
  fld_len_lesson character varying NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tbl_temp_students_invoices_detail_pkey PRIMARY KEY (fld_id)
);
CREATE TABLE public.tbl_urls (
  fld_id integer NOT NULL DEFAULT nextval('tbl_urls_fld_id_seq'::regclass),
  fld_url text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tbl_urls_pkey PRIMARY KEY (fld_id)
);
CREATE TABLE public.tbl_users (
  fld_id integer NOT NULL DEFAULT nextval('tbl_users_fld_id_seq'::regclass),
  auth_user_id uuid,
  fld_rid integer NOT NULL,
  fld_name character varying NOT NULL,
  fld_email text NOT NULL,
  fld_passcode text NOT NULL,
  fld_is_verify USER-DEFINED NOT NULL,
  fld_is_form_fill USER-DEFINED NOT NULL,
  fld_last_login date,
  fld_otp character varying,
  fld_f_time_login USER-DEFINED,
  fld_status USER-DEFINED NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tbl_users_pkey PRIMARY KEY (fld_id),
  CONSTRAINT tbl_users_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id),
  CONSTRAINT fk_users_role FOREIGN KEY (fld_rid) REFERENCES public.tbl_roles(fld_id)
);
CREATE TABLE public.tbl_users_activities (
  fld_id integer NOT NULL DEFAULT nextval('tbl_users_activities_fld_id_seq'::regclass),
  fld_uid integer NOT NULL,
  fld_activity_type_id integer NOT NULL,
  fld_title character varying NOT NULL,
  fld_content text NOT NULL,
  fld_erdat timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tbl_users_activities_pkey PRIMARY KEY (fld_id),
  CONSTRAINT fk_user_activities_user FOREIGN KEY (fld_uid) REFERENCES public.tbl_users(fld_id),
  CONSTRAINT fk_user_activities_type FOREIGN KEY (fld_activity_type_id) REFERENCES public.tbl_activities_types(fld_id)
);
CREATE TABLE public.tbl_users_time_log (
  fld_id integer NOT NULL DEFAULT nextval('tbl_users_time_log_fld_id_seq'::regclass),
  fld_uid integer NOT NULL,
  fld_login_time timestamp with time zone,
  fld_logout_time timestamp with time zone,
  fld_session_duration integer,
  fld_ip_address inet,
  fld_user_agent text,
  fld_erdat timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tbl_users_time_log_pkey PRIMARY KEY (fld_id),
  CONSTRAINT fk_user_time_log_user FOREIGN KEY (fld_uid) REFERENCES public.tbl_users(fld_id)
);