export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      tbl_activities_types: {
        Row: {
          created_at: string | null
          fld_activity_name: string
          fld_id: number
          fld_status: Database["public"]["Enums"]["activity_status"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fld_activity_name: string
          fld_id?: number
          fld_status: Database["public"]["Enums"]["activity_status"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fld_activity_name?: string
          fld_id?: number
          fld_status?: Database["public"]["Enums"]["activity_status"]
          updated_at?: string | null
        }
        Relationships: []
      }
      tbl_activity_applicants: {
        Row: {
          created_at: string | null
          fld_aid: number
          fld_content: string
          fld_erdat: string
          fld_id: number
          fld_title: string
          fld_uid: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fld_aid: number
          fld_content: string
          fld_erdat: string
          fld_id?: number
          fld_title: string
          fld_uid: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fld_aid?: number
          fld_content?: string
          fld_erdat?: string
          fld_id?: number
          fld_title?: string
          fld_uid?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_activity_applicants_user"
            columns: ["fld_uid"]
            isOneToOne: false
            referencedRelation: "tbl_users"
            referencedColumns: ["fld_id"]
          },
        ]
      }
      tbl_activity_matcher: {
        Row: {
          created_at: string | null
          fld_content: string
          fld_erdat: string
          fld_id: number
          fld_tid: number
          fld_title: string
          fld_uid: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fld_content: string
          fld_erdat: string
          fld_id?: number
          fld_tid: number
          fld_title: string
          fld_uid?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fld_content?: string
          fld_erdat?: string
          fld_id?: number
          fld_tid?: number
          fld_title?: string
          fld_uid?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tbl_activity_matcher_fld_uid_fkey"
            columns: ["fld_uid"]
            isOneToOne: false
            referencedRelation: "tbl_users"
            referencedColumns: ["fld_id"]
          },
        ]
      }
      tbl_activity_students: {
        Row: {
          created_at: string | null
          fld_content: string
          fld_erdat: string
          fld_id: number
          fld_sid: number
          fld_title: string
          fld_uid: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fld_content: string
          fld_erdat: string
          fld_id?: number
          fld_sid: number
          fld_title: string
          fld_uid?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fld_content?: string
          fld_erdat?: string
          fld_id?: number
          fld_sid?: number
          fld_title?: string
          fld_uid?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_activity_students_student"
            columns: ["fld_sid"]
            isOneToOne: false
            referencedRelation: "tbl_students"
            referencedColumns: ["fld_id"]
          },
          {
            foreignKeyName: "tbl_activity_students_fld_uid_fkey"
            columns: ["fld_uid"]
            isOneToOne: false
            referencedRelation: "tbl_users"
            referencedColumns: ["fld_id"]
          },
        ]
      }
      tbl_activity_teacher: {
        Row: {
          fld_content: string
          fld_erdat: string
          fld_id: number
          fld_tid: number
          fld_title: string
          fld_uid: number
        }
        Insert: {
          fld_content: string
          fld_erdat: string
          fld_id?: number
          fld_tid: number
          fld_title: string
          fld_uid: number
        }
        Update: {
          fld_content?: string
          fld_erdat?: string
          fld_id?: number
          fld_tid?: number
          fld_title?: string
          fld_uid?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_activity_teacher_teacher"
            columns: ["fld_tid"]
            isOneToOne: false
            referencedRelation: "tbl_teachers"
            referencedColumns: ["fld_id"]
          },
          {
            foreignKeyName: "fk_activity_teacher_user"
            columns: ["fld_uid"]
            isOneToOne: false
            referencedRelation: "tbl_users"
            referencedColumns: ["fld_id"]
          },
        ]
      }
      tbl_contracts: {
        Row: {
          created_at: string | null
          fld_bi: string | null
          fld_bic: string | null
          fld_bps: string | null
          fld_ct: string | null
          fld_edate: string
          fld_edtim: string | null
          fld_ename: number
          fld_end_date: string
          fld_file: string | null
          fld_iban: string | null
          fld_id: number
          fld_lesson_dur: string
          fld_lp: string
          fld_min_lesson: number
          fld_mno: string | null
          fld_p_mode: string
          fld_reg_fee: number
          fld_s_per_lesson_rate: number
          fld_sid: number
          fld_signature: string | null
          fld_start_date: string
          fld_status: Database["public"]["Enums"]["contract_status"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fld_bi?: string | null
          fld_bic?: string | null
          fld_bps?: string | null
          fld_ct?: string | null
          fld_edate: string
          fld_edtim?: string | null
          fld_ename: number
          fld_end_date: string
          fld_file?: string | null
          fld_iban?: string | null
          fld_id?: number
          fld_lesson_dur: string
          fld_lp: string
          fld_min_lesson: number
          fld_mno?: string | null
          fld_p_mode: string
          fld_reg_fee: number
          fld_s_per_lesson_rate: number
          fld_sid: number
          fld_signature?: string | null
          fld_start_date: string
          fld_status: Database["public"]["Enums"]["contract_status"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fld_bi?: string | null
          fld_bic?: string | null
          fld_bps?: string | null
          fld_ct?: string | null
          fld_edate?: string
          fld_edtim?: string | null
          fld_ename?: number
          fld_end_date?: string
          fld_file?: string | null
          fld_iban?: string | null
          fld_id?: number
          fld_lesson_dur?: string
          fld_lp?: string
          fld_min_lesson?: number
          fld_mno?: string | null
          fld_p_mode?: string
          fld_reg_fee?: number
          fld_s_per_lesson_rate?: number
          fld_sid?: number
          fld_signature?: string | null
          fld_start_date?: string
          fld_status?: Database["public"]["Enums"]["contract_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_contracts_entered_by"
            columns: ["fld_ename"]
            isOneToOne: false
            referencedRelation: "tbl_users"
            referencedColumns: ["fld_id"]
          },
          {
            foreignKeyName: "fk_contracts_student"
            columns: ["fld_sid"]
            isOneToOne: false
            referencedRelation: "tbl_students"
            referencedColumns: ["fld_id"]
          },
        ]
      }
      tbl_contracts_engagement: {
        Row: {
          created_at: string | null
          fld_cid: number
          fld_edate: string
          fld_ename: number
          fld_id: number
          fld_ssid: number
          fld_status: Database["public"]["Enums"]["engagement_status"]
          fld_t_per_lesson_rate: number
          fld_tid: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fld_cid: number
          fld_edate: string
          fld_ename: number
          fld_id?: number
          fld_ssid: number
          fld_status: Database["public"]["Enums"]["engagement_status"]
          fld_t_per_lesson_rate: number
          fld_tid: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fld_cid?: number
          fld_edate?: string
          fld_ename?: number
          fld_id?: number
          fld_ssid?: number
          fld_status?: Database["public"]["Enums"]["engagement_status"]
          fld_t_per_lesson_rate?: number
          fld_tid?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_engagement_contract"
            columns: ["fld_cid"]
            isOneToOne: false
            referencedRelation: "tbl_contracts"
            referencedColumns: ["fld_id"]
          },
          {
            foreignKeyName: "fk_engagement_entered_by"
            columns: ["fld_ename"]
            isOneToOne: false
            referencedRelation: "tbl_users"
            referencedColumns: ["fld_id"]
          },
          {
            foreignKeyName: "fk_engagement_teacher"
            columns: ["fld_tid"]
            isOneToOne: false
            referencedRelation: "tbl_teachers"
            referencedColumns: ["fld_id"]
          },
        ]
      }
      tbl_contracts_log: {
        Row: {
          created_at: string | null
          fld_cid: number
          fld_edate: string
          fld_id: number
          fld_status: string
          fld_uname: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fld_cid: number
          fld_edate: string
          fld_id?: number
          fld_status: string
          fld_uname: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fld_cid?: number
          fld_edate?: string
          fld_id?: number
          fld_status?: string
          fld_uname?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_contract_log_contract"
            columns: ["fld_cid"]
            isOneToOne: false
            referencedRelation: "tbl_contracts"
            referencedColumns: ["fld_id"]
          },
          {
            foreignKeyName: "fk_contract_log_user"
            columns: ["fld_uname"]
            isOneToOne: false
            referencedRelation: "tbl_users"
            referencedColumns: ["fld_id"]
          },
        ]
      }
      tbl_countries: {
        Row: {
          created_at: string | null
          fld_id: number
          fld_landx: string
          fld_landx50: string
          fld_lflag: Database["public"]["Enums"]["activity_status"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fld_id?: number
          fld_landx: string
          fld_landx50: string
          fld_lflag?: Database["public"]["Enums"]["activity_status"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fld_id?: number
          fld_landx?: string
          fld_landx50?: string
          fld_lflag?: Database["public"]["Enums"]["activity_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tbl_degrees: {
        Row: {
          created_at: string | null
          fld_degree_name: string
          fld_id: number
          fld_status: Database["public"]["Enums"]["activity_status"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fld_degree_name: string
          fld_id?: number
          fld_status: Database["public"]["Enums"]["activity_status"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fld_degree_name?: string
          fld_id?: number
          fld_status?: Database["public"]["Enums"]["activity_status"]
          updated_at?: string | null
        }
        Relationships: []
      }
      tbl_delete_reasons: {
        Row: {
          created_at: string | null
          fld_id: number
          fld_reason: string
          fld_status: Database["public"]["Enums"]["activity_status"]
          fld_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fld_id?: number
          fld_reason: string
          fld_status: Database["public"]["Enums"]["activity_status"]
          fld_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fld_id?: number
          fld_reason?: string
          fld_status?: Database["public"]["Enums"]["activity_status"]
          fld_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tbl_educational: {
        Row: {
          created_at: string | null
          fld_ename: string
          fld_id: number
          fld_status: Database["public"]["Enums"]["activity_status"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fld_ename: string
          fld_id?: number
          fld_status: Database["public"]["Enums"]["activity_status"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fld_ename?: string
          fld_id?: number
          fld_status?: Database["public"]["Enums"]["activity_status"]
          updated_at?: string | null
        }
        Relationships: []
      }
      tbl_lesson_durations: {
        Row: {
          created_at: string | null
          fld_id: number
          fld_l_duration: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fld_id?: number
          fld_l_duration: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fld_id?: number
          fld_l_duration?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tbl_levels: {
        Row: {
          created_at: string | null
          fld_id: number
          fld_level: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fld_id?: number
          fld_level: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fld_id?: number
          fld_level?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tbl_mediation_types: {
        Row: {
          created_at: string | null
          fld_id: number
          fld_rid: number
          fld_stage_name: string
          fld_status: Database["public"]["Enums"]["activity_status"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fld_id?: number
          fld_rid: number
          fld_stage_name: string
          fld_status: Database["public"]["Enums"]["activity_status"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fld_id?: number
          fld_rid?: number
          fld_stage_name?: string
          fld_status?: Database["public"]["Enums"]["activity_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_mediation_types_role"
            columns: ["fld_rid"]
            isOneToOne: false
            referencedRelation: "tbl_roles"
            referencedColumns: ["fld_id"]
          },
        ]
      }
      tbl_reasons: {
        Row: {
          created_at: string | null
          fld_id: number
          fld_reason: string
          fld_status: Database["public"]["Enums"]["activity_status"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fld_id?: number
          fld_reason: string
          fld_status: Database["public"]["Enums"]["activity_status"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fld_id?: number
          fld_reason?: string
          fld_status?: Database["public"]["Enums"]["activity_status"]
          updated_at?: string | null
        }
        Relationships: []
      }
      tbl_roles: {
        Row: {
          created_at: string | null
          fld_edate: string
          fld_id: number
          fld_role: string
          fld_status: Database["public"]["Enums"]["activity_status"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fld_edate: string
          fld_id?: number
          fld_role: string
          fld_status?: Database["public"]["Enums"]["activity_status"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fld_edate?: string
          fld_id?: number
          fld_role?: string
          fld_status?: Database["public"]["Enums"]["activity_status"]
          updated_at?: string | null
        }
        Relationships: []
      }
      tbl_source: {
        Row: {
          created_at: string | null
          fld_id: number
          fld_source: string
          fld_status: Database["public"]["Enums"]["activity_status"]
          fld_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fld_id?: number
          fld_source: string
          fld_status: Database["public"]["Enums"]["activity_status"]
          fld_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fld_id?: number
          fld_source?: string
          fld_status?: Database["public"]["Enums"]["activity_status"]
          fld_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tbl_students: {
        Row: {
          created_at: string | null
          fld_address: string | null
          fld_bakk_rno: string | null
          fld_bank_act: string | null
          fld_bank_name: string | null
          fld_city: string
          fld_country: string | null
          fld_ct: string | null
          fld_dob: string | null
          fld_edate: string
          fld_email: string
          fld_f_lead: string | null
          fld_first_name: string
          fld_gender: Database["public"]["Enums"]["gender"] | null
          fld_id: number
          fld_im_status: number | null
          fld_l_mode: string | null
          fld_last_name: string
          fld_latitude: string | null
          fld_ld: string | null
          fld_level: string | null
          fld_longitude: string | null
          fld_mobile: string | null
          fld_nec: Database["public"]["Enums"]["yes_no"] | null
          fld_notes: string | null
          fld_payer: string | null
          fld_phone: string
          fld_price: number | null
          fld_reason: string | null
          fld_reg_fee: number | null
          fld_rf_flag: Database["public"]["Enums"]["yes_no"] | null
          fld_s_first_name: string | null
          fld_s_last_name: string | null
          fld_sal: Database["public"]["Enums"]["salutation"] | null
          fld_school: string | null
          fld_sd: Database["public"]["Enums"]["student_relation"] | null
          fld_self_paid: Database["public"]["Enums"]["yes_no"] | null
          fld_short_bio: string | null
          fld_state: string | null
          fld_status: Database["public"]["Enums"]["student_status"]
          fld_su_type: string | null
          fld_uid: number | null
          fld_uname: number | null
          fld_wh: string | null
          fld_zip: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fld_address?: string | null
          fld_bakk_rno?: string | null
          fld_bank_act?: string | null
          fld_bank_name?: string | null
          fld_city: string
          fld_country?: string | null
          fld_ct?: string | null
          fld_dob?: string | null
          fld_edate: string
          fld_email: string
          fld_f_lead?: string | null
          fld_first_name: string
          fld_gender?: Database["public"]["Enums"]["gender"] | null
          fld_id?: number
          fld_im_status?: number | null
          fld_l_mode?: string | null
          fld_last_name: string
          fld_latitude?: string | null
          fld_ld?: string | null
          fld_level?: string | null
          fld_longitude?: string | null
          fld_mobile?: string | null
          fld_nec?: Database["public"]["Enums"]["yes_no"] | null
          fld_notes?: string | null
          fld_payer?: string | null
          fld_phone: string
          fld_price?: number | null
          fld_reason?: string | null
          fld_reg_fee?: number | null
          fld_rf_flag?: Database["public"]["Enums"]["yes_no"] | null
          fld_s_first_name?: string | null
          fld_s_last_name?: string | null
          fld_sal?: Database["public"]["Enums"]["salutation"] | null
          fld_school?: string | null
          fld_sd?: Database["public"]["Enums"]["student_relation"] | null
          fld_self_paid?: Database["public"]["Enums"]["yes_no"] | null
          fld_short_bio?: string | null
          fld_state?: string | null
          fld_status: Database["public"]["Enums"]["student_status"]
          fld_su_type?: string | null
          fld_uid?: number | null
          fld_uname?: number | null
          fld_wh?: string | null
          fld_zip?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fld_address?: string | null
          fld_bakk_rno?: string | null
          fld_bank_act?: string | null
          fld_bank_name?: string | null
          fld_city?: string
          fld_country?: string | null
          fld_ct?: string | null
          fld_dob?: string | null
          fld_edate?: string
          fld_email?: string
          fld_f_lead?: string | null
          fld_first_name?: string
          fld_gender?: Database["public"]["Enums"]["gender"] | null
          fld_id?: number
          fld_im_status?: number | null
          fld_l_mode?: string | null
          fld_last_name?: string
          fld_latitude?: string | null
          fld_ld?: string | null
          fld_level?: string | null
          fld_longitude?: string | null
          fld_mobile?: string | null
          fld_nec?: Database["public"]["Enums"]["yes_no"] | null
          fld_notes?: string | null
          fld_payer?: string | null
          fld_phone?: string
          fld_price?: number | null
          fld_reason?: string | null
          fld_reg_fee?: number | null
          fld_rf_flag?: Database["public"]["Enums"]["yes_no"] | null
          fld_s_first_name?: string | null
          fld_s_last_name?: string | null
          fld_sal?: Database["public"]["Enums"]["salutation"] | null
          fld_school?: string | null
          fld_sd?: Database["public"]["Enums"]["student_relation"] | null
          fld_self_paid?: Database["public"]["Enums"]["yes_no"] | null
          fld_short_bio?: string | null
          fld_state?: string | null
          fld_status?: Database["public"]["Enums"]["student_status"]
          fld_su_type?: string | null
          fld_uid?: number | null
          fld_uname?: number | null
          fld_wh?: string | null
          fld_zip?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_students_created_by"
            columns: ["fld_uname"]
            isOneToOne: false
            referencedRelation: "tbl_users"
            referencedColumns: ["fld_id"]
          },
          {
            foreignKeyName: "fk_students_user"
            columns: ["fld_uid"]
            isOneToOne: false
            referencedRelation: "tbl_users"
            referencedColumns: ["fld_id"]
          },
        ]
      }
      tbl_students_documents: {
        Row: {
          created_at: string | null
          fld_doc_file: string
          fld_edate: string
          fld_id: number
          fld_sid: number
          fld_uid: number
          fld_uname: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fld_doc_file: string
          fld_edate: string
          fld_id?: number
          fld_sid?: number
          fld_uid: number
          fld_uname: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fld_doc_file?: string
          fld_edate?: string
          fld_id?: number
          fld_sid?: number
          fld_uid?: number
          fld_uname?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_student_docs_created_by"
            columns: ["fld_uname"]
            isOneToOne: false
            referencedRelation: "tbl_users"
            referencedColumns: ["fld_id"]
          },
          {
            foreignKeyName: "fk_student_docs_student"
            columns: ["fld_sid"]
            isOneToOne: false
            referencedRelation: "tbl_students"
            referencedColumns: ["fld_id"]
          },
          {
            foreignKeyName: "fk_student_docs_user"
            columns: ["fld_uid"]
            isOneToOne: false
            referencedRelation: "tbl_users"
            referencedColumns: ["fld_id"]
          },
        ]
      }
      tbl_students_invoices: {
        Row: {
          created_at: string | null
          fld_ch_hr: Database["public"]["Enums"]["yes_no"] | null
          fld_cid: string | null
          fld_edate: string
          fld_i_type: Database["public"]["Enums"]["invoice_type"] | null
          fld_id: number
          fld_invoice_hr: number
          fld_invoice_total: number
          fld_lhid: string | null
          fld_min_lesson: number | null
          fld_notes: string | null
          fld_sid: number
          fld_status: Database["public"]["Enums"]["invoice_status"]
          fld_uname: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fld_ch_hr?: Database["public"]["Enums"]["yes_no"] | null
          fld_cid?: string | null
          fld_edate: string
          fld_i_type?: Database["public"]["Enums"]["invoice_type"] | null
          fld_id?: number
          fld_invoice_hr: number
          fld_invoice_total: number
          fld_lhid?: string | null
          fld_min_lesson?: number | null
          fld_notes?: string | null
          fld_sid: number
          fld_status: Database["public"]["Enums"]["invoice_status"]
          fld_uname: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fld_ch_hr?: Database["public"]["Enums"]["yes_no"] | null
          fld_cid?: string | null
          fld_edate?: string
          fld_i_type?: Database["public"]["Enums"]["invoice_type"] | null
          fld_id?: number
          fld_invoice_hr?: number
          fld_invoice_total?: number
          fld_lhid?: string | null
          fld_min_lesson?: number | null
          fld_notes?: string | null
          fld_sid?: number
          fld_status?: Database["public"]["Enums"]["invoice_status"]
          fld_uname?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_student_invoices_created_by"
            columns: ["fld_uname"]
            isOneToOne: false
            referencedRelation: "tbl_users"
            referencedColumns: ["fld_id"]
          },
          {
            foreignKeyName: "fk_student_invoices_student"
            columns: ["fld_sid"]
            isOneToOne: false
            referencedRelation: "tbl_students"
            referencedColumns: ["fld_id"]
          },
        ]
      }
      tbl_students_invoices_detail: {
        Row: {
          created_at: string | null
          fld_cid: number | null
          fld_detail: string
          fld_id: number
          fld_iid: number
          fld_l_date: string
          fld_len_lesson: string
          fld_lesson: number
          fld_my: string
          fld_s_rate: number
          fld_ssid: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fld_cid?: number | null
          fld_detail: string
          fld_id?: number
          fld_iid: number
          fld_l_date: string
          fld_len_lesson: string
          fld_lesson: number
          fld_my: string
          fld_s_rate: number
          fld_ssid: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fld_cid?: number | null
          fld_detail?: string
          fld_id?: number
          fld_iid?: number
          fld_l_date?: string
          fld_len_lesson?: string
          fld_lesson?: number
          fld_my?: string
          fld_s_rate?: number
          fld_ssid?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_student_invoice_detail_contract"
            columns: ["fld_cid"]
            isOneToOne: false
            referencedRelation: "tbl_contracts"
            referencedColumns: ["fld_id"]
          },
          {
            foreignKeyName: "fk_student_invoice_detail_invoice"
            columns: ["fld_iid"]
            isOneToOne: false
            referencedRelation: "tbl_students_invoices"
            referencedColumns: ["fld_id"]
          },
        ]
      }
      tbl_students_mediation_stages: {
        Row: {
          created_at: string | null
          fld_edate: string
          fld_etime: string | null
          fld_id: number
          fld_m_flag: string | null
          fld_m_type: number
          fld_note: string | null
          fld_sid: number
          fld_ssid: number | null
          fld_tid: number | null
          fld_uname: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fld_edate: string
          fld_etime?: string | null
          fld_id?: number
          fld_m_flag?: string | null
          fld_m_type: number
          fld_note?: string | null
          fld_sid: number
          fld_ssid?: number | null
          fld_tid?: number | null
          fld_uname: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fld_edate?: string
          fld_etime?: string | null
          fld_id?: number
          fld_m_flag?: string | null
          fld_m_type?: number
          fld_note?: string | null
          fld_sid?: number
          fld_ssid?: number | null
          fld_tid?: number | null
          fld_uname?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_mediation_created_by"
            columns: ["fld_uname"]
            isOneToOne: false
            referencedRelation: "tbl_users"
            referencedColumns: ["fld_id"]
          },
          {
            foreignKeyName: "fk_mediation_student"
            columns: ["fld_sid"]
            isOneToOne: false
            referencedRelation: "tbl_students"
            referencedColumns: ["fld_id"]
          },
          {
            foreignKeyName: "fk_mediation_student_subject"
            columns: ["fld_ssid"]
            isOneToOne: false
            referencedRelation: "tbl_students_subjects"
            referencedColumns: ["fld_id"]
          },
          {
            foreignKeyName: "fk_mediation_teacher"
            columns: ["fld_tid"]
            isOneToOne: false
            referencedRelation: "tbl_teachers"
            referencedColumns: ["fld_id"]
          },
          {
            foreignKeyName: "fk_mediation_type"
            columns: ["fld_m_type"]
            isOneToOne: false
            referencedRelation: "tbl_mediation_types"
            referencedColumns: ["fld_id"]
          },
        ]
      }
      tbl_students_subjects: {
        Row: {
          created_at: string | null
          fld_c_eid: number | null
          fld_cid: number | null
          fld_detail: string | null
          fld_edate: string
          fld_id: number
          fld_sid: number
          fld_suid: number
          fld_uname: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fld_c_eid?: number | null
          fld_cid?: number | null
          fld_detail?: string | null
          fld_edate: string
          fld_id?: number
          fld_sid: number
          fld_suid: number
          fld_uname?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fld_c_eid?: number | null
          fld_cid?: number | null
          fld_detail?: string | null
          fld_edate?: string
          fld_id?: number
          fld_sid?: number
          fld_suid?: number
          fld_uname?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_student_subjects_contract"
            columns: ["fld_cid"]
            isOneToOne: false
            referencedRelation: "tbl_contracts"
            referencedColumns: ["fld_id"]
          },
          {
            foreignKeyName: "fk_student_subjects_created_by"
            columns: ["fld_uname"]
            isOneToOne: false
            referencedRelation: "tbl_users"
            referencedColumns: ["fld_id"]
          },
          {
            foreignKeyName: "fk_student_subjects_engagement"
            columns: ["fld_c_eid"]
            isOneToOne: false
            referencedRelation: "tbl_contracts_engagement"
            referencedColumns: ["fld_id"]
          },
          {
            foreignKeyName: "fk_student_subjects_student"
            columns: ["fld_sid"]
            isOneToOne: false
            referencedRelation: "tbl_students"
            referencedColumns: ["fld_id"]
          },
          {
            foreignKeyName: "fk_student_subjects_subject"
            columns: ["fld_suid"]
            isOneToOne: false
            referencedRelation: "tbl_subjects"
            referencedColumns: ["fld_id"]
          },
        ]
      }
      tbl_su_types: {
        Row: {
          created_at: string | null
          fld_id: number
          fld_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fld_id?: number
          fld_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fld_id?: number
          fld_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tbl_subjects: {
        Row: {
          created_at: string | null
          fld_id: number
          fld_image: string | null
          fld_status: Database["public"]["Enums"]["activity_status"]
          fld_subject: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fld_id?: number
          fld_image?: string | null
          fld_status: Database["public"]["Enums"]["activity_status"]
          fld_subject: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fld_id?: number
          fld_image?: string | null
          fld_status?: Database["public"]["Enums"]["activity_status"]
          fld_subject?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tbl_system_config: {
        Row: {
          created_at: string | null
          fld_burks: string | null
          fld_cflag: string | null
          fld_cntry: number
          fld_email: string | null
          fld_femail: string | null
          fld_id: number
          fld_name1: string
          fld_name2: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fld_burks?: string | null
          fld_cflag?: string | null
          fld_cntry?: number
          fld_email?: string | null
          fld_femail?: string | null
          fld_id?: number
          fld_name1: string
          fld_name2?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fld_burks?: string | null
          fld_cflag?: string | null
          fld_cntry?: number
          fld_email?: string | null
          fld_femail?: string | null
          fld_id?: number
          fld_name1?: string
          fld_name2?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_system_config_country"
            columns: ["fld_cntry"]
            isOneToOne: false
            referencedRelation: "tbl_countries"
            referencedColumns: ["fld_id"]
          },
        ]
      }
      tbl_teachers: {
        Row: {
          created_at: string | null
          fld_address: string | null
          fld_address2: string | null
          fld_bakk_rno: string | null
          fld_bank_act: string | null
          fld_bank_name: string | null
          fld_city: string
          fld_country: string | null
          fld_dob: string
          fld_edate: string
          fld_education: string
          fld_email: string
          fld_evaluation: string | null
          fld_first_name: string
          fld_gender: Database["public"]["Enums"]["gender"]
          fld_id: number
          fld_id_no: string | null
          fld_is_available:
            | Database["public"]["Enums"]["availability_status"]
            | null
          fld_l_mode: string | null
          fld_last_name: string
          fld_latitude: string | null
          fld_longitude: string | null
          fld_onboard_date: string | null
          fld_onboard_uid: number | null
          fld_per_l_rate: string | null
          fld_phone: string
          fld_pimage: string | null
          fld_reason: string | null
          fld_self: string
          fld_short_bio: string | null
          fld_signature: string | null
          fld_source: string
          fld_state: string | null
          fld_status: Database["public"]["Enums"]["teacher_status"]
          fld_street: string | null
          fld_t_mode: string
          fld_t_subjects: string | null
          fld_uid: number
          fld_uname: number
          fld_zip: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fld_address?: string | null
          fld_address2?: string | null
          fld_bakk_rno?: string | null
          fld_bank_act?: string | null
          fld_bank_name?: string | null
          fld_city: string
          fld_country?: string | null
          fld_dob: string
          fld_edate: string
          fld_education: string
          fld_email: string
          fld_evaluation?: string | null
          fld_first_name: string
          fld_gender: Database["public"]["Enums"]["gender"]
          fld_id?: number
          fld_id_no?: string | null
          fld_is_available?:
            | Database["public"]["Enums"]["availability_status"]
            | null
          fld_l_mode?: string | null
          fld_last_name: string
          fld_latitude?: string | null
          fld_longitude?: string | null
          fld_onboard_date?: string | null
          fld_onboard_uid?: number | null
          fld_per_l_rate?: string | null
          fld_phone: string
          fld_pimage?: string | null
          fld_reason?: string | null
          fld_self: string
          fld_short_bio?: string | null
          fld_signature?: string | null
          fld_source: string
          fld_state?: string | null
          fld_status: Database["public"]["Enums"]["teacher_status"]
          fld_street?: string | null
          fld_t_mode: string
          fld_t_subjects?: string | null
          fld_uid: number
          fld_uname: number
          fld_zip: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fld_address?: string | null
          fld_address2?: string | null
          fld_bakk_rno?: string | null
          fld_bank_act?: string | null
          fld_bank_name?: string | null
          fld_city?: string
          fld_country?: string | null
          fld_dob?: string
          fld_edate?: string
          fld_education?: string
          fld_email?: string
          fld_evaluation?: string | null
          fld_first_name?: string
          fld_gender?: Database["public"]["Enums"]["gender"]
          fld_id?: number
          fld_id_no?: string | null
          fld_is_available?:
            | Database["public"]["Enums"]["availability_status"]
            | null
          fld_l_mode?: string | null
          fld_last_name?: string
          fld_latitude?: string | null
          fld_longitude?: string | null
          fld_onboard_date?: string | null
          fld_onboard_uid?: number | null
          fld_per_l_rate?: string | null
          fld_phone?: string
          fld_pimage?: string | null
          fld_reason?: string | null
          fld_self?: string
          fld_short_bio?: string | null
          fld_signature?: string | null
          fld_source?: string
          fld_state?: string | null
          fld_status?: Database["public"]["Enums"]["teacher_status"]
          fld_street?: string | null
          fld_t_mode?: string
          fld_t_subjects?: string | null
          fld_uid?: number
          fld_uname?: number
          fld_zip?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_teachers_created_by"
            columns: ["fld_uname"]
            isOneToOne: false
            referencedRelation: "tbl_users"
            referencedColumns: ["fld_id"]
          },
          {
            foreignKeyName: "fk_teachers_onboarded_by"
            columns: ["fld_onboard_uid"]
            isOneToOne: false
            referencedRelation: "tbl_users"
            referencedColumns: ["fld_id"]
          },
          {
            foreignKeyName: "fk_teachers_user"
            columns: ["fld_uid"]
            isOneToOne: false
            referencedRelation: "tbl_users"
            referencedColumns: ["fld_id"]
          },
        ]
      }
      tbl_teachers_documents: {
        Row: {
          created_at: string | null
          fld_doc_file: string
          fld_edate: string
          fld_id: number
          fld_tid: number
          fld_uid: number
          fld_uname: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fld_doc_file: string
          fld_edate: string
          fld_id?: number
          fld_tid?: number
          fld_uid: number
          fld_uname: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fld_doc_file?: string
          fld_edate?: string
          fld_id?: number
          fld_tid?: number
          fld_uid?: number
          fld_uname?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_teacher_docs_created_by"
            columns: ["fld_uname"]
            isOneToOne: false
            referencedRelation: "tbl_users"
            referencedColumns: ["fld_id"]
          },
          {
            foreignKeyName: "fk_teacher_docs_teacher"
            columns: ["fld_tid"]
            isOneToOne: false
            referencedRelation: "tbl_teachers"
            referencedColumns: ["fld_id"]
          },
          {
            foreignKeyName: "fk_teacher_docs_user"
            columns: ["fld_uid"]
            isOneToOne: false
            referencedRelation: "tbl_users"
            referencedColumns: ["fld_id"]
          },
        ]
      }
      tbl_teachers_invoices: {
        Row: {
          created_at: string | null
          fld_cid: string | null
          fld_edate: string
          fld_id: number
          fld_invoice_total: number
          fld_lhid: string | null
          fld_status: Database["public"]["Enums"]["invoice_status"]
          fld_tid: number
          fld_uname: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fld_cid?: string | null
          fld_edate: string
          fld_id?: number
          fld_invoice_total: number
          fld_lhid?: string | null
          fld_status: Database["public"]["Enums"]["invoice_status"]
          fld_tid: number
          fld_uname: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fld_cid?: string | null
          fld_edate?: string
          fld_id?: number
          fld_invoice_total?: number
          fld_lhid?: string | null
          fld_status?: Database["public"]["Enums"]["invoice_status"]
          fld_tid?: number
          fld_uname?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_teacher_invoices_created_by"
            columns: ["fld_uname"]
            isOneToOne: false
            referencedRelation: "tbl_users"
            referencedColumns: ["fld_id"]
          },
          {
            foreignKeyName: "fk_teacher_invoices_teacher"
            columns: ["fld_tid"]
            isOneToOne: false
            referencedRelation: "tbl_teachers"
            referencedColumns: ["fld_id"]
          },
        ]
      }
      tbl_teachers_invoices_detail: {
        Row: {
          created_at: string | null
          fld_cid: number | null
          fld_detail: string
          fld_id: number
          fld_iid: number
          fld_l_date: string
          fld_len_lesson: string
          fld_lesson: number
          fld_my: string
          fld_sid: number | null
          fld_ssid: number
          fld_t_rate: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fld_cid?: number | null
          fld_detail: string
          fld_id?: number
          fld_iid: number
          fld_l_date: string
          fld_len_lesson: string
          fld_lesson: number
          fld_my: string
          fld_sid?: number | null
          fld_ssid: number
          fld_t_rate: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fld_cid?: number | null
          fld_detail?: string
          fld_id?: number
          fld_iid?: number
          fld_l_date?: string
          fld_len_lesson?: string
          fld_lesson?: number
          fld_my?: string
          fld_sid?: number | null
          fld_ssid?: number
          fld_t_rate?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_teacher_invoice_detail_contract"
            columns: ["fld_cid"]
            isOneToOne: false
            referencedRelation: "tbl_contracts"
            referencedColumns: ["fld_id"]
          },
          {
            foreignKeyName: "fk_teacher_invoice_detail_invoice"
            columns: ["fld_iid"]
            isOneToOne: false
            referencedRelation: "tbl_teachers_invoices"
            referencedColumns: ["fld_id"]
          },
          {
            foreignKeyName: "fk_teacher_invoice_detail_student"
            columns: ["fld_sid"]
            isOneToOne: false
            referencedRelation: "tbl_students"
            referencedColumns: ["fld_id"]
          },
        ]
      }
      tbl_teachers_lessons_history: {
        Row: {
          created_at: string | null
          fld_edate: string
          fld_id: number
          fld_lesson: number
          fld_mon: string | null
          fld_notes: string | null
          fld_s_rate: number
          fld_sid: number
          fld_ssid: number
          fld_status: string | null
          fld_t_rate: number
          fld_tid: number
          fld_uname: number
          fld_year: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fld_edate: string
          fld_id?: number
          fld_lesson: number
          fld_mon?: string | null
          fld_notes?: string | null
          fld_s_rate: number
          fld_sid: number
          fld_ssid: number
          fld_status?: string | null
          fld_t_rate: number
          fld_tid: number
          fld_uname: number
          fld_year?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fld_edate?: string
          fld_id?: number
          fld_lesson?: number
          fld_mon?: string | null
          fld_notes?: string | null
          fld_s_rate?: number
          fld_sid?: number
          fld_ssid?: number
          fld_status?: string | null
          fld_t_rate?: number
          fld_tid?: number
          fld_uname?: number
          fld_year?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_lessons_history_created_by"
            columns: ["fld_uname"]
            isOneToOne: false
            referencedRelation: "tbl_users"
            referencedColumns: ["fld_id"]
          },
          {
            foreignKeyName: "fk_lessons_history_student"
            columns: ["fld_sid"]
            isOneToOne: false
            referencedRelation: "tbl_students"
            referencedColumns: ["fld_id"]
          },
          {
            foreignKeyName: "fk_lessons_history_teacher"
            columns: ["fld_tid"]
            isOneToOne: false
            referencedRelation: "tbl_teachers"
            referencedColumns: ["fld_id"]
          },
        ]
      }
      tbl_teachers_students_activity: {
        Row: {
          created_at: string | null
          fld_a_body: string | null
          fld_activity_type_id: number | null
          fld_aid: number | null
          fld_description: string | null
          fld_edate: string
          fld_id: number
          fld_notes: string | null
          fld_sid: number
          fld_tid: number | null
          fld_uname: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fld_a_body?: string | null
          fld_activity_type_id?: number | null
          fld_aid?: number | null
          fld_description?: string | null
          fld_edate: string
          fld_id?: number
          fld_notes?: string | null
          fld_sid: number
          fld_tid?: number | null
          fld_uname?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fld_a_body?: string | null
          fld_activity_type_id?: number | null
          fld_aid?: number | null
          fld_description?: string | null
          fld_edate?: string
          fld_id?: number
          fld_notes?: string | null
          fld_sid?: number
          fld_tid?: number | null
          fld_uname?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_teacher_student_activity_student"
            columns: ["fld_sid"]
            isOneToOne: false
            referencedRelation: "tbl_students"
            referencedColumns: ["fld_id"]
          },
          {
            foreignKeyName: "fk_teacher_student_activity_teacher"
            columns: ["fld_tid"]
            isOneToOne: false
            referencedRelation: "tbl_teachers"
            referencedColumns: ["fld_id"]
          },
          {
            foreignKeyName: "fk_teacher_student_activity_type"
            columns: ["fld_activity_type_id"]
            isOneToOne: false
            referencedRelation: "tbl_activities_types"
            referencedColumns: ["fld_id"]
          },
        ]
      }
      tbl_teachers_students_notes: {
        Row: {
          created_at: string | null
          fld_body: string | null
          fld_edate: string
          fld_id: number
          fld_note_body: string | null
          fld_note_subject: string | null
          fld_sid: number
          fld_subject: string | null
          fld_tid: number | null
          fld_uname: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fld_body?: string | null
          fld_edate: string
          fld_id?: number
          fld_note_body?: string | null
          fld_note_subject?: string | null
          fld_sid: number
          fld_subject?: string | null
          fld_tid?: number | null
          fld_uname: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fld_body?: string | null
          fld_edate?: string
          fld_id?: number
          fld_note_body?: string | null
          fld_note_subject?: string | null
          fld_sid?: number
          fld_subject?: string | null
          fld_tid?: number | null
          fld_uname?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_teacher_student_notes_created_by"
            columns: ["fld_uname"]
            isOneToOne: false
            referencedRelation: "tbl_users"
            referencedColumns: ["fld_id"]
          },
          {
            foreignKeyName: "fk_teacher_student_notes_student"
            columns: ["fld_sid"]
            isOneToOne: false
            referencedRelation: "tbl_students"
            referencedColumns: ["fld_id"]
          },
          {
            foreignKeyName: "fk_teacher_student_notes_teacher"
            columns: ["fld_tid"]
            isOneToOne: false
            referencedRelation: "tbl_teachers"
            referencedColumns: ["fld_id"]
          },
        ]
      }
      tbl_teachers_subjects_expertise: {
        Row: {
          created_at: string | null
          fld_edate: string
          fld_experience: number
          fld_id: number
          fld_level: number
          fld_sid: number
          fld_tid: number
          fld_uname: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fld_edate: string
          fld_experience: number
          fld_id?: number
          fld_level: number
          fld_sid: number
          fld_tid: number
          fld_uname: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fld_edate?: string
          fld_experience?: number
          fld_id?: number
          fld_level?: number
          fld_sid?: number
          fld_tid?: number
          fld_uname?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_teacher_subjects_created_by"
            columns: ["fld_uname"]
            isOneToOne: false
            referencedRelation: "tbl_users"
            referencedColumns: ["fld_id"]
          },
          {
            foreignKeyName: "fk_teacher_subjects_level"
            columns: ["fld_level"]
            isOneToOne: false
            referencedRelation: "tbl_levels"
            referencedColumns: ["fld_id"]
          },
          {
            foreignKeyName: "fk_teacher_subjects_subject"
            columns: ["fld_sid"]
            isOneToOne: false
            referencedRelation: "tbl_subjects"
            referencedColumns: ["fld_id"]
          },
          {
            foreignKeyName: "fk_teacher_subjects_teacher"
            columns: ["fld_tid"]
            isOneToOne: false
            referencedRelation: "tbl_teachers"
            referencedColumns: ["fld_id"]
          },
        ]
      }
      tbl_teachers_unavailability_history: {
        Row: {
          created_at: string | null
          fld_edate: string
          fld_end_date: string | null
          fld_id: number
          fld_is_active:
            | Database["public"]["Enums"]["availability_status"]
            | null
          fld_reason: string | null
          fld_start_date: string | null
          fld_tid: number
          fld_uname: number
          fld_unavailable_from: string | null
          fld_unavailable_to: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fld_edate: string
          fld_end_date?: string | null
          fld_id?: number
          fld_is_active?:
            | Database["public"]["Enums"]["availability_status"]
            | null
          fld_reason?: string | null
          fld_start_date?: string | null
          fld_tid: number
          fld_uname: number
          fld_unavailable_from?: string | null
          fld_unavailable_to?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fld_edate?: string
          fld_end_date?: string | null
          fld_id?: number
          fld_is_active?:
            | Database["public"]["Enums"]["availability_status"]
            | null
          fld_reason?: string | null
          fld_start_date?: string | null
          fld_tid?: number
          fld_uname?: number
          fld_unavailable_from?: string | null
          fld_unavailable_to?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_teacher_unavailability_created_by"
            columns: ["fld_uname"]
            isOneToOne: false
            referencedRelation: "tbl_users"
            referencedColumns: ["fld_id"]
          },
          {
            foreignKeyName: "fk_teacher_unavailability_teacher"
            columns: ["fld_tid"]
            isOneToOne: false
            referencedRelation: "tbl_teachers"
            referencedColumns: ["fld_id"]
          },
        ]
      }
      tbl_temp_students_invoices_detail: {
        Row: {
          created_at: string | null
          fld_detail: string
          fld_id: number
          fld_len_lesson: string
          fld_lesson: number
          fld_s_rate: number
          fld_tempid: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fld_detail: string
          fld_id?: number
          fld_len_lesson: string
          fld_lesson: number
          fld_s_rate: number
          fld_tempid: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fld_detail?: string
          fld_id?: number
          fld_len_lesson?: string
          fld_lesson?: number
          fld_s_rate?: number
          fld_tempid?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tbl_urls: {
        Row: {
          created_at: string | null
          fld_cname: string
          fld_edate: string
          fld_id: number
          fld_invno: number
          fld_itype: string
          fld_url: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fld_cname: string
          fld_edate: string
          fld_id?: number
          fld_invno: number
          fld_itype: string
          fld_url: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fld_cname?: string
          fld_edate?: string
          fld_id?: number
          fld_invno?: number
          fld_itype?: string
          fld_url?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tbl_users: {
        Row: {
          auth_user_id: string | null
          created_at: string | null
          fld_email: string
          fld_f_time_login: Database["public"]["Enums"]["yes_no"] | null
          fld_id: number
          fld_is_form_fill: Database["public"]["Enums"]["form_fill_status"]
          fld_is_verify: Database["public"]["Enums"]["verification_status"]
          fld_last_login: string | null
          fld_name: string
          fld_otp: string | null
          fld_passcode: string
          fld_rid: number
          fld_status: Database["public"]["Enums"]["activity_status"]
          is_legacy: boolean
          updated_at: string | null
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string | null
          fld_email: string
          fld_f_time_login?: Database["public"]["Enums"]["yes_no"] | null
          fld_id?: number
          fld_is_form_fill: Database["public"]["Enums"]["form_fill_status"]
          fld_is_verify: Database["public"]["Enums"]["verification_status"]
          fld_last_login?: string | null
          fld_name: string
          fld_otp?: string | null
          fld_passcode: string
          fld_rid: number
          fld_status: Database["public"]["Enums"]["activity_status"]
          is_legacy?: boolean
          updated_at?: string | null
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string | null
          fld_email?: string
          fld_f_time_login?: Database["public"]["Enums"]["yes_no"] | null
          fld_id?: number
          fld_is_form_fill?: Database["public"]["Enums"]["form_fill_status"]
          fld_is_verify?: Database["public"]["Enums"]["verification_status"]
          fld_last_login?: string | null
          fld_name?: string
          fld_otp?: string | null
          fld_passcode?: string
          fld_rid?: number
          fld_status?: Database["public"]["Enums"]["activity_status"]
          is_legacy?: boolean
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_users_role"
            columns: ["fld_rid"]
            isOneToOne: false
            referencedRelation: "tbl_roles"
            referencedColumns: ["fld_id"]
          },
        ]
      }
      tbl_users_activities: {
        Row: {
          created_at: string | null
          fld_activity_type_id: number
          fld_content: string
          fld_erdat: string
          fld_id: number
          fld_title: string
          fld_uid: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fld_activity_type_id: number
          fld_content: string
          fld_erdat: string
          fld_id?: number
          fld_title: string
          fld_uid: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fld_activity_type_id?: number
          fld_content?: string
          fld_erdat?: string
          fld_id?: number
          fld_title?: string
          fld_uid?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_activities_type"
            columns: ["fld_activity_type_id"]
            isOneToOne: false
            referencedRelation: "tbl_activities_types"
            referencedColumns: ["fld_id"]
          },
          {
            foreignKeyName: "fk_user_activities_user"
            columns: ["fld_uid"]
            isOneToOne: false
            referencedRelation: "tbl_users"
            referencedColumns: ["fld_id"]
          },
        ]
      }
      tbl_users_time_log: {
        Row: {
          created_at: string | null
          fld_erdat: string
          fld_id: number
          fld_ip_address: unknown
          fld_login_time: string | null
          fld_logout_time: string | null
          fld_session_duration: number | null
          fld_uid: number
          fld_user_agent: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fld_erdat: string
          fld_id?: number
          fld_ip_address?: unknown
          fld_login_time?: string | null
          fld_logout_time?: string | null
          fld_session_duration?: number | null
          fld_uid: number
          fld_user_agent?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fld_erdat?: string
          fld_id?: number
          fld_ip_address?: unknown
          fld_login_time?: string | null
          fld_logout_time?: string | null
          fld_session_duration?: number | null
          fld_uid?: number
          fld_user_agent?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_time_log_user"
            columns: ["fld_uid"]
            isOneToOne: false
            referencedRelation: "tbl_users"
            referencedColumns: ["fld_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_file_url: {
        Args: { bucket_name: string; file_path: string }
        Returns: string
      }
    }
    Enums: {
      activity_status: "Active" | "Inactive"
      availability_status: "Y" | "N"
      contract_status:
        | "Pending Signature"
        | "Active"
        | "On-Hold"
        | "Deleted"
        | "Suspended"
      engagement_status: "Active" | "Inactive"
      form_fill_status: "Y" | "N"
      gender: "Männlich" | "Weiblich" | "Divers"
      invoice_status: "Active" | "Paid" | "Suspended" | "Deleted"
      invoice_type: "Normal" | "Negative"
      salutation: "Herr" | "Frau" | "Divers" | "N/A"
      student_relation: "Sohn" | "Tochter" | "Andere" | "N/A"
      student_status:
        | "Leads"
        | "Mediation Open"
        | "Partially Mediated"
        | "Mediated"
        | "Specialist Consulting"
        | "Contracted Customers"
        | "Suspended"
        | "Deleted"
        | "Unplaceable"
        | "Waiting List"
        | "Appointment Call"
        | "Follow-up"
        | "Appl"
      teacher_status:
        | "New"
        | "Screening"
        | "Interview"
        | "Offer"
        | "Hired"
        | "Rejected"
        | "Deleted"
        | "Pending For Signature"
        | "Suspended"
        | "Inactive"
        | "Waiting List"
        | "Unclear"
      verification_status: "Y" | "N"
      yes_no: "Y" | "N"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      activity_status: ["Active", "Inactive"],
      availability_status: ["Y", "N"],
      contract_status: [
        "Pending Signature",
        "Active",
        "On-Hold",
        "Deleted",
        "Suspended",
      ],
      engagement_status: ["Active", "Inactive"],
      form_fill_status: ["Y", "N"],
      gender: ["Männlich", "Weiblich", "Divers"],
      invoice_status: ["Active", "Paid", "Suspended", "Deleted"],
      invoice_type: ["Normal", "Negative"],
      salutation: ["Herr", "Frau", "Divers", "N/A"],
      student_relation: ["Sohn", "Tochter", "Andere", "N/A"],
      student_status: [
        "Leads",
        "Mediation Open",
        "Partially Mediated",
        "Mediated",
        "Specialist Consulting",
        "Contracted Customers",
        "Suspended",
        "Deleted",
        "Unplaceable",
        "Waiting List",
        "Appointment Call",
        "Follow-up",
        "Appl",
      ],
      teacher_status: [
        "New",
        "Screening",
        "Interview",
        "Offer",
        "Hired",
        "Rejected",
        "Deleted",
        "Pending For Signature",
        "Suspended",
        "Inactive",
        "Waiting List",
        "Unclear",
      ],
      verification_status: ["Y", "N"],
      yes_no: ["Y", "N"],
    },
  },
} as const
