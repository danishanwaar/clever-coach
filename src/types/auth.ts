// Legacy database interfaces matching the migration structure

// Enum types from migration
export type ActivityStatus = 'Active' | 'Inactive';
export type VerificationStatus = 'Y' | 'N';
export type FormFillStatus = 'Y' | 'N';
export type Salutation = 'Herr' | 'Frau' | 'Divers' | 'N/A';
export type StudentRelation = 'Sohn' | 'Tochter' | 'Andere' | 'N/A';
export type Gender = 'Männlich' | 'Weiblich' | 'Divers';
export type YesNo = 'Y' | 'N';
export type AvailabilityStatus = 'Y' | 'N';

// Legacy User interface matching tbl_users
export interface User {
  fld_id: number;
  auth_user_id?: string;
  fld_rid: number;
  fld_name: string;
  fld_email: string;
  fld_passcode: string;
  fld_is_verify: VerificationStatus;
  fld_is_form_fill: FormFillStatus;
  fld_last_login?: string;
  fld_otp?: string;
  fld_f_time_login?: YesNo;
  fld_status: ActivityStatus;
  created_at: string;
  updated_at: string;
  // Joined data
  role?: Role;
}

// Legacy Teacher interface matching tbl_teachers
export interface Teacher {
  fld_id: number;
  fld_first_name: string;
  fld_last_name: string;
  fld_gender: Gender;
  fld_dob: string;
  fld_id_no?: string;
  fld_email: string;
  fld_phone: string;
  fld_street?: string;
  fld_city: string;
  fld_state?: string;
  fld_zip: string;
  fld_country: string;
  fld_address?: string;
  fld_address2?: string;
  fld_education: string;
  fld_latitude?: string;
  fld_longitude?: string;
  fld_bank_act?: string;
  fld_bakk_rno?: string;
  fld_bank_name?: string;
  fld_t_mode: string;
  fld_l_mode?: string;
  fld_is_available: AvailabilityStatus;
  fld_short_bio?: string;
  fld_self: string;
  fld_source: string;
  fld_t_subjects?: string;
  fld_uid: number;
  fld_status: TeacherStatus;
  fld_edate: string;
  fld_uname: number;
  fld_onboard_date?: string;
  fld_onboard_uid: number;
  fld_signature?: string;
  fld_pimage?: string;
  fld_per_l_rate: string;
  fld_reason?: string;
  fld_evaluation?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  user?: User;
  teacher_subjects?: TeacherSubject[];
  documents?: TeacherDocument[];
  activities?: TeacherActivity[];
}

// Legacy Student interface matching tbl_students
export interface Student {
  fld_id: number;
  fld_sal?: Salutation;
  fld_first_name: string;
  fld_last_name: string;
  fld_sd?: StudentRelation;
  fld_s_first_name?: string;
  fld_s_last_name?: string;
  fld_level?: string;
  fld_school?: string;
  fld_gender?: Gender;
  fld_dob?: string;
  fld_email: string;
  fld_phone: string;
  fld_mobile?: string;
  fld_city: string;
  fld_state?: string;
  fld_zip?: string;
  fld_country: string;
  fld_address?: string;
  fld_latitude?: string;
  fld_longitude?: string;
  fld_bank_act?: string;
  fld_bakk_rno?: string;
  fld_bank_name?: string;
  fld_l_mode?: string;
  fld_short_bio?: string;
  fld_su_type?: string;
  fld_reason?: string;
  fld_f_lead?: string;
  fld_notes?: string;
  fld_self_paid?: YesNo;
  fld_payer?: string;
  fld_ct?: string;
  fld_wh?: string;
  fld_ld?: string;
  fld_price?: number;
  fld_reg_fee: number;
  fld_uid: number;
  fld_status: StudentStatus;
  fld_im_status: number;
  fld_edate: string;
  fld_uname?: number;
  fld_nec?: YesNo;
  fld_rf_flag?: YesNo;
  created_at: string;
  updated_at: string;
  // Joined data
  user?: User;
  subjects?: StudentSubject[];
  contracts?: Contract[];
  invoices?: StudentInvoice[];
  activities?: StudentActivity[];
  documents?: StudentDocument[];
}

// Legacy Subject interface matching tbl_subjects
export interface Subject {
  fld_id: number;
  fld_subject: string;
  fld_image?: string;
  fld_status: ActivityStatus;
  created_at: string;
  updated_at: string;
}

// Legacy Educational interface matching tbl_educational
export interface Educational {
  fld_id: number;
  fld_ename: string;
  fld_status: ActivityStatus;
  created_at: string;
  updated_at: string;
}

// Legacy Teacher Subject interface matching tbl_teachers_subjects_expertise
export interface TeacherSubject {
  fld_id: number;
  fld_tid: number;
  fld_sid: number;
  fld_level?: number;
  fld_experience?: number;
  fld_edate: string;
  fld_uname: number;
  created_at: string;
  updated_at: string;
  // Joined data
  teacher?: Teacher;
  subject?: Subject;
}

// Status types from migration
export type TeacherStatus = 
  | 'New'
  | 'Screening' 
  | 'Interview'
  | 'Offer'
  | 'Hired'
  | 'Rejected'
  | 'Deleted'
  | 'Pending For Signature'
  | 'Suspended'
  | 'Inactive'
  | 'Waiting List'
  | 'Unclear';

export type StudentStatus = 
  | 'Leads'
  | 'Mediation Open'
  | 'Partially Mediated'
  | 'Mediated'
  | 'Specialist Consulting'
  | 'Contracted Customers'
  | 'Suspended'
  | 'Deleted'
  | 'Unplaceable'
  | 'Waiting List'
  | 'Appointment Call'
  | 'Follow-up'
  | 'Appl';

export type ContractStatus = 'Pending Signature' | 'Active' | 'On-Hold' | 'Deleted' | 'Suspended';
export type EngagementStatus = 'Active' | 'Inactive';
export type InvoiceStatus = 'Active' | 'Paid' | 'Suspended' | 'Deleted';
export type InvoiceType = 'Normal' | 'Negative';

// Legacy Role interface matching tbl_roles
export interface Role {
  fld_id: number;
  fld_role: string;
  fld_edate: string;
  fld_status: ActivityStatus;
  created_at: string;
  updated_at: string;
}

// Legacy interfaces for student module features

// Legacy Activity Types interface matching tbl_activities_types
export interface ActivityType {
  fld_ID: number;
  fld_ACTIVITY_NAME: string;
  fld_STATUS: ActivityStatus;
  created_at: string;
  updated_at: string;
}

// Legacy Student Activities interface matching tbl_activity_students
export interface StudentActivity {
  fld_ID: number;
  fld_SID: number;
  fld_TITLE: string;
  fld_CONTENT: string;
  fld_ERDAT: string;
  created_at: string;
  updated_at: string;
  // Joined data
  student?: Student;
}

// Legacy Teacher Activities interface matching tbl_activity_teacher
export interface TeacherActivity {
  fld_ID: number;
  fld_TID: number;
  fld_TITLE: string;
  fld_CONTENT: string;
  fld_ERDAT: string;
  created_at: string;
  updated_at: string;
  // Joined data
  teacher?: Teacher;
}

// Legacy User Activities interface matching tbl_users_activities
export interface UserActivity {
  fld_ID: number;
  fld_UID: number;
  fld_ACTIVITY_TYPE_ID: number;
  fld_TITLE: string;
  fld_CONTENT: string;
  fld_ERDAT: string;
  created_at: string;
  updated_at: string;
  // Joined data
  user?: User;
  activity_type?: ActivityType;
}

// Legacy Student Subject interface matching tbl_students_subjects
export interface StudentSubject {
  fld_ID: number;
  fld_SID: number;
  fld_SUID: number;
  fld_CID: number;
  fld_C_EID: number;
  fld_DETAIL?: string;
  fld_EDATE: string;
  fld_UNAME: number;
  created_at: string;
  updated_at: string;
  // Joined data
  student?: Student;
  subject?: Subject;
  contract?: Contract;
  engagement?: TeacherEngagement;
}

// Legacy Mediation Stage interface matching tbl_students_mediation_stages
export interface MediationStage {
  fld_ID: number;
  fld_TID: number;
  fld_SID: number;
  fld_SSID: number;
  fld_M_TYPE: number;
  fld_EDATE: string;
  fld_UNAME: number;
  created_at: string;
  updated_at: string;
  // Joined data
  teacher?: Teacher;
  student?: Student;
  student_subject?: StudentSubject;
  mediation_type?: MediationType;
}

// Legacy Contract interface matching tbl_contracts
export interface Contract {
  fld_ID: number;
  fld_SID: number;
  fld_CT?: string;
  fld_START_DATE: string;
  fld_END_DATE: string;
  fld_P_MODE: string;
  fld_LP: string;
  fld_LESSON_DUR: string;
  fld_MIN_LESSON: number;
  fld_REG_FEE: number;
  fld_S_PER_LESSON_RATE: number;
  fld_FILE?: string;
  fld_BI?: string;
  fld_IBAN?: string;
  fld_BIC?: string;
  fld_MNO?: string;
  fld_SIGNATURE?: string;
  fld_BPS?: string;
  fld_ENAME: number;
  fld_EDATE: string;
  fld_STATUS: ContractStatus;
  fld_EDTIM?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  student?: Student;
  engagements?: TeacherEngagement[];
}

// Legacy Teacher Engagement interface matching tbl_contracts_engagement
export interface TeacherEngagement {
  fld_ID: number;
  fld_SSID: number;
  fld_CID: number;
  fld_TID: number;
  fld_T_PER_LESSON_RATE: number;
  fld_ENAME: number;
  fld_EDATE: string;
  fld_STATUS: EngagementStatus;
  created_at: string;
  updated_at: string;
  // Joined data
  teacher?: Teacher;
  student_subject?: StudentSubject;
  contract?: Contract;
  lessons?: Lesson[];
}

// Legacy Lesson interface matching tbl_teachers_lessons_history
export interface Lesson {
  fld_ID: number;
  fld_TID: number;
  fld_SID: number;
  fld_SUID: number;
  fld_LESSON_DATE: string;
  fld_LESSON_DURATION: number;
  fld_LESSON_RATE: number;
  fld_TOTAL_AMOUNT: number;
  fld_STATUS?: string;
  fld_NOTES?: string;
  fld_EDATE: string;
  fld_UNAME: number;
  created_at: string;
  updated_at: string;
  // Joined data
  teacher?: Teacher;
  student?: Student;
  subject?: Subject;
}

// Legacy Student Invoice interface matching tbl_students_invoices
export interface StudentInvoice {
  fld_ID: number;
  fld_I_TYPE: InvoiceType;
  fld_SID: number;
  fld_LHID?: string;
  fld_CID?: string;
  fld_INVOICE_TOTAL: number;
  fld_INVOICE_HR: number;
  fld_MIN_LESSON?: number;
  fld_CH_HR: YesNo;
  fld_NOTES?: string;
  fld_EDATE: string;
  fld_UNAME: number;
  fld_STATUS: InvoiceStatus;
  created_at: string;
  updated_at: string;
  // Joined data
  student?: Student;
  details?: StudentInvoiceDetail[];
}

// Legacy Student Invoice Detail interface matching tbl_students_invoices_detail
export interface StudentInvoiceDetail {
  fld_ID: number;
  fld_IID: number;
  fld_SSID: number;
  fld_CID?: number;
  fld_DETAIL: string;
  fld_EDATE: string;
  fld_UNAME: number;
  created_at: string;
  updated_at: string;
  // Joined data
  invoice?: StudentInvoice;
  student_subject?: StudentSubject;
  contract?: Contract;
}

// Additional legacy interfaces

// Legacy Mediation Type interface matching tbl_mediation_types
export interface MediationType {
  fld_ID: number;
  fld_RID: number;
  fld_STAGE_NAME: string;
  fld_STATUS: ActivityStatus;
  created_at: string;
  updated_at: string;
  // Joined data
  role?: Role;
}

// Legacy Teacher Document interface matching tbl_teachers_documents
export interface TeacherDocument {
  fld_ID: number;
  fld_TID: number;
  fld_UID: number;
  fld_DOC_FILE: string;
  fld_EDATE: string;
  fld_UNAME: number;
  created_at: string;
  updated_at: string;
  // Joined data
  teacher?: Teacher;
  user?: User;
}

// Legacy Student Document interface matching tbl_students_documents
export interface StudentDocument {
  fld_ID: number;
  fld_SID: number;
  fld_UID: number;
  fld_DOC_FILE: string;
  fld_EDATE: string;
  fld_UNAME: number;
  created_at: string;
  updated_at: string;
  // Joined data
  student?: Student;
  user?: User;
}