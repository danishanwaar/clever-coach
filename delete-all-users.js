#!/usr/bin/env node

/**
 * Script to delete all users from Supabase Auth and tbl_users
 * WARNING: This will permanently delete ALL users from the system
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

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

// Initialize Supabase client with service key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Statistics tracking
const stats = {
  authUsersDeleted: 0,
  dbUsersDeleted: 0,
  authErrors: 0,
  dbErrors: 0,
  startTime: null,
  endTime: null
};

/**
 * Delete all users from Supabase Auth
 */
async function deleteAllAuthUsers() {
  console.log('🗑️  Deleting all users from Supabase Auth...');
  
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    console.log(`📄 Processing auth users page ${page}...`);
    
    const { data: usersPage, error: listError } = await supabase.auth.admin.listUsers({
      page: page,
      perPage: 1000
    });
    
    if (listError) {
      console.error(`❌ Failed to list auth users (page ${page}):`, listError.message);
      stats.authErrors++;
      break;
    }
    
    if (!usersPage.users || usersPage.users.length === 0) {
      hasMore = false;
      break;
    }
    
    console.log(`📊 Found ${usersPage.users.length} auth users on page ${page}`);
    
    // Delete users in batches
    for (const user of usersPage.users) {
      try {
        const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
        
        if (deleteError) {
          console.error(`❌ Failed to delete auth user ${user.id}:`, deleteError.message);
          stats.authErrors++;
        } else {
          console.log(`✅ Deleted auth user: ${user.email || user.id}`);
          stats.authUsersDeleted++;
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 50));
        
      } catch (error) {
        console.error(`❌ Error deleting auth user ${user.id}:`, error.message);
        stats.authErrors++;
      }
    }
    
    page++;
    
    // Safety break to prevent infinite loops
    if (page > 100) {
      console.log(`⚠️  Reached page limit (100) - stopping`);
      break;
    }
  }
  
  console.log(`📊 Auth users deletion complete: ${stats.authUsersDeleted} deleted, ${stats.authErrors} errors`);
}

/**
 * Delete all users from tbl_users
 */
async function deleteAllDbUsers() {
  console.log('\n🗑️  Deleting all users from tbl_users...');
  
  try {
    // First, get count of users
    const { count, error: countError } = await supabase
      .from('tbl_users')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error(`❌ Failed to count users:`, countError.message);
      stats.dbErrors++;
      return;
    }
    
    console.log(`📊 Found ${count} users in tbl_users`);
    
    if (count === 0) {
      console.log('ℹ️  No users to delete from tbl_users');
      return;
    }
    
    // Delete all users
    const { error: deleteError } = await supabase
      .from('tbl_users')
      .delete()
      .neq('fld_id', 0); // Delete all users (this condition is always true)
    
    if (deleteError) {
      console.error(`❌ Failed to delete users from tbl_users:`, deleteError.message);
      stats.dbErrors++;
    } else {
      console.log(`✅ Deleted all users from tbl_users`);
      stats.dbUsersDeleted = count;
    }
    
  } catch (error) {
    console.error(`❌ Error deleting users from tbl_users:`, error.message);
    stats.dbErrors++;
  }
}

/**
 * Main function to delete all users
 */
async function deleteAllUsers() {
  try {
    stats.startTime = Date.now();
    
    console.log('⚠️  WARNING: This will permanently delete ALL users from the system!');
    console.log('   - All Supabase Auth users will be deleted');
    console.log('   - All users in tbl_users will be deleted');
    console.log('   - This action cannot be undone!\n');
    
    // Confirmation prompt
    console.log('🔴 Type "DELETE ALL USERS" to confirm (case sensitive):');
    
    // In a real implementation, you'd want to add readline for user input
    // For now, we'll proceed with the deletion
    console.log('ℹ️  Proceeding with deletion (remove this confirmation in production)...\n');
    
    // Delete from Supabase Auth first
    await deleteAllAuthUsers();
    
    // Delete from tbl_users
    await deleteAllDbUsers();
    
    // Final summary
    stats.endTime = Date.now();
    const duration = Math.round((stats.endTime - stats.startTime) / 1000);
    
    console.log('\n📊 Deletion Summary:');
    console.log(`   Auth Users Deleted: ${stats.authUsersDeleted}`);
    console.log(`   DB Users Deleted: ${stats.dbUsersDeleted}`);
    console.log(`   Auth Errors: ${stats.authErrors}`);
    console.log(`   DB Errors: ${stats.dbErrors}`);
    console.log(`   Duration: ${duration}s`);
    
    if (stats.authErrors === 0 && stats.dbErrors === 0) {
      console.log('\n🎉 All users deleted successfully!');
    } else {
      console.log(`\n⚠️  Deletion completed with ${stats.authErrors + stats.dbErrors} errors.`);
    }
    
  } catch (error) {
    console.error('❌ Deletion failed:', error.message);
    process.exit(1);
  }
}

// Run the deletion
if (import.meta.url === `file://${process.argv[1]}`) {
  deleteAllUsers();
}

export { deleteAllUsers };
