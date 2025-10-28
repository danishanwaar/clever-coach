#!/usr/bin/env node

/**
 * Test script to verify Supabase Auth permissions
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration
const SUPABASE_URL = "https://ttzsvghzpzazqsjdzcem.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0enN2Z2h6cHphenFzamR6Y2VtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NDE0NzAsImV4cCI6MjA3NjMxNzQ3MH0.pJOhoKyvMzzsi253iaOWhx2Tk2DW41Rh9aO7Lo9bj3Y";

console.log('🔍 Testing Supabase Auth permissions...\n');

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function testAuthPermissions() {
  try {
    console.log('1. Testing service key validity...');
    
    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('tbl_users')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Service key test failed:', testError.message);
      return;
    }
    
    console.log('✅ Service key is valid for database access');
    
    console.log('\n2. Testing auth admin permissions...');
    
    // Test auth admin permissions
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1
    });
    
    if (authError) {
      console.error('❌ Auth admin test failed:', authError.message);
      console.error('   This means the service key does not have admin permissions');
      console.error('   You need to use the SERVICE_ROLE key, not the anon key');
      return;
    }
    
    console.log('✅ Auth admin permissions are working');
    console.log(`   Found ${authUsers?.users?.length || 0} existing auth users`);
    
    console.log('\n3. Testing user creation...');
    
    // Test creating a user
    const testEmail = `test-${Date.now()}@example.com`;
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'testpassword123',
      email_confirm: true
    });
    
    if (createError) {
      console.error('❌ User creation test failed:', createError.message);
      console.error('   Error details:', createError);
      return;
    }
    
    console.log('✅ User creation is working');
    console.log(`   Created test user: ${newUser.user.id}`);
    
    // Clean up test user
    await supabase.auth.admin.deleteUser(newUser.user.id);
    console.log('✅ Test user cleaned up');
    
    console.log('\n🎉 All tests passed! The service key has proper permissions.');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testAuthPermissions();
