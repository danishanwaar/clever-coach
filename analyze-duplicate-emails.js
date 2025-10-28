#!/usr/bin/env node

/**
 * Script to analyze duplicate emails in tbl_users
 * This script identifies duplicate emails and their status
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

// Configuration
const SUPABASE_URL = "https://ttzsvghzpzazqsjdzcem.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0enN2Z2h6cHphenFzamR6Y2VtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDc0MTQ3MCwiZXhwIjoyMDc2MzE3NDcwfQ.pKsLmYsL09_cgipfepKUZ6sbIQtu0B1FbNSy8WjswcQ";

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   SUPABASE_URL and SUPABASE_SERVICE_KEY must be set');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Statistics tracking
const stats = {
  totalUsers: 0,
  uniqueEmails: 0,
  duplicateEmails: 0,
  activeDuplicates: 0,
  inactiveDuplicates: 0,
  startTime: null,
  endTime: null
};

// Output file path
const outputFile = path.join(process.cwd(), 'duplicate-emails-analysis.txt');
let outputContent = '';

/**
 * Log function that writes to both console and output file
 */
function log(message) {
  console.log(message);
  outputContent += message + '\n';
}

/**
 * Error log function
 */
function logError(message) {
  console.error(message);
  outputContent += 'ERROR: ' + message + '\n';
}

/**
 * Analyze duplicate emails in tbl_users
 */
async function analyzeDuplicateEmails() {
  try {
    stats.startTime = Date.now();
    log('🔍 Analyzing duplicate emails in tbl_users...\n');

    // Get all users with their email and status
    log('📡 Fetching all users from tbl_users...');
    const { data: allUsers, error: fetchError } = await supabase
      .from('tbl_users')
      .select('fld_id, fld_name, fld_email, fld_status, fld_rid, is_legacy, created_at')
      .order('fld_email');

    if (fetchError) {
      throw new Error(`Failed to fetch users: ${fetchError.message}`);
    }

    if (!allUsers || allUsers.length === 0) {
      log('ℹ️  No users found in tbl_users');
      return;
    }

    stats.totalUsers = allUsers.length;
    log(`📊 Found ${stats.totalUsers} total users\n`);

    // Group users by email
    const emailGroups = {};
    allUsers.forEach(user => {
      if (!user.fld_email) return; // Skip users without email
      
      const email = user.fld_email.toLowerCase().trim();
      if (!emailGroups[email]) {
        emailGroups[email] = [];
      }
      emailGroups[email].push(user);
    });

    // Find duplicates
    const duplicates = Object.entries(emailGroups).filter(([email, users]) => users.length > 1);
    stats.duplicateEmails = duplicates.length;
    stats.uniqueEmails = Object.keys(emailGroups).length;

    log(`📈 Analysis Results:`);
    log(`   Total Users: ${stats.totalUsers}`);
    log(`   Unique Emails: ${stats.uniqueEmails}`);
    log(`   Duplicate Emails: ${stats.duplicateEmails}\n`);

    if (duplicates.length === 0) {
      log('✅ No duplicate emails found!');
      return;
    }

    // Analyze each duplicate email group
    log('🔍 Duplicate Email Analysis:\n');
    log('=' .repeat(80));

    duplicates.forEach(([email, users], index) => {
      log(`\n${index + 1}. Email: ${email}`);
      log(`   Count: ${users.length} users`);
      log(`   Users:`);
      
      users.forEach((user, userIndex) => {
        const status = user.fld_status || 'No status';
        const role = user.fld_rid === 1 ? 'Admin' : user.fld_rid === 2 ? 'Teacher' : user.fld_rid === 3 ? 'Student' : 'Unknown';
        const legacy = user.is_legacy ? 'Legacy' : 'New';
        const created = user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown';
        
        log(`     ${userIndex + 1}. ID: ${user.fld_id} | Name: ${user.fld_name} | Status: ${status} | Role: ${role} | ${legacy} | Created: ${created}`);
      });

      // Check if any are active
      const activeUsers = users.filter(user => user.fld_status === 'Active' || user.fld_status === 'Hired');
      const inactiveUsers = users.filter(user => !user.fld_status || user.fld_status !== 'Active' && user.fld_status !== 'Hired');
      
      if (activeUsers.length > 0) {
        stats.activeDuplicates++;
        log(`   ⚠️  WARNING: ${activeUsers.length} active user(s) found with this email!`);
      }
      
      if (inactiveUsers.length > 0) {
        stats.inactiveDuplicates++;
        log(`   ℹ️  ${inactiveUsers.length} inactive user(s) with this email`);
      }

      log('   ' + '-'.repeat(60));
    });

    // Summary
    stats.endTime = Date.now();
    const duration = Math.round((stats.endTime - stats.startTime) / 1000);
    
    log('\n📊 Summary:');
    log(`   Total Users: ${stats.totalUsers}`);
    log(`   Unique Emails: ${stats.uniqueEmails}`);
    log(`   Duplicate Emails: ${stats.duplicateEmails}`);
    log(`   Active Duplicates: ${stats.activeDuplicates}`);
    log(`   Inactive Duplicates: ${stats.inactiveDuplicates}`);
    log(`   Analysis Duration: ${duration}s`);

    if (stats.activeDuplicates > 0) {
      log('\n⚠️  WARNING: Found duplicate emails with active users!');
      log('   This could cause authentication issues.');
      log('   Consider merging or deactivating duplicate accounts.');
    } else {
      log('\n✅ No active duplicate emails found.');
    }

    // Generate SQL queries for cleanup
    log('\n🔧 Suggested Cleanup Queries:');
    log('=' .repeat(50));
    
    duplicates.forEach(([email, users]) => {
      const activeUsers = users.filter(user => user.fld_status === 'Active' || user.fld_status === 'Hired');
      const inactiveUsers = users.filter(user => !user.fld_status || user.fld_status !== 'Active' && user.fld_status !== 'Hired');
      
      if (activeUsers.length > 1) {
        log(`\n-- Multiple active users for email: ${email}`);
        log(`-- Keep user ID ${activeUsers[0].fld_id}, deactivate others:`);
        activeUsers.slice(1).forEach(user => {
          log(`UPDATE tbl_users SET fld_status = 'Inactive' WHERE fld_id = ${user.fld_id};`);
        });
      }
      
      if (inactiveUsers.length > 0 && activeUsers.length > 0) {
        log(`\n-- Inactive users for email: ${email} (active user exists)`);
        inactiveUsers.forEach(user => {
          log(`-- Consider deleting inactive user ID ${user.fld_id}:`);
          log(`DELETE FROM tbl_users WHERE fld_id = ${user.fld_id};`);
        });
      }
    });

    // Write output to file
    try {
      fs.writeFileSync(outputFile, outputContent, 'utf8');
      log(`\n📄 Analysis results saved to: ${outputFile}`);
    } catch (writeError) {
      logError(`Failed to write output file: ${writeError.message}`);
    }

  } catch (error) {
    logError('❌ Analysis failed: ' + error.message);
    process.exit(1);
  }
}

// Run the analysis
if (import.meta.url === `file://${process.argv[1]}`) {
  analyzeDuplicateEmails();
}

export { analyzeDuplicateEmails };
