#!/usr/bin/env node

/**
 * Migration Script: Legacy PHP MySQL to Supabase PostgreSQL
 * 
 * This script migrates data from the legacy adminclever_clever MySQL database
 * to the new Supabase PostgreSQL database, handling foreign key dependencies.
 * 
 * Dependencies:
 * - mysql2: For connecting to legacy MySQL database
 * - @supabase/supabase-js: For connecting to Supabase
 * - dotenv: For environment variables
 * 
 * Usage:
 * 1. Install dependencies: npm install mysql2 @supabase/supabase-js dotenv
 * 2. Set up environment variables in .env file
 * 3. Run: node migrate-data.js
 */

import mysql from 'mysql2/promise';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Configuration
const MYSQL_CONFIG = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'Azeem0322..',
  database: 'adminclever_clever',
  charset: 'utf8mb4',
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

const DRY_RUN = process.env.DRY_RUN === 'true';
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE) || 100;
const SKIP_TABLES = (process.env.SKIP_TABLES || '').split(',').filter(Boolean);

// Tables to skip due to schema mismatches
const SCHEMA_SKIP_TABLES = [
  'tbl_activity_matcher', // Missing fld_uid column
  'tbl_activity_students', // Missing fld_uid column
  'tbl_teachers_students_activity', // Missing fld_a_body column
  'tbl_teachers_students_notes', // Missing fld_note_body column
  'tbl_teachers_unavailability_history' // Missing fld_end_date column
];

const SUPABASE_URL = "https://ttzsvghzpzazqsjdzcem.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0enN2Z2h6cHphenFzamR6Y2VtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NDE0NzAsImV4cCI6MjA3NjMxNzQ3MH0.pJOhoKyvMzzsi253iaOWhx2Tk2DW41Rh9aO7Lo9bj3Y";

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env file');
  process.exit(1);
}

// Initialize connections
let mysqlConnection;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Migration order based on foreign key dependencies
const MIGRATION_ORDER = [
  // 1. Base reference tables (no dependencies)
  'tbl_roles',
  'tbl_countries',
  'tbl_activities_types',
  'tbl_educational',
  'tbl_lesson_durations',
  'tbl_levels',
  'tbl_subjects',
  'tbl_su_types',
  'tbl_degrees',
  'tbl_reasons',
  'tbl_delete_reasons',
  'tbl_source',
  // 'tbl_urls',
  
  // // 2. System configuration
  // 'tbl_system_config', // (renamed from tbl_t000)
  
  // // 3. Mediation types (depends on roles)
  // 'tbl_mediation_types',
  
  // // 4. Users (depends on roles)
  // 'tbl_users',
  
  // // 5. Students (depends on users)
  // 'tbl_students',
  
  // // 6. Teachers (depends on users)
  // 'tbl_teachers',
  
  // // 7. Teacher subjects expertise (depends on teachers, subjects, levels, users)
  // 'tbl_teachers_subjects_expertise',
  
  // // 8. Contracts (depends on students, users)
  // 'tbl_contracts',
  
  // // 9. Contract engagements (depends on contracts, teachers, users)
  // 'tbl_contracts_engagement',
  
  // // 10. Student subjects (depends on students, subjects, users, contracts, contract engagements)
  // 'tbl_students_subjects',
  
  // 11. Student mediation stages (depends on teachers, students, student subjects, mediation types, users)
  // 'tbl_students_mediation_stages',
  
  // // 12. Activity tables (depends on users, students, teachers)
  // 'tbl_activity_applicants',
  // 'tbl_activity_matcher',
  // 'tbl_activity_students',
  // 'tbl_activity_teacher',
  // 'tbl_users_activities',
  
  // // 13. Teacher-student relationships (depends on teachers, students, users)
  // 'tbl_teachers_students_activity',
  // 'tbl_teachers_students_notes',
  // 'tbl_teachers_lessons_history',
  // 'tbl_teachers_unavailability_history',
  
  // // 14. Documents (depends on students, teachers, users)
  // 'tbl_students_documents',
  // 'tbl_teachers_documents',
  
  // // 15. Invoices (depends on students, teachers, users)
  // 'tbl_students_invoices',
  // 'tbl_teachers_invoices',
  
  // // 16. Invoice details (depends on invoices, student subjects, contracts)
  // 'tbl_students_invoices_detail',
  // 'tbl_teachers_invoices_detail',
  // 'tbl_temp_students_invoices_detail',
  
  // // 17. Contract logs (depends on contracts, users)
  // 'tbl_contracts_log',
  
  // // 18. Time logs (depends on users)
  // 'tbl_users_time_log'
];

// Field mappings for table renames and field transformations
const FIELD_MAPPINGS = {
  'tbl_t000': {
    targetTable: 'tbl_system_config',
    fieldMappings: {
  'FLD_BURKS': 'fld_burks',
  'FLD_NAME1': 'fld_name1',
  'FLD_CNTRY': 'fld_cntry',
  'FLD_NAME2': 'fld_name2',
  'FLD_CFLAG': 'fld_cflag',
  'FLD_FEMAIL': 'fld_femail',
      'FLD_EMAIL': 'fld_email'
    }
  }
};

// Data transformation functions
const TRANSFORMATIONS = {
  // Convert MySQL datetime to PostgreSQL timestamp
  datetime: (value) => {
    if (!value) return null;
    return new Date(value).toISOString();
  },
  
  // Convert MySQL date to PostgreSQL date
  date: (value) => {
    if (!value) return null;
    return new Date(value).toISOString().split('T')[0];
  },
  
  // Convert enum values
  enum: (value, mapping = {}) => {
    return mapping[value] || value;
  },
  
  // Convert boolean values
  boolean: (value) => {
    if (value === 'Y' || value === 1 || value === '1') return true;
    if (value === 'N' || value === 0 || value === '0') return false;
    return null;
  },
  
  // Convert numeric values
  numeric: (value) => {
    if (value === null || value === undefined || value === '') return null;
    return parseFloat(value);
  },
  
  // Convert integer values
  integer: (value) => {
    if (value === null || value === undefined || value === '') return null;
    return parseInt(value);
  }
};

// Main migration function
async function migrateData() {
  try {
    migrationStats.startTime = Date.now();
    console.log('🚀 Starting data migration from MySQL to Supabase...\n');
    
    if (DRY_RUN) {
      console.log('🔍 DRY RUN MODE - No data will be modified\n');
    }
    
    // Connect to MySQL
    console.log('📡 Connecting to MySQL database...');
    mysqlConnection = await mysql.createConnection(MYSQL_CONFIG);
    console.log('✅ Connected to MySQL database\n');
    
    // Test Supabase connection
    console.log('📡 Testing Supabase connection...');
    const { data, error } = await supabase.from('tbl_roles').select('count').limit(1);
    if (error) throw error;
    console.log('✅ Connected to Supabase database\n');
    
    // Process each table in dependency order
    for (const tableName of MIGRATION_ORDER) {
      try {
        await migrateTable(tableName);
        migrationStats.successfulTables++;
        updateProgress();
      } catch (error) {
        console.error(`❌ Failed to migrate ${tableName}:`, error.message);
        migrationStats.failedTables++;
        updateProgress();
        
        // Continue with other tables unless it's a critical error
        if (error.message.includes('connection') || error.message.includes('authentication')) {
          throw error;
        }
      }
    }
    
    migrationStats.endTime = Date.now();
    generateSummary();
    
    if (migrationStats.failedTables === 0) {
      console.log('\n🎉 Migration completed successfully!');
    } else {
      console.log(`\n⚠️  Migration completed with ${migrationStats.failedTables} failures. Check logs for details.`);
    }
    
  } catch (error) {
    migrationStats.endTime = Date.now();
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    generateSummary();
    process.exit(1);
  } finally {
    if (mysqlConnection) {
      await mysqlConnection.end();
      console.log('📡 MySQL connection closed');
    }
  }
}

// Migrate individual table
async function migrateTable(tableName) {
  try {
    // Skip tables in skip list
    if (SKIP_TABLES.includes(tableName)) {
      console.log(`⏭️  Skipping table: ${tableName} (in skip list)`);
      migrationStats.skippedTables++;
      return;
    }
    
    console.log(`📦 Migrating table: ${tableName}`);
    
    // Get table mapping
    const mapping = FIELD_MAPPINGS[tableName];
    const targetTable = mapping?.targetTable || tableName;
    
    // Check if table exists in MySQL
    const [tables] = await mysqlConnection.execute(
      "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?",
      [MYSQL_CONFIG.database, tableName]
    );
    
    if (tables.length === 0) {
      console.log(`⚠️  Table ${tableName} not found in MySQL, skipping...`);
      migrationStats.skippedTables++;
      return;
    }
    
    // Check if target table exists in Supabase
    if (!(await tableExists(targetTable))) {
      console.log(`⚠️  Target table ${targetTable} not found in Supabase, skipping...`);
      migrationStats.skippedTables++;
      return;
    }
    
    // Get table structure
    const [columns] = await mysqlConnection.execute(
      "SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION",
      [MYSQL_CONFIG.database, tableName]
    );
    
    // Fetch data from MySQL
    const [rows] = await mysqlConnection.execute(`SELECT * FROM \`${tableName}\``);
    
    if (rows.length === 0) {
      console.log(`⚠️  No data found in ${tableName}, skipping...`);
      migrationStats.skippedTables++;
      return;
    }
    
    console.log(`📊 Found ${rows.length} records in ${tableName}`);
    
    // Transform data
    const transformedData = rows.map(row => transformRow(row, columns, mapping, tableName));
    
    // Filter out records with invalid foreign keys
    const validData = transformedData.filter(row => {
      // Fix foreign key references to 0 or null values (table-specific)
      
      // fld_uid exists in: tbl_students, tbl_users, tbl_activity_*, tbl_teachers_students_*
      if ((tableName.includes('students') || tableName.includes('users') || 
           tableName.includes('activity') || tableName.includes('teachers_students')) &&
          (row.fld_uid === 0 || row.fld_uid === null)) {
        row.fld_uid = null; // Set to null instead of 0
      }
      
      // fld_onboard_uid exists in: tbl_teachers
      if (tableName === 'tbl_teachers' && 
          (row.fld_onboard_uid === 0 || row.fld_onboard_uid === null)) {
        row.fld_onboard_uid = null; // Set to null instead of 0
      }
      
      // fld_uname exists in: tbl_students_subjects, tbl_teachers_*, tbl_contracts, etc.
      if ((tableName.includes('subjects') || tableName.includes('teachers') || 
           tableName.includes('contracts') || tableName.includes('invoices') ||
           tableName.includes('mediation') || tableName.includes('lessons')) &&
          (row.fld_uname === 0 || row.fld_uname === null)) {
        row.fld_uname = null; // Set to null instead of 0
      }
      
      // fld_tid exists in: tbl_teachers_*, tbl_students_mediation_stages
      if ((tableName.includes('teachers') || tableName.includes('mediation')) &&
          (row.fld_tid === 0 || row.fld_tid === null)) {
        row.fld_tid = null; // Set to null instead of 0
      }
      
      // fld_cid exists in: tbl_students_subjects, tbl_*_invoices_detail, tbl_contracts_engagement
      if ((tableName.includes('subjects') || tableName.includes('invoices_detail') || 
           tableName.includes('engagement')) &&
          (row.fld_cid === 0 || row.fld_cid === null)) {
        row.fld_cid = null; // Set to null instead of 0
      }
      
      // Handle specific problematic contract IDs
      if ((tableName === 'tbl_students_subjects' || 
           tableName === 'tbl_students_invoices_detail' || 
           tableName === 'tbl_teachers_invoices_detail') &&
          (row.fld_cid === 11 || row.fld_cid === 9)) {
        row.fld_cid = null; // Set problematic contract IDs to null
      }
      
      // Handle fld_sid = 0 in tbl_teachers_invoices_detail
      if (tableName === 'tbl_teachers_invoices_detail' && row.fld_sid === 0) {
        row.fld_sid = null; // Set fld_sid = 0 to null
      }
      
      // Handle fld_c_eid = 5 in tbl_students_subjects (check if exists, else set to null)
      if (tableName === 'tbl_students_subjects' && row.fld_c_eid === 5) {
        row.fld_c_eid = null; // Set problematic engagement ID 5 to null
      }
      
      // fld_c_eid exists in: tbl_students_subjects
      if (tableName === 'tbl_students_subjects' && 
          (row.fld_c_eid === 0 || row.fld_c_eid === null)) {
        row.fld_c_eid = null; // Set to null instead of 0
      }
      
      // Handle specific problematic fld_ssid in tbl_students_mediation_stages
      if (tableName === 'tbl_students_mediation_stages' && row.fld_ssid === 590) {
        row.fld_ssid = null; // Set problematic fld_ssid 590 to null
      }
      
      // fld_activity_type_id exists in: tbl_teachers_students_activity
      if (tableName === 'tbl_teachers_students_activity' && 
          (row.fld_activity_type_id === null || row.fld_activity_type_id === undefined)) {
        row.fld_activity_type_id = 1; // Set default activity type
      }
      
      // fld_body exists in: tbl_teachers_students_notes
      if (tableName === 'tbl_teachers_students_notes' && 
          (row.fld_body === null || row.fld_body === undefined)) {
        row.fld_body = ''; // Set empty string for null body
      }
      
      // Handle tbl_urls specific transformations
      if (tableName === 'tbl_urls') {
        // Ensure fld_itype is not null
        if (row.fld_itype === null || row.fld_itype === undefined) {
          row.fld_itype = 'General'; // Set default type
        }
        
        // Ensure fld_invno is integer
        if (typeof row.fld_invno === 'string' && row.fld_invno.match(/^\d+$/)) {
          row.fld_invno = parseInt(row.fld_invno, 10);
        } else if (row.fld_invno === null || row.fld_invno === undefined) {
          row.fld_invno = 0; // Set default invoice number
        }
      }
      
      // Only process fld_unavailable_from for tbl_teachers_unavailability_history
      if (tableName === 'tbl_teachers_unavailability_history' && 
          (row.fld_unavailable_from === null || row.fld_unavailable_from === undefined)) {
        row.fld_unavailable_from = null; // Keep as null
      }
      
      // Note: Foreign key constraints are temporarily disabled during migration
      // All records will be inserted, and constraints will be re-enabled after migration
      
      return true; // Keep all records, just fix the values
    });
    
    // Handle dry run
    if (DRY_RUN) {
      console.log(`🔍 DRY RUN: Would migrate ${validData.length} records to ${targetTable}`);
      console.log(`📊 Sample record:`, JSON.stringify(validData[0], null, 2));
      return;
    }
    
    // Insert data in batches
    for (let i = 0; i < validData.length; i += BATCH_SIZE) {
      const batch = validData.slice(i, i + BATCH_SIZE);
      
      const { error } = await supabase
        .from(targetTable)
        .upsert(batch, { onConflict: 'fld_id' });
      
      if (error) {
        console.error(`❌ Error inserting batch for ${targetTable}:`, error);
        throw error;
      }
      
        // Progress update for large tables
        if (validData.length > 1000) {
          const progress = Math.round(((i + BATCH_SIZE) / validData.length) * 100);
          console.log(`📈 Progress: ${Math.min(i + BATCH_SIZE, validData.length)}/${validData.length} (${progress}%)`);
        }
      }
      
      migrationStats.totalRecords += validData.length;
      console.log(`✅ Successfully migrated ${validData.length} records to ${targetTable}\n`);
    
  } catch (error) {
    console.error(`❌ Error migrating table ${tableName}:`, error.message);
    throw error;
  }
}

// Transform row data
function transformRow(row, columns, mapping, tableName) {
  const transformed = {};
  
  for (const [key, value] of Object.entries(row)) {
    // Get column info
    const column = columns.find(col => col.COLUMN_NAME === key);
    if (!column) continue;
    
    // Apply field mapping if exists
    const targetField = mapping?.fieldMappings?.[key] || key.toLowerCase();
    
    // Transform value based on data type
    let transformedValue = value;
    
    if (value === null || value === undefined) {
      transformedValue = null;
    } else {
      switch (column.DATA_TYPE) {
        case 'datetime':
        case 'timestamp':
          transformedValue = TRANSFORMATIONS.datetime(value);
          break;
        case 'date':
          transformedValue = TRANSFORMATIONS.date(value);
          break;
        case 'tinyint':
          if (column.COLUMN_NAME.includes('is_') || column.COLUMN_NAME.includes('flag')) {
            transformedValue = TRANSFORMATIONS.boolean(value);
          } else {
            transformedValue = TRANSFORMATIONS.integer(value);
          }
          break;
        case 'int':
        case 'bigint':
          transformedValue = TRANSFORMATIONS.integer(value);
          break;
        case 'decimal':
        case 'float':
        case 'double':
          transformedValue = TRANSFORMATIONS.numeric(value);
          break;
        case 'enum':
          // Handle specific enum transformations
          if (key === 'FLD_STATUS' && value === 'Active') {
            transformedValue = 'Active';
          } else if (key === 'FLD_STATUS' && value === 'Inactive') {
            transformedValue = 'Inactive';
          } else {
            transformedValue = value;
          }
          break;
        default:
          transformedValue = value;
      }
    }
    
    transformed[targetField] = transformedValue;
  }
  
  // Fix null values for required fields (only for tbl_students_invoices)
  if (tableName === 'tbl_students_invoices') {
    if (transformed.fld_invoice_hr === null || transformed.fld_invoice_hr === undefined) {
      transformed.fld_invoice_hr = 0;
    }
  }
  
  return transformed;
}

// Handle specific table transformations
function handleSpecialCases(tableName, data) {
  switch (tableName) {
    case 'tbl_t000':
      // Rename to tbl_system_config and handle special fields
      return data.map(row => ({
        ...row,
        fld_cntry: TRANSFORMATIONS.integer(row.FLD_CNTRY) || 0
      }));
    
    case 'tbl_students':
      // Handle student-specific transformations
      return data.map(row => ({
        ...row,
        fld_dob: TRANSFORMATIONS.date(row.FLD_DOB),
        fld_edate: TRANSFORMATIONS.datetime(row.FLD_EDATE),
        fld_self_paid: TRANSFORMATIONS.boolean(row.FLD_SELF_PAID),
        fld_nec: TRANSFORMATIONS.boolean(row.FLD_NEC),
        fld_rf_flag: TRANSFORMATIONS.boolean(row.FLD_RF_FLAG)
      }));
    
    case 'tbl_teachers':
      // Handle teacher-specific transformations
      return data.map(row => ({
        ...row,
        fld_dob: TRANSFORMATIONS.date(row.FLD_DOB),
        fld_edate: TRANSFORMATIONS.datetime(row.FLD_EDATE),
        fld_onboard_date: TRANSFORMATIONS.datetime(row.FLD_ONBOARD_DATE),
        fld_is_available: TRANSFORMATIONS.boolean(row.FLD_IS_AVAILABLE),
        fld_per_l_rate: TRANSFORMATIONS.numeric(row.FLD_PER_L_RATE) || 0
      }));
    
    default:
      return data;
  }
}

// Utility function to check if table exists in Supabase
async function tableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    return !error;
  } catch {
    return false;
  }
}

// Utility function to clear table data
async function clearTable(tableName) {
  try {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .neq('fld_id', 0); // Delete all records
    
    if (error) throw error;
    console.log(`🗑️  Cleared existing data from ${tableName}`);
  } catch (error) {
    console.log(`⚠️  Could not clear ${tableName}: ${error.message}`);
  }
}

// Add progress tracking
let totalTables = MIGRATION_ORDER.length;
let completedTables = 0;
let migrationStats = {
  totalRecords: 0,
  successfulTables: 0,
  failedTables: 0,
  skippedTables: 0,
  startTime: null,
  endTime: null
};

function updateProgress() {
  completedTables++;
  const percentage = Math.round((completedTables / totalTables) * 100);
  console.log(`📈 Progress: ${completedTables}/${totalTables} tables (${percentage}%)`);
}

// Generate migration summary
function generateSummary() {
  const duration = migrationStats.endTime - migrationStats.startTime;
  const durationMinutes = Math.round(duration / 60000 * 100) / 100;
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 MIGRATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`⏱️  Duration: ${durationMinutes} minutes`);
  console.log(`📦 Total Tables: ${totalTables}`);
  console.log(`✅ Successful: ${migrationStats.successfulTables}`);
  console.log(`❌ Failed: ${migrationStats.failedTables}`);
  console.log(`⏭️  Skipped: ${migrationStats.skippedTables}`);
  console.log(`📊 Total Records: ${migrationStats.totalRecords.toLocaleString()}`);
  console.log(`⚡ Average Speed: ${Math.round(migrationStats.totalRecords / durationMinutes)} records/minute`);
  console.log('='.repeat(60));
}

// Enhanced error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Run migration
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateData()
    .then(() => {
      console.log('\n🎉 Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration failed:', error);
    process.exit(1);
    });
}

export { migrateData, migrateTable, transformRow };
