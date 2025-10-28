#!/usr/bin/env node

/**
 * Script to clean up duplicate users in tbl_users
 * This script safely removes inactive duplicate users while preserving active ones
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
  duplicateEmails: 0,
  usersToDelete: 0,
  usersDeleted: 0,
  usersSkipped: 0,
  errors: 0,
  startTime: null,
  endTime: null
};

// Output file path
const outputFile = path.join(process.cwd(), 'duplicate-cleanup-log.txt');
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
 * Get all users and identify duplicates
 */
async function getDuplicateUsers() {
  const { data: allUsers, error: fetchError } = await supabase
    .from('tbl_users')
    .select('fld_id, fld_name, fld_email, fld_status, fld_rid, is_legacy, created_at')
    .order('fld_email');

  if (fetchError) {
    throw new Error(`Failed to fetch users: ${fetchError.message}`);
  }

  if (!allUsers || allUsers.length === 0) {
    throw new Error('No users found in tbl_users');
  }

  stats.totalUsers = allUsers.length;

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

  return duplicates;
}

/**
 * Identify users to delete based on safety rules
 */
function identifyUsersToDelete(duplicates) {
  const usersToDelete = [];
  const usersToKeep = [];

  duplicates.forEach(([email, users]) => {
    // Separate active and inactive users
    const activeUsers = users.filter(user => 
      user.fld_status === 'Active' || user.fld_status === 'Hired'
    );
    const inactiveUsers = users.filter(user => 
      !user.fld_status || (user.fld_status !== 'Active' && user.fld_status !== 'Hired')
    );

    // Safety rules:
    // 1. If there are multiple active users, keep the first one, mark others for deletion
    // 2. If there are inactive users and at least one active user, delete all inactive users
    // 3. If there are only inactive users, keep the most recent one, delete others

    if (activeUsers.length > 1) {
      // Multiple active users - keep the first one, delete others
      log(`⚠️  Multiple active users for email: ${email}`);
      log(`   Keeping user ID ${activeUsers[0].fld_id}, marking others for deletion`);
      
      usersToKeep.push(activeUsers[0]);
      activeUsers.slice(1).forEach(user => {
        usersToDelete.push({ ...user, reason: 'Multiple active users - keeping first one' });
      });
    } else if (activeUsers.length === 1) {
      // One active user - keep it, delete all inactive
      log(`✅ One active user for email: ${email} - keeping active, deleting inactive`);
      usersToKeep.push(activeUsers[0]);
      inactiveUsers.forEach(user => {
        usersToDelete.push({ ...user, reason: 'Inactive user with active user present' });
      });
    } else if (inactiveUsers.length > 1) {
      // Only inactive users - keep the most recent one
      log(`ℹ️  Only inactive users for email: ${email} - keeping most recent`);
      const sortedInactive = inactiveUsers.sort((a, b) => 
        new Date(b.created_at || 0) - new Date(a.created_at || 0)
      );
      usersToKeep.push(sortedInactive[0]);
      sortedInactive.slice(1).forEach(user => {
        usersToDelete.push({ ...user, reason: 'Inactive user - keeping most recent' });
      });
    }
  });

  stats.usersToDelete = usersToDelete.length;
  return { usersToDelete, usersToKeep };
}

/**
 * Delete a user and handle related data
 */
async function deleteUser(user) {
  try {
    log(`🗑️  Deleting user ID ${user.fld_id} (${user.fld_name}) - ${user.reason}`);

    // First, check for related data that might prevent deletion
    const { data: relatedData, error: checkError } = await supabase
      .from('tbl_users')
      .select(`
        fld_id,
        tbl_students(fld_id),
        tbl_teachers(fld_id),
        tbl_students_subjects(fld_id),
        tbl_teachers_subjects_expertise(fld_id),
        tbl_contracts(fld_id),
        tbl_contracts_engagement(fld_id),
        tbl_students_mediation_stages(fld_id),
        tbl_teachers_students_activity(fld_id),
        tbl_teachers_students_notes(fld_id),
        tbl_teachers_lessons_history(fld_id),
        tbl_teachers_unavailability_history(fld_id),
        tbl_students_documents(fld_id),
        tbl_teachers_documents(fld_id),
        tbl_students_invoices(fld_id),
        tbl_teachers_invoices(fld_id),
        tbl_contracts_log(fld_id),
        tbl_users_time_log(fld_id)
      `)
      .eq('fld_id', user.fld_id)
      .single();

    if (checkError) {
      logError(`Failed to check related data for user ${user.fld_id}: ${checkError.message}`);
      return false;
    }

    // Check if user has related data
    const hasRelatedData = relatedData && (
      relatedData.tbl_students?.length > 0 ||
      relatedData.tbl_teachers?.length > 0 ||
      relatedData.tbl_students_subjects?.length > 0 ||
      relatedData.tbl_teachers_subjects_expertise?.length > 0 ||
      relatedData.tbl_contracts?.length > 0 ||
      relatedData.tbl_contracts_engagement?.length > 0 ||
      relatedData.tbl_students_mediation_stages?.length > 0 ||
      relatedData.tbl_teachers_students_activity?.length > 0 ||
      relatedData.tbl_teachers_students_notes?.length > 0 ||
      relatedData.tbl_teachers_lessons_history?.length > 0 ||
      relatedData.tbl_teachers_unavailability_history?.length > 0 ||
      relatedData.tbl_students_documents?.length > 0 ||
      relatedData.tbl_teachers_documents?.length > 0 ||
      relatedData.tbl_students_invoices?.length > 0 ||
      relatedData.tbl_teachers_invoices?.length > 0 ||
      relatedData.tbl_contracts_log?.length > 0 ||
      relatedData.tbl_users_time_log?.length > 0
    );

    if (hasRelatedData) {
      log(`⚠️  Skipping user ${user.fld_id} - has related data that would be affected`);
      stats.usersSkipped++;
      return false;
    }

    // Delete the user
    const { error: deleteError } = await supabase
      .from('tbl_users')
      .delete()
      .eq('fld_id', user.fld_id);

    if (deleteError) {
      logError(`Failed to delete user ${user.fld_id}: ${deleteError.message}`);
      stats.errors++;
      return false;
    }

    log(`✅ Successfully deleted user ID ${user.fld_id} (${user.fld_name})`);
    stats.usersDeleted++;
    return true;

  } catch (error) {
    logError(`Error deleting user ${user.fld_id}: ${error.message}`);
    stats.errors++;
    return false;
  }
}

/**
 * Main cleanup function
 */
async function cleanupDuplicateUsers() {
  try {
    stats.startTime = Date.now();
    log('🧹 Starting duplicate user cleanup...\n');

    // Get duplicate users
    log('📡 Analyzing duplicate users...');
    const duplicates = await getDuplicateUsers();
    
    if (duplicates.length === 0) {
      log('✅ No duplicate emails found - nothing to clean up!');
      return;
    }

    log(`📊 Found ${duplicates.length} duplicate email groups\n`);

    // Identify users to delete
    log('🔍 Identifying users to delete...');
    const { usersToDelete, usersToKeep } = identifyUsersToDelete(duplicates);

    if (usersToDelete.length === 0) {
      log('✅ No users need to be deleted - all duplicates are safe to keep!');
      return;
    }

    log(`\n📋 Cleanup Plan:`);
    log(`   Total Users: ${stats.totalUsers}`);
    log(`   Duplicate Email Groups: ${stats.duplicateEmails}`);
    log(`   Users to Delete: ${usersToDelete.length}`);
    log(`   Users to Keep: ${usersToKeep.length}\n`);

    // Show users to be deleted
    log('🗑️  Users to be deleted:');
    log('=' .repeat(60));
    usersToDelete.forEach((user, index) => {
      log(`${index + 1}. ID: ${user.fld_id} | Name: ${user.fld_name} | Email: ${user.fld_email}`);
      log(`   Status: ${user.fld_status || 'No status'} | Role: ${user.fld_rid === 1 ? 'Admin' : user.fld_rid === 2 ? 'Teacher' : user.fld_rid === 3 ? 'Student' : 'Unknown'}`);
      log(`   Reason: ${user.reason}`);
      log(`   Created: ${user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}`);
      log('');
    });

    // Confirmation prompt
    log('⚠️  WARNING: This will permanently delete the above users!');
    log('   Make sure you have a backup before proceeding.');
    log('   The script will check for related data and skip users with dependencies.\n');

    // Process deletions
    log('🔄 Processing deletions...');
    for (const user of usersToDelete) {
      await deleteUser(user);
      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Final summary
    stats.endTime = Date.now();
    const duration = Math.round((stats.endTime - stats.startTime) / 1000);
    
    log('\n📊 Cleanup Summary:');
    log(`   Total Users Analyzed: ${stats.totalUsers}`);
    log(`   Duplicate Email Groups: ${stats.duplicateEmails}`);
    log(`   Users to Delete: ${stats.usersToDelete}`);
    log(`   Users Successfully Deleted: ${stats.usersDeleted}`);
    log(`   Users Skipped (had related data): ${stats.usersSkipped}`);
    log(`   Errors: ${stats.errors}`);
    log(`   Duration: ${duration}s`);

    if (stats.errors === 0) {
      log('\n🎉 Cleanup completed successfully!');
    } else {
      log(`\n⚠️  Cleanup completed with ${stats.errors} errors. Check logs for details.`);
    }

    // Write output to file
    try {
      fs.writeFileSync(outputFile, outputContent, 'utf8');
      log(`\n📄 Cleanup log saved to: ${outputFile}`);
    } catch (writeError) {
      logError(`Failed to write output file: ${writeError.message}`);
    }

  } catch (error) {
    logError('❌ Cleanup failed: ' + error.message);
    process.exit(1);
  }
}

// Run the cleanup
if (import.meta.url === `file://${process.argv[1]}`) {
  cleanupDuplicateUsers();
}

export { cleanupDuplicateUsers };
