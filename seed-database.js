#!/usr/bin/env node

/**
 * Database Seed Script
 * 
 * This script creates:
 * - 3 Admin users (Auth + tbl_users)
 * - 20 Teacher applicants (Auth + tbl_users + tbl_teachers + tbl_teachers_subjects_expertise)
 * - 20 Students with Mediation Open status (tbl_users + tbl_students + tbl_students_subjects)
 * 
 * Usage: npm run seed-database
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = "https://ttzsvghzpzazqsjdzcem.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0enN2Z2h6cHphenFzamR6Y2VtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDc0MTQ3MCwiZXhwIjoyMDc2MzE3NDcwfQ.pKsLmYsL09_cgipfepKUZ6sbIQtu0B1FbNSy8WjswcQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const DEFAULT_PASSWORD = '12345678';

// Sample data arrays
const adminNames = [
  { first: 'John', last: 'Smith' },
  { first: 'Sarah', last: 'Johnson' },
  { first: 'Michael', last: 'Brown' }
];

const teacherNames = [
  { first: 'Emma', last: 'Wilson' }, { first: 'James', last: 'Davis' }, { first: 'Sophie', last: 'Miller' },
  { first: 'Oliver', last: 'Garcia' }, { first: 'Isabella', last: 'Martinez' }, { first: 'Lucas', last: 'Anderson' },
  { first: 'Ava', last: 'Taylor' }, { first: 'William', last: 'Thomas' }, { first: 'Mia', last: 'Hernandez' },
  { first: 'Benjamin', last: 'Moore' }, { first: 'Charlotte', last: 'Martin' }, { first: 'Henry', last: 'Jackson' },
  { first: 'Amelia', last: 'Thompson' }, { first: 'Alexander', last: 'White' }, { first: 'Harper', last: 'Lopez' },
  { first: 'Mason', last: 'Lee' }, { first: 'Evelyn', last: 'Gonzalez' }, { first: 'Ethan', last: 'Harris' },
  { first: 'Abigail', last: 'Clark' }, { first: 'Sebastian', last: 'Lewis' }
];

const studentNames = [
  { first: 'Noah', last: 'Robinson' }, { first: 'Emily', last: 'Walker' }, { first: 'Liam', last: 'Young' },
  { first: 'Madison', last: 'Allen' }, { first: 'Jacob', last: 'King' }, { first: 'Ella', last: 'Wright' },
  { first: 'Logan', last: 'Scott' }, { first: 'Avery', last: 'Torres' }, { first: 'Caleb', last: 'Nguyen' },
  { first: 'Sofia', last: 'Hill' }, { first: 'Ryan', last: 'Flores' }, { first: 'Aria', last: 'Green' },
  { first: 'Nathan', last: 'Adams' }, { first: 'Scarlett', last: 'Nelson' }, { first: 'Luke', last: 'Baker' },
  { first: 'Grace', last: 'Hall' }, { first: 'Jack', last: 'Rivera' }, { first: 'Chloe', last: 'Campbell' },
  { first: 'Owen', last: 'Mitchell' }, { first: 'Camila', last: 'Carter' }
];

const subjects = [
  { id: 1, name: 'Mathematics' },
  { id: 2, name: 'English' },
  { id: 3, name: 'German' },
  { id: 4, name: 'Physics' },
  { id: 5, name: 'Chemistry' },
  { id: 6, name: 'Biology' },
  { id: 7, name: 'History' },
  { id: 8, name: 'Geography' },
  { id: 9, name: 'Computer Science' },
  { id: 10, name: 'Art' }
];

const levels = [
  { id: 1, level: '1' },
  { id: 2, level: '2' },
  { id: 3, level: '3' },
  { id: 4, level: '4' },
  { id: 5, level: '5' },
  { id: 6, level: '6' },
  { id: 7, level: '7' },
  { id: 8, level: '8' },
  { id: 9, level: '9' },
  { id: 10, level: '10' },
  { id: 11, level: '11' },
  { id: 12, level: '12' },
  { id: 13, level: '13' }
];

const cities = [
  'Berlin', 'Munich', 'Hamburg', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Dortmund',
  'Essen', 'Leipzig', 'Bremen', 'Dresden', 'Hannover', 'Nuremberg', 'Duisburg', 'Bochum',
  'Wuppertal', 'Bielefeld', 'Bonn', 'Münster'
];

const stats = {
  adminsCreated: 0,
  teachersCreated: 0,
  studentsCreated: 0,
  errors: 0
};

// Helper function to generate random email
function generateEmail(firstName, lastName) {
  const randomNum = Math.floor(Math.random() * 1000);
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomNum}@yopmail.com`;
}

// Helper function to get random item from array
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Helper function to get random items from array
function getRandomItems(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Helper function to generate random phone number
function generatePhoneNumber() {
  const prefixes = ['0171', '0172', '0173', '0174', '0175', '0176', '0177', '0178', '0179', '0151', '0152', '0153', '0154', '0155', '0156', '0157', '0158', '0159'];
  const prefix = getRandomItem(prefixes);
  const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  return `${prefix}${number}`;
}

// Helper function to generate random date of birth (18-65 years old)
function generateDateOfBirth() {
  const now = new Date();
  const minAge = 18;
  const maxAge = 65;
  const age = Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge;
  const birthYear = now.getFullYear() - age;
  const birthMonth = Math.floor(Math.random() * 12) + 1;
  const birthDay = Math.floor(Math.random() * 28) + 1;
  return `${birthYear}-${birthMonth.toString().padStart(2, '0')}-${birthDay.toString().padStart(2, '0')}`;
}

// Create Admin users
async function createAdmins() {
  console.log('👑 Creating Admin users...\n');
  
  for (let i = 0; i < adminNames.length; i++) {
    const admin = adminNames[i];
    const email = generateEmail(admin.first, admin.last);
    
    try {
      console.log(`Creating admin: ${admin.first} ${admin.last} (${email})`);
      
      // Create Auth user
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: DEFAULT_PASSWORD,
        email_confirm: true,
        user_metadata: {
          first_name: admin.first,
          last_name: admin.last,
          role_id: 1
        }
      });
      
      if (authError) throw authError;
      
      stats.adminsCreated++;
      console.log(`✅ Admin created successfully\n`);
      
      // Add delay between creations
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`❌ Failed to create admin ${admin.first} ${admin.last}:`, error.message);
      stats.errors++;
    }
  }
}

// Create Teacher applicants
async function createTeachers() {
  console.log('👨‍🏫 Creating Teacher applicants...\n');
  
  for (let i = 0; i < teacherNames.length; i++) {
    const teacher = teacherNames[i];
    const email = generateEmail(teacher.first, teacher.last);
    
    try {
      console.log(`Creating teacher: ${teacher.first} ${teacher.last} (${email})`);
      
      // Create Auth user
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: DEFAULT_PASSWORD,
        email_confirm: true,
        user_metadata: {
          first_name: teacher.first,
          last_name: teacher.last,
          full_name: `${teacher.first} ${teacher.last}`,
          role_id: 2,
          temp_password: DEFAULT_PASSWORD,
        }
      });
      
      if (authError) throw authError;
      
        const { data: userData, error: userError } = await supabase
        .from("tbl_users")
        .select("fld_id, auth_user_id")
        .eq("auth_user_id", authUser.user?.id)
        .maybeSingle();
      
      if (userError) throw userError;
      
      // Create tbl_teachers record
      const { data: teacherData, error: teacherError } = await supabase
        .from('tbl_teachers')
        .insert({
          fld_first_name: teacher.first,
          fld_last_name: teacher.last,
          fld_email: email,
          fld_phone: '+923224724864',
          fld_city: getRandomItem(cities),
          fld_zip: (Math.floor(Math.random() * 90000) + 10000).toString(),
          fld_street: `${getRandomItem(['Hauptstraße', 'Bahnhofstraße', 'Kirchstraße', 'Schulstraße', 'Gartenstraße'])} ${Math.floor(Math.random() * 200) + 1}`,
          fld_gender: getRandomItem(['Männlich', 'Weiblich', 'Divers']),
          fld_dob: new Date().toISOString(),
          fld_education: getRandomItem(['university', 'university-applied-sciences', 'vocational-school', 'high-school']),
          fld_t_mode: getRandomItem(['Online', 'In-Person', 'Both']),
          fld_l_mode: getRandomItem(['Online', 'In-Person', 'Both']),
          fld_short_bio: `Experienced teacher specializing in ${getRandomItem(subjects).name.toLowerCase()}.`,
          fld_self: `I am passionate about teaching and helping students achieve their goals.`,
          fld_source: getRandomItem(['Website', 'Referral', 'Social Media', 'Advertisement']),
          fld_evaluation: 'Good',
          fld_status: 'New',
          fld_edate: new Date().toISOString(),
          fld_uid: userData.fld_id,
          fld_uname: userData.fld_id,
          fld_onboard_uid: userData.fld_id,
          fld_per_l_rate: '45.00', // Rate per lesson
          fld_latitude: '',
          fld_longitude: '',
          fld_onboard_date: new Date().toISOString()
        })
        .select()
        .single();

        console.log('Teacher data:', teacherData);
      
      if (teacherError) throw teacherError;
      
      // Create teacher subjects expertise (2-4 subjects per teacher)
      const numSubjects = Math.floor(Math.random() * 3) + 2; // 2-4 subjects
      const teacherSubjects = getRandomItems(subjects, numSubjects);
      
      const subjectInserts = teacherSubjects.map(subject => ({
        fld_tid: teacherData.fld_id,
        fld_sid: subject.id,
        fld_level: getRandomItem(levels).id,
        fld_experience: 0, // 1-10 years
        fld_edate: new Date().toISOString(),
        fld_uname: userData.fld_id
      }));
      
      const { error: subjectsError } = await supabase
        .from('tbl_teachers_subjects_expertise')
        .insert(subjectInserts);

        console.log('Subjects insert:', subjectInserts);

        console.log('Subjects error:', subjectsError);
      
      if (subjectsError) throw subjectsError;
      
      stats.teachersCreated++;
      console.log(`✅ Teacher created successfully with ${numSubjects} subjects\n`);
      
      // Add delay between creations
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`❌ Failed to create teacher ${teacher.first} ${teacher.last}:`, error.message);
      console.error('Full error:', error);
      stats.errors++;
    }
  }
}

// Create Students
async function createStudents() {
  console.log('👨‍🎓 Creating Students...\n');
  
  // Get admin user IDs for random assignment
  const { data: admins, error: adminError } = await supabase
    .from('tbl_users')
    .select('fld_id')
    .eq('fld_rid', 1);
  
  if (adminError) throw adminError;
  
  for (let i = 0; i < studentNames.length; i++) {
    const student = studentNames[i];
    const email = generateEmail(student.first, student.last);
    const randomAdmin = getRandomItem(admins);
    
    try {
      console.log(`Creating student: ${student.first} ${student.last} (${email})`);
      
      // Create tbl_users record
      const { data: userData, error: userError } = await supabase
        .from('tbl_users')
        .insert({
          fld_name: `${student.first} ${student.last}`,
          fld_email: email,
          fld_rid: 3, // Student role
          fld_status: 'Active',
          fld_is_verify: 'Y',
          fld_f_time_login: 'N',
          fld_is_form_fill: 'Y',
          is_legacy: false,
          fld_passcode: DEFAULT_PASSWORD,
        })
        .select()
        .single();
      
      if (userError) throw userError;
      
      // Create tbl_students record
      const { data: studentData, error: studentError } = await supabase
        .from('tbl_students')
        .insert({
          fld_sal: getRandomItem(['Herr', 'Frau', 'Divers', 'N/A']),
          fld_first_name: student.first,
          fld_last_name: student.last,
          fld_sd: getRandomItem(['Sohn', 'Tochter', 'Andere', 'N/A']),
          fld_s_first_name: student.first,
          fld_s_last_name: student.last,
          fld_level: getRandomItem(levels).level,
          fld_school: getRandomItem(['Gymnasium', 'Realschule', 'Hauptschule', 'Gesamtschule']),
          fld_gender: getRandomItem(['Männlich', 'Weiblich', 'Divers']),
          fld_email: email,
          fld_phone: generatePhoneNumber(),
          fld_mobile: generatePhoneNumber(),
          fld_city: getRandomItem(cities),
          fld_zip: (Math.floor(Math.random() * 90000) + 10000).toString(),
          fld_address: `${getRandomItem(['Hauptstraße', 'Bahnhofstraße', 'Kirchstraße', 'Schulstraße', 'Gartenstraße'])} ${Math.floor(Math.random() * 200) + 1}`,
          fld_l_mode: getRandomItem(['Online', 'In-Person', 'Both']),
          fld_reason: getRandomItem(['Exam preparation', 'Grade improvement', 'Homework help', 'Skill development']),
          fld_f_lead: getRandomItem(['Website', 'Referral', 'Social Media', 'Advertisement']),
          fld_notes: `Student interested in ${getRandomItem(subjects).name.toLowerCase()} tutoring.`,
          fld_payer: getRandomItem(['Parents', 'Student', 'Insurance']),
          fld_ct: getRandomItem(['Morning', 'Afternoon', 'Evening']),
          fld_wh: (Math.floor(Math.random() * 20) + 1).toString(), // 1-20 hours per week
          fld_ld: (Math.floor(Math.random() * 60) + 30).toString(), // 30-90 minutes per lesson
          fld_price: (Math.random() * 0.99).toFixed(2), // 0.00-0.99 EUR per lesson
          fld_reg_fee: (Math.random() * 0.99).toFixed(2), // 0.00-0.99 EUR registration fee
          fld_status: 'Mediation Open',
          fld_uid: randomAdmin.fld_id, // Created by random admin
          fld_nec: getRandomItem(['Y', 'N']),
          fld_edate: new Date().toISOString(),
          fld_country: 'Germany',
          fld_latitude: '',
          fld_longitude: '',
          fld_rf_flag: getRandomItem(['Y', 'N']),
          fld_im_status: null
        })
        .select()
        .single();
      
      if (studentError) throw studentError;
      
      // Create student subjects (2-3 subjects per student)
      const numSubjects = Math.floor(Math.random() * 2) + 2; // 2-3 subjects
      const studentSubjects = getRandomItems(subjects, numSubjects);
      
      const subjectInserts = studentSubjects.map(subject => ({
        fld_sid: studentData.fld_id,
        fld_suid: subject.id,
        fld_cid: null, // No contract assigned yet
        fld_c_eid: null, // No engagement assigned yet
        fld_detail: `Student needs help with ${subject.name.toLowerCase()}`,
        fld_edate: new Date().toISOString(),
        fld_uname: randomAdmin.fld_id
      }));
      
      const { error: subjectsError } = await supabase
        .from('tbl_students_subjects')
        .insert(subjectInserts);
      
      if (subjectsError) throw subjectsError;
      
      stats.studentsCreated++;
      console.log(`✅ Student created successfully with ${numSubjects} subjects\n`);
      
      // Add delay between creations
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`❌ Failed to create student ${student.first} ${student.last}:`, error.message);
      console.error('Full error:', error);
      stats.errors++;
    }
  }
}

// Main function
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');
    console.log('='.repeat(60));
    
    // Create admins first
    await createAdmins();
    
    // Create teachers
    await createTeachers();
    
    // Create students
    await createStudents();
    
    // Print summary
    console.log('='.repeat(60));
    console.log('📊 SEEDING SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Admins created: ${stats.adminsCreated}`);
    console.log(`✅ Teachers created: ${stats.teachersCreated}`);
    console.log(`✅ Students created: ${stats.studentsCreated}`);
    console.log(`❌ Errors: ${stats.errors}`);
    console.log(`📊 Total records created: ${stats.adminsCreated + stats.teachersCreated + stats.studentsCreated}`);
    console.log('='.repeat(60));
    
    if (stats.errors === 0) {
      console.log('🎉 Database seeding completed successfully!');
    } else {
      console.log('⚠️  Database seeding completed with some errors.');
    }
    
  } catch (error) {
    console.error('❌ Fatal error during seeding:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the seeding
seedDatabase()
  .then(() => {
    console.log('\n🏁 Seeding process finished!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Seeding process failed:', error);
    process.exit(1);
  });
