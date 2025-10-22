# Comprehensive Detailed PRD: CleverCoach Tutoring Platform Migration

## Executive Summary

This document provides a comprehensive Product Requirements Document (PRD) for migrating the CleverCoach tutoring platform from PHP/MySQL to React TypeScript/Supabase/Tailwind CSS. The analysis covers every file in the existing system to ensure complete business logic preservation and feature parity.

## Table of Contents

1. [System Overview](#system-overview)
2. [User Roles & Authentication](#user-roles--authentication)
3. [Teacher Signup & Approval Process](#teacher-signup--approval-process)
4. [Student Management & Status Workflow](#student-management--status-workflow)
5. [Teacher-Student Matching System](#teacher-student-matching-system)
6. [Contract Management](#contract-management)
7. [Financial System](#financial-system)
8. [Admin Workflows](#admin-workflows)
9. [Database Schema](#database-schema)
10. [Technical Architecture](#technical-architecture)
11. [Migration Strategy](#migration-strategy)

---

## System Overview

### Current Technology Stack
- **Backend**: PHP 7.4+ with MySQL
- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap
- **Email Service**: SendGrid API
- **Maps**: Google Maps API
- **File Storage**: Supabase Storage
- **Authentication**: Session-based with MD5 password hashing

### Target Technology Stack
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Real-time)
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **State Management**: Zustand
- **Forms**: React Hook Form
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Maps**: Google Maps API
- **Email**: SendGrid API
- **File Storage**: Supabase Storage

---

## User Roles & Authentication

### User Roles Hierarchy

#### 1. Admin (FLD_RID = 1)
- **Full system access**
- **Permissions**: All CRUD operations, user management, financial oversight
- **Dashboard**: Complete system overview with analytics
- **Key Responsibilities**:
  - Teacher approval/rejection
  - Student status management
  - Contract oversight
  - Financial management
  - System configuration

#### 2. Teacher (FLD_RID = 2)
- **Limited access to own data**
- **Permissions**: Profile management, student assignments, time logging
- **Dashboard**: Personal teaching dashboard
- **Key Responsibilities**:
  - Profile maintenance
  - Student interaction
  - Time logging
  - Progress reporting

#### 3. Student (FLD_RID = 3)
- **NO LOGIN ACCESS** - Students are managed by Admin only
- **Admin-managed accounts** - All student data managed by administrators
- **No direct portal access** - Students cannot log into the system
- **Key Responsibilities** (Admin-managed):
  - Profile maintenance (by Admin)
  - Contract signing (via email links)
  - Lesson scheduling (by Admin/Teacher)

### Authentication System

#### User Registration
- **NO Admin Signup**: Admins are created manually by system administrators
- **Teacher Signup Only**: Only teachers can register through the signup process
- **No Student Registration**: Students are managed by Admin only

#### Login Process
```typescript
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'Admin' | 'Teacher'; // Students do NOT have login access
    isVerified: boolean;
    isFormFilled: boolean;
    firstTimeLogin: boolean;
    status: 'Active' | 'Inactive';
  };
  redirectTo: string;
}
```

#### Password Reset Flow
1. **Request Reset**: User enters email
2. **OTP Generation**: 6-digit OTP generated and stored
3. **Email Sent**: SendGrid sends OTP and reset link
4. **OTP Verification**: User enters OTP
5. **Password Update**: New password set

#### Session Management
- **Session Variables**: FLD_ID, FLD_NAME, FLD_EMAIL, FLD_ROLE
- **Security Checks**: Role-based access control (Admin/Teacher only)
- **Auto-redirect**: Based on user status and form completion
- **Student Access**: Students have NO login access - managed by Admin only

---

## Teacher Signup & Approval Process

### Complete Teacher Onboarding Flow

#### Phase 1: Initial Registration
**File**: `controllers/applicant-form.php`

**Business Logic**:
1. **Email Validation**: Check if email already exists
2. **User Creation**: Insert into `tbl_users` with role 2 (Teacher)
3. **Teacher Profile**: Insert into `tbl_teachers` with status 'New'
4. **Geocoding**: Calculate latitude/longitude using Google Maps API
5. **Subject Expertise**: Store teacher's subject capabilities
6. **Document Upload**: Handle profile image and documents
7. **Email Notifications**: 
   - Admin notification of new applicant
   - Teacher confirmation email

**Data Collected**:
```typescript
interface TeacherRegistration {
  // Personal Information
  firstName: string;
  lastName: string;
  gender: 'Male' | 'Female';
  dateOfBirth: string;
  email: string;
  phone: string;
  
  // Address Information
  street: string;
  city: string;
  zip: string;
  country: string;
  latitude?: number;
  longitude?: number;
  
  // Professional Information
  education: string;
  transportMode: 'Car' | 'Public Transport' | 'Bicycle' | 'Walking';
  learningMode: 'Online' | 'In-Person' | 'Hybrid';
  shortBio: string;
  selfDescription: string;
  source: string; // How they found us
  
  // Subject Expertise
  subjects: Array<{
    subjectId: string;
    level: string;
    experience: number;
  }>;
  
  // Documents
  profileImage: File;
  documents: File[];
}
```

#### Phase 2: Admin Review Process
**File**: `controllers/applicant.php`

**Status Progression**:
1. **New** → Initial application received
2. **Screening** → Admin reviewing application
3. **Interview** → Interview scheduled/completed
4. **Offer** → Job offer extended
5. **Pending For Signature** → Contract sent for signing
6. **Hired** → Contract signed, teacher active
7. **Rejected** → Application rejected
8. **Deleted** → Application deleted
9. **Waiting List** → On waiting list
10. **Unclear** → Requires clarification

**Admin Actions**:
- **View Application**: Complete teacher profile with documents
- **Update Status**: Move through approval stages
- **Set Rate**: Define per-lesson rate
- **Add Notes**: Internal evaluation notes
- **Record Activities**: Track communication history

#### Phase 3: Contract Generation
**Business Logic**:
1. **Status Change**: Move to 'Pending For Signature'
2. **Password Generation**: Create secure password
3. **User Activation**: Set user status to 'Active'
4. **Contract Creation**: Generate teacher contract
5. **Email Notification**: Send contract signing link

#### Phase 4: Contract Signing
**File**: `teacher-contract-signing.php`

**Process**:
1. **Contract Display**: Show contract terms
2. **Digital Signature**: Capture signature
3. **Status Update**: Change to 'Hired'
4. **Login Credentials**: Send username/password via email
5. **Portal Access**: Enable teacher dashboard access

#### Phase 5: Login Credentials Delivery
**Business Logic**:
1. **Admin Approval**: Admin approves teacher application
2. **Password Generation**: System generates secure password
3. **Email Notification**: SendGrid sends login credentials
4. **Account Activation**: Teacher account becomes active
5. **First Login**: Teacher logs in with provided credentials

### Teacher Status Management

#### Status Transitions
```typescript
type TeacherStatus = 
  | 'New'
  | 'Screening' 
  | 'Interview'
  | 'Offer'
  | 'Pending For Signature'
  | 'Hired'
  | 'Rejected'
  | 'Deleted'
  | 'Waiting List'
  | 'Unclear';

interface StatusTransition {
  from: TeacherStatus;
  to: TeacherStatus;
  conditions: string[];
  actions: string[];
}
```

#### Business Rules
- **New → Screening**: Admin reviews application
- **Screening → Interview**: Admin schedules interview
- **Interview → Offer**: Interview successful, offer extended
- **Offer → Pending For Signature**: Contract generated
- **Pending For Signature → Hired**: Contract signed
- **Any Status → Rejected**: Application rejected
- **Any Status → Deleted**: Application removed

---

## Student Management & Status Workflow

### Student Registration Process
**File**: `controllers/student-form.php`

**Business Logic**:
1. **Admin-Only Registration**: Students are registered by Admin only
2. **Data Collection**: Comprehensive student information
3. **Geocoding**: Calculate coordinates for matching
4. **Subject Selection**: Choose subjects for tutoring
5. **Status Setting**: Initial status 'Mediation Open'
6. **Document Upload**: Handle required documents
7. **NO LOGIN CREATED**: Students do not get login credentials

**Data Collected**:
```typescript
interface StudentRegistration {
  // Personal Information
  salutation: string;
  firstName: string;
  lastName: string;
  studentFirstName: string;
  studentLastName: string;
  gender: 'Male' | 'Female';
  dateOfBirth: string;
  email: string;
  phone: string;
  mobile: string;
  
  // Address Information
  city: string;
  zip: string;
  address: string;
  latitude?: number;
  longitude?: number;
  
  // Academic Information
  level: string;
  school: string;
  subjects: string[];
  
  // Tutoring Requirements
  learningMode: 'Online' | 'In-Person' | 'Hybrid';
  reason: string;
  leadSource: string;
  notes: string;
  
  // Financial Information
  payer: string;
  contractType: string;
  workingHours: string;
  lessonDuration: string;
  price: number;
  registrationFee: number;
}
```

### Student Status Workflow

#### Status Definitions
```typescript
type StudentStatus = 
  | 'Leads'                    // Initial lead
  | 'Mediation Open'          // Ready for teacher matching
  | 'Partially Mediated'      // Some subjects matched
  | 'Mediated'                // All subjects matched
  | 'Specialist Consulting'   // Requires specialist
  | 'Contracted Customers'    // Has active contract
  | 'Suspended'               // Temporarily suspended
  | 'Deleted'                 // Removed from system
  | 'Unplaceable'             // Cannot find suitable teacher
  | 'Waiting List'            // On waiting list
  | 'Appointment Call'        // Appointment scheduled
  | 'Follow-up'               // Follow-up required
  | 'Appl. Med.';             // Application mediation
```

#### Status Progression Logic

**1. Leads → Appointment Call**
- **Trigger**: Initial contact made
- **Business Logic**: Schedule initial consultation
- **Actions**: Create appointment, send confirmation

**2. Appointment Call → Mediation Open**
- **Trigger**: Consultation completed successfully
- **Business Logic**: Student ready for teacher matching
- **Actions**: Enable matching algorithm, notify admin

**3. Mediation Open → Partially Mediated**
- **Trigger**: Some subjects matched with teachers
- **Business Logic**: Continue matching remaining subjects
- **Actions**: Update matching status, notify stakeholders

**4. Partially Mediated → Mediated**
- **Trigger**: All subjects matched with teachers
- **Business Logic**: Ready for contract creation
- **Actions**: Enable contract generation

**5. Mediated → Contracted Customers**
- **Trigger**: Contract signed and activated
- **Business Logic**: Student becomes paying customer
- **Actions**: Enable lesson scheduling, billing

**6. Any Status → Suspended**
- **Trigger**: Payment issues, behavioral problems
- **Business Logic**: Temporarily halt services
- **Actions**: Suspend access, notify stakeholders

**7. Any Status → Unplaceable**
- **Trigger**: No suitable teachers found
- **Business Logic**: Cannot provide service
- **Actions**: Add to waiting list, notify student

### Student-Subject Management

#### Subject Enrollment
```typescript
interface StudentSubject {
  studentId: string;
  subjectId: string;
  contractId?: string;
  engagementId?: string;
  status: 'Active' | 'Inactive' | 'Pending';
  enrollmentDate: string;
  createdBy: string;
}
```

#### Mediation Stages
```typescript
interface MediationStage {
  teacherId: string;
  studentId: string;
  subjectId: string;
  mediationType: string;
  flag: 'Active' | 'Inactive';
  createdDate: string;
  createdBy: string;
}
```

---

## Teacher-Student Matching System

### Matching Algorithm
**File**: `dynamic-matcher.php`

#### Core Matching Logic
```typescript
interface MatchingCriteria {
  studentId: string;
  subjects: string[];
  level: string;
  gender: 'Male' | 'Female' | 'Any';
  maxDistance: number; // in kilometers
  learningMode: 'Online' | 'In-Person' | 'Hybrid';
  teacherStatus: 'Active' | 'Inactive' | 'Applicant';
}

interface TeacherMatch {
  teacherId: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  subjects: string[];
  experience: number;
  activeStudents: number;
  distance: number;
  availability: boolean;
  rating?: number;
}
```

#### Matching Process
1. **Subject Filtering**: Find teachers teaching required subjects
2. **Level Matching**: Match teacher expertise with student level
3. **Gender Preference**: Consider gender preferences if specified
4. **Distance Calculation**: Calculate distance using coordinates
5. **Availability Check**: Ensure teacher is available
6. **Workload Consideration**: Check teacher's current student load
7. **Rating Consideration**: Factor in teacher ratings

#### Distance Calculation
```typescript
function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
```

### Matching Interface Features

#### Search Filters
- **Teacher Status**: Active, Inactive, Applicant
- **Subjects**: Multiple subject selection
- **Distance**: Maximum distance radius
- **Gender**: Male, Female, Any
- **Availability**: Currently available teachers
- **Experience**: Years of experience range

#### Match Results Display
```typescript
interface MatchResult {
  teacher: {
    id: string;
    name: string;
    age: number;
    gender: string;
    subjects: string[];
    experience: number;
    activeStudents: number;
    distance: number;
    rating: number;
    availability: boolean;
  };
  compatibility: number; // 0-100%
  reasons: string[]; // Why this is a good match
}
```

#### Matching Actions
1. **View Profile**: Detailed teacher information
2. **Contact Teacher**: Send message to teacher
3. **Assign Teacher**: Create teacher-student engagement
4. **Record Activity**: Log matching decisions
5. **Rate Match**: Rate the quality of the match

---

## Contract Management

### Contract Creation Process
**File**: `controllers/contracts.php`

#### Student Contract Creation
```typescript
interface StudentContract {
  studentId: string;
  contractType: string;
  startDate: string;
  endDate: string;
  paymentMode: string;
  lessonPackage: number;
  lessonDuration: number;
  minimumLessons: number;
  registrationFee: number;
  perLessonRate: number;
  bypassSignature: boolean;
  status: 'Active' | 'Pending Signature';
  createdBy: string;
  createdDate: string;
}
```

#### Business Logic
1. **Contract Generation**: Create contract with terms
2. **Signature Requirement**: Determine if signature needed
3. **Status Setting**: Set to 'Active' or 'Pending Signature'
4. **Email Notification**: Send contract to student
5. **Document Storage**: Store contract file

#### Contract Signing Process
**File**: `contract-signing.php`

**Steps**:
1. **Email Link Access**: Student accesses via email link (NO login required)
2. **Contract Display**: Show contract terms
3. **Digital Signature**: Capture student signature
4. **Status Update**: Change to 'Active'
5. **Notification**: Notify admin of signed contract
6. **NO PORTAL ACCESS**: Students do not get portal access

### Teacher Engagement Contracts

#### Engagement Creation
```typescript
interface TeacherEngagement {
  studentSubjectId: string;
  contractId: string;
  teacherId: string;
  teacherPerLessonRate: number;
  status: 'Active' | 'Inactive';
  createdBy: string;
  createdDate: string;
}
```

#### Business Logic
1. **Engagement Creation**: Link teacher to student-subject
2. **Rate Setting**: Set teacher's per-lesson rate
3. **Status Update**: Update student subject status
4. **Notification**: Notify teacher of new engagement
5. **Access Enable**: Enable teacher-student communication

### Contract Management Features

#### Contract Status Tracking
- **Pending Signature**: Awaiting student signature
- **Active**: Contract signed and active
- **Cancelled**: Contract cancelled
- **Expired**: Contract expired

#### Contract Modifications
- **Rate Changes**: Update lesson rates
- **Duration Changes**: Modify contract duration
- **Cancellation**: Cancel contract with reason
- **Renewal**: Extend contract period

---

## File Management System (Supabase Storage)

### File Storage Architecture

#### Storage Buckets Organization
```typescript
interface StorageBucket {
  name: string;
  description: string;
  access: 'public' | 'private';
  policies: string[];
  maxFileSize: number;
  allowedFileTypes: string[];
}

const storageBuckets: StorageBucket[] = [
  {
    name: 'teacher-documents',
    description: 'Teacher application documents and certificates',
    access: 'private',
    policies: ['Teachers can upload own documents', 'Admins can view all'],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png']
  },
  {
    name: 'student-documents', 
    description: 'Student registration documents',
    access: 'private',
    policies: ['Students can upload own documents', 'Admins can view all'],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png']
  },
  {
    name: 'signatures',
    description: 'Digital signatures for contracts',
    access: 'private',
    policies: ['Users can upload own signatures', 'Admins can view all'],
    maxFileSize: 2 * 1024 * 1024, // 2MB
    allowedFileTypes: ['png', 'jpg', 'jpeg', 'svg']
  },
  {
    name: 'contracts',
    description: 'Contract documents and agreements',
    access: 'private',
    policies: ['Contract parties can access', 'Admins can view all'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedFileTypes: ['pdf', 'doc', 'docx']
  },
  {
    name: 'profile-images',
    description: 'User profile images',
    access: 'public',
    policies: ['Users can upload own images', 'Public read access'],
    maxFileSize: 2 * 1024 * 1024, // 2MB
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'webp']
  }
];
```

#### File Upload Workflow
```typescript
interface FileUpload {
  file: File;
  bucket: string;
  path: string;
  metadata?: Record<string, any>;
}

const uploadFile = async (upload: FileUpload) => {
  // Validate file type and size
  const bucket = storageBuckets.find(b => b.name === upload.bucket);
  if (!bucket) throw new Error('Invalid bucket');
  
  if (upload.file.size > bucket.maxFileSize) {
    throw new Error('File too large');
  }
  
  const fileExtension = upload.file.name.split('.').pop()?.toLowerCase();
  if (!bucket.allowedFileTypes.includes(fileExtension || '')) {
    throw new Error('File type not allowed');
  }
  
  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(upload.bucket)
    .upload(upload.path, upload.file, {
      cacheControl: '3600',
      upsert: false,
      contentType: upload.file.type
    });
  
  if (error) throw error;
  return data;
};
```

#### File Access and Retrieval
```typescript
const getFileUrl = async (bucket: string, path: string, expiresIn: number = 3600) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);
  
  if (error) throw error;
  return data.signedUrl;
};

const downloadFile = async (bucket: string, path: string) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(path);
  
  if (error) throw error;
  return data;
};
```

#### File Management Operations
```typescript
const deleteFile = async (bucket: string, path: string) => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);
  
  if (error) throw error;
};

const listFiles = async (bucket: string, folder?: string) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(folder);
  
  if (error) throw error;
  return data;
};

const moveFile = async (bucket: string, fromPath: string, toPath: string) => {
  // Download from source
  const { data: fileData, error: downloadError } = await supabase.storage
    .from(bucket)
    .download(fromPath);
  
  if (downloadError) throw downloadError;
  
  // Upload to destination
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(toPath, fileData);
  
  if (uploadError) throw uploadError;
  
  // Delete original
  await deleteFile(bucket, fromPath);
};
```

### File Management Business Logic

#### Teacher Document Management
- **Upload Process**: Teachers upload documents during application
- **File Organization**: Documents stored in `teacher-documents/{teacher_id}/` folder
- **Access Control**: Teachers can only access their own documents
- **Admin Access**: Admins can view all teacher documents for review

#### Student Document Management  
- **Admin Upload Process**: Admins upload required documents during student registration
- **File Organization**: Documents stored in `student-documents/{student_id}/` folder
- **Access Control**: Admin-only access to student documents
- **No Student Access**: Students cannot access documents directly

#### Signature Management
- **Digital Signatures**: Captured as base64 images and stored in `signatures/` bucket
- **File Format**: PNG format for signature images
- **Access Control**: Users can only access their own signatures
- **Contract Integration**: Signatures linked to specific contracts

#### Contract Document Management
- **Contract Generation**: Contracts generated and stored in `contracts/` bucket
- **File Organization**: Contracts stored by contract ID
- **Access Control**: Contract parties and admins can access
- **Version Control**: Multiple versions of contracts maintained

#### Profile Image Management
- **Public Access**: Profile images are publicly accessible
- **File Optimization**: Images automatically optimized for web display
- **Fallback Images**: Default profile images for users without uploaded images
- **CDN Integration**: Images served through Supabase CDN for performance

---

## Financial System

### Receivables Management
**File**: `receivables.php`

#### Student Invoicing
```typescript
interface StudentInvoice {
  studentId: string;
  contractId: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  items: InvoiceItem[];
}

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  lessonDate: string;
}
```

#### Invoice Generation Process
1. **Monthly Generation**: Automatic monthly invoice creation
2. **Lesson Tracking**: Calculate lessons completed
3. **Rate Application**: Apply contract rates
4. **Payment Tracking**: Track payments received
5. **Overdue Management**: Handle overdue invoices

### Payables Management
**File**: `payables.php`

#### Teacher Invoicing
```typescript
interface TeacherInvoice {
  teacherId: string;
  engagementId: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  items: TeacherInvoiceItem[];
}

interface TeacherInvoiceItem {
  description: string;
  studentName: string;
  lessonDate: string;
  duration: number;
  rate: number;
  amount: number;
}
```

#### Teacher Payment Process
1. **Lesson Tracking**: Track completed lessons
2. **Rate Calculation**: Calculate teacher earnings
3. **Invoice Generation**: Create teacher invoices
4. **Payment Processing**: Process teacher payments
5. **Tax Reporting**: Generate tax reports

### Financial Reporting

#### Key Metrics
- **Monthly Revenue**: Total student payments
- **Monthly Expenses**: Total teacher payments
- **Profit Margin**: Revenue minus expenses
- **Outstanding Receivables**: Unpaid student invoices
- **Outstanding Payables**: Unpaid teacher invoices

#### Financial Dashboard
```typescript
interface FinancialDashboard {
  currentMonth: {
    revenue: number;
    expenses: number;
    profit: number;
    receivables: number;
    payables: number;
  };
  previousMonth: {
    revenue: number;
    expenses: number;
    profit: number;
  };
  trends: {
    revenueGrowth: number;
    expenseGrowth: number;
    profitGrowth: number;
  };
}
```

---

## Admin Workflows

### Dashboard Overview
**File**: `dashboard.php`

#### Key Metrics
- **Total Students**: Active student count
- **Total Teachers**: Active teacher count
- **Monthly Revenue**: Current month revenue
- **Pending Applications**: New teacher applications
- **Active Contracts**: Active student contracts
- **System Health**: Overall system status

#### Quick Actions
- **New Student**: Add new student
- **New Teacher**: Add new teacher
- **Generate Invoices**: Create monthly invoices
- **View Reports**: Access financial reports
- **System Settings**: Configure system parameters

### User Management

#### Teacher Management
- **Application Review**: Review teacher applications
- **Status Updates**: Change teacher status
- **Rate Management**: Set teacher rates
- **Performance Tracking**: Monitor teacher performance
- **Communication**: Send messages to teachers

#### Student Management
- **Admin-Only Registration**: Register students (no self-registration)
- **Status Updates**: Change student status
- **Contract Management**: Manage student contracts
- **Payment Tracking**: Monitor payment status
- **Communication**: Send messages to students via email
- **NO STUDENT LOGIN**: Students cannot log into the system

### System Configuration

#### Company Settings
```typescript
interface CompanySettings {
  name: string;
  email: string;
  adminEmail: string;
  fromEmail: string;
  address: string;
  phone: string;
  website: string;
  customFields: {
    field1: string;
    field2: string;
    field3: string;
    field4: string;
    field5: string;
    field6: string;
    field7: string;
    field8: string;
  };
}
```

#### Email Templates
- **Welcome Email**: New user welcome
- **Password Reset**: Password reset instructions
- **Contract Signing**: Contract signing notification
- **Invoice**: Invoice notifications
- **Payment Confirmation**: Payment confirmations

---

## Database Schema

### Core Tables

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id INTEGER NOT NULL REFERENCES roles(id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  is_form_filled BOOLEAN DEFAULT FALSE,
  first_time_login BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  status VARCHAR(50) DEFAULT 'Active',
  otp VARCHAR(6),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Teachers Table
```sql
CREATE TABLE teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  gender VARCHAR(10) NOT NULL,
  date_of_birth DATE NOT NULL,
  phone VARCHAR(20),
  street VARCHAR(255),
  city VARCHAR(100),
  zip VARCHAR(20),
  country VARCHAR(100) DEFAULT 'Germany',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  education TEXT,
  transport_mode VARCHAR(50),
  learning_mode VARCHAR(50),
  is_available BOOLEAN DEFAULT TRUE,
  short_bio TEXT,
  self_description TEXT,
  source TEXT,
  status VARCHAR(50) DEFAULT 'New',
  per_lesson_rate DECIMAL(10, 2),
  signature_path TEXT, -- Path to signature file in Supabase Storage
  profile_image_path TEXT, -- Path to profile image in Supabase Storage
  subjects TEXT, -- Comma-separated subject IDs
  evaluation TEXT,
  onboard_date TIMESTAMP,
  onboard_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Students Table
```sql
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  salutation VARCHAR(20),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  student_first_name VARCHAR(255),
  student_last_name VARCHAR(255),
  gender VARCHAR(10) NOT NULL,
  date_of_birth DATE NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  mobile VARCHAR(20),
  city VARCHAR(100),
  zip VARCHAR(20),
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  level VARCHAR(100),
  school VARCHAR(255),
  learning_mode VARCHAR(50),
  reason TEXT,
  lead_source VARCHAR(255),
  notes TEXT,
  payer VARCHAR(255),
  contract_type VARCHAR(100),
  working_hours VARCHAR(100),
  lesson_duration VARCHAR(100),
  price DECIMAL(10, 2),
  registration_fee DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'Leads',
  needs_contract BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Contracts Table
```sql
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id),
  contract_type VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  payment_mode VARCHAR(100),
  lesson_package INTEGER,
  lesson_duration INTEGER,
  minimum_lessons INTEGER,
  registration_fee DECIMAL(10, 2),
  student_per_lesson_rate DECIMAL(10, 2),
  contract_file TEXT,
  bypass_signature BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'Pending Signature',
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Teacher Engagements Table
```sql
CREATE TABLE teacher_engagements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_subject_id UUID NOT NULL REFERENCES student_subjects(id),
  contract_id UUID NOT NULL REFERENCES contracts(id),
  teacher_id UUID NOT NULL REFERENCES teachers(id),
  teacher_per_lesson_rate DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'Active',
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Supporting Tables

#### Subjects Table
```sql
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Levels Table
```sql
CREATE TABLE levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Teacher Subject Expertise Table
```sql
CREATE TABLE teacher_subject_expertise (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES teachers(id),
  subject_id UUID NOT NULL REFERENCES subjects(id),
  level_id UUID NOT NULL REFERENCES levels(id),
  experience INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Student Subjects Table
```sql
CREATE TABLE student_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id),
  subject_id UUID NOT NULL REFERENCES subjects(id),
  contract_id UUID REFERENCES contracts(id),
  engagement_id UUID REFERENCES teacher_engagements(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Financial Tables

#### Student Invoices Table
```sql
CREATE TABLE student_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id),
  contract_id UUID NOT NULL REFERENCES contracts(id),
  invoice_number VARCHAR(100) NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  paid_amount DECIMAL(10, 2) DEFAULT 0,
  outstanding_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Teacher Invoices Table
```sql
CREATE TABLE teacher_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES teachers(id),
  engagement_id UUID NOT NULL REFERENCES teacher_engagements(id),
  invoice_number VARCHAR(100) NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  paid_amount DECIMAL(10, 2) DEFAULT 0,
  outstanding_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Activity Logging Tables

#### Activity Types Table
```sql
CREATE TABLE activity_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Teacher Activities Table
```sql
CREATE TABLE teacher_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES teachers(id),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Student Activities Table
```sql
CREATE TABLE student_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Technical Architecture

### Frontend Architecture

#### Component Structure
```
src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── TeacherSignupForm.tsx  // Only teacher signup
│   │   └── PasswordReset.tsx
│   │   // Note: No admin signup - admins created manually
│   ├── dashboard/
│   │   ├── AdminDashboard.tsx
│   │   └── TeacherDashboard.tsx
│   │   // Note: No StudentDashboard - students have no login access
│   ├── teachers/
│   │   ├── TeacherList.tsx
│   │   ├── TeacherProfile.tsx
│   │   ├── TeacherForm.tsx
│   │   └── TeacherApproval.tsx
│   ├── students/
│   │   ├── StudentList.tsx        // Admin-only
│   │   ├── StudentProfile.tsx     // Admin-only
│   │   ├── StudentForm.tsx        // Admin-only
│   │   └── StudentStatus.tsx      // Admin-only
│   ├── matching/
│   │   ├── MatchingInterface.tsx
│   │   ├── TeacherCard.tsx
│   │   └── MatchingResults.tsx
│   ├── contracts/
│   │   ├── ContractList.tsx
│   │   ├── ContractForm.tsx
│   │   ├── ContractSigning.tsx
│   │   └── EngagementForm.tsx
│   ├── financials/
│   │   ├── ReceivablesList.tsx
│   │   ├── PayablesList.tsx
│   │   ├── InvoiceForm.tsx
│   │   └── FinancialDashboard.tsx
│   └── common/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       ├── Layout.tsx
│       └── LoadingSpinner.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useTeachers.ts
│   ├── useStudents.ts
│   ├── useContracts.ts
│   └── useFinancials.ts
├── services/
│   ├── api.ts
│   ├── auth.ts
│   ├── teachers.ts
│   ├── students.ts
│   ├── contracts.ts
│   └── financials.ts
├── stores/
│   ├── authStore.ts
│   ├── teacherStore.ts
│   ├── studentStore.ts
│   └── contractStore.ts
├── types/
│   ├── auth.ts
│   ├── teacher.ts
│   ├── student.ts
│   ├── contract.ts
│   └── financial.ts
└── utils/
    ├── validation.ts
    ├── formatting.ts
    ├── calculations.ts
    └── constants.ts
```

#### State Management with Zustand
```typescript
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

interface TeacherStore {
  teachers: Teacher[];
  selectedTeacher: Teacher | null;
  isLoading: boolean;
  fetchTeachers: () => Promise<void>;
  fetchTeacher: (id: string) => Promise<void>;
  updateTeacherStatus: (id: string, status: string) => Promise<void>;
  createTeacher: (data: CreateTeacherRequest) => Promise<void>;
}
```

### Backend Architecture (Supabase)

#### Authentication
- **Supabase Auth**: Built-in authentication system
- **Row Level Security**: Database-level access control
- **JWT Tokens**: Secure token-based authentication
- **Role-based Access**: Different permissions per role

#### File Storage (Supabase Storage)
- **Bucket Management**: Organized file storage with buckets
- **Access Control**: Row-level security for file access
- **File Upload**: Direct client-side uploads with progress tracking
- **File Retrieval**: Secure file access with signed URLs
- **File Management**: Automatic cleanup and organization

**Storage Buckets Structure:**
```typescript
// Supabase Storage Buckets
const storageBuckets = {
  'teacher-documents': {
    description: 'Teacher application documents',
    access: 'private',
    policies: ['Teachers can upload own documents', 'Admins can view all']
  },
  'student-documents': {
    description: 'Student registration documents', 
    access: 'private',
    policies: ['Students can upload own documents', 'Admins can view all']
  },
  'signatures': {
    description: 'Digital signatures',
    access: 'private', 
    policies: ['Users can upload own signatures', 'Admins can view all']
  },
  'contracts': {
    description: 'Contract documents',
    access: 'private',
    policies: ['Contract parties can access', 'Admins can view all']
  },
  'profile-images': {
    description: 'User profile images',
    access: 'public',
    policies: ['Users can upload own images', 'Public read access']
  }
};
```

**File Upload Implementation:**
```typescript
// File upload with Supabase Storage
const uploadFile = async (file: File, bucket: string, path: string) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });
  
  if (error) throw error;
  return data;
};

// Get signed URL for file access
const getFileUrl = async (bucket: string, path: string) => {
  const { data } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 3600); // 1 hour expiry
  
  return data.signedUrl;
};
```

#### Database Functions
```sql
-- Teacher approval function
CREATE OR REPLACE FUNCTION approve_teacher(
  teacher_id UUID,
  per_lesson_rate DECIMAL(10, 2),
  approved_by UUID
) RETURNS VOID AS $$
BEGIN
  UPDATE teachers 
  SET status = 'Pending For Signature',
      per_lesson_rate = per_lesson_rate,
      onboard_date = NOW(),
      onboard_by = approved_by
  WHERE id = teacher_id;
  
  UPDATE users 
  SET status = 'Active',
      is_verified = TRUE
  WHERE id = (SELECT user_id FROM teachers WHERE id = teacher_id);
END;
$$ LANGUAGE plpgsql;
```

#### Real-time Subscriptions
```typescript
// Real-time teacher status updates
const { data, error } = await supabase
  .from('teachers')
  .select('*')
  .eq('status', 'New')
  .on('INSERT', (payload) => {
    // Notify admin of new teacher application
    notifyAdmin(payload.new);
  })
  .subscribe();
```

### Security Implementation

#### Row Level Security Policies
```sql
-- Teachers can only see their own data
CREATE POLICY "Teachers can view own data" ON teachers
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can see all data
CREATE POLICY "Admins can view all data" ON teachers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role_id = 1
    )
  );
```

#### Supabase Storage Policies
```sql
-- Teacher documents bucket policies
CREATE POLICY "Teachers can upload own documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'teacher-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Teachers can view own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'teacher-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admins can view all teacher documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'teacher-documents' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role_id = 1
    )
  );

-- Student documents bucket policies
CREATE POLICY "Students can upload own documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'student-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Students can view own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'student-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Signatures bucket policies
CREATE POLICY "Users can upload own signatures" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'signatures' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own signatures" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'signatures' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Profile images bucket policies (public read)
CREATE POLICY "Users can upload own profile images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Public can view profile images" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-images');
```

#### Data Validation
```typescript
// Input validation schemas
const teacherSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[\d\s-()]+$/),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  gender: z.enum(['Male', 'Female']),
  subjects: z.array(z.string().uuid()).min(1),
  // ... other fields
});
```

---

## Migration Strategy

### Phase 1: Data Migration
1. **Database Setup**: Create Supabase project
2. **Schema Migration**: Run SQL schema creation
3. **Data Migration**: Migrate existing data
4. **Validation**: Verify data integrity
5. **Testing**: Test migrated data

### Phase 2: Authentication Migration
1. **User Migration**: Migrate user accounts
2. **Password Reset**: Force password reset
3. **Role Assignment**: Assign proper roles
4. **Session Migration**: Handle active sessions
5. **Testing**: Test authentication flow

### Phase 3: Core Features Migration
1. **Teacher Management**: Migrate teacher features
2. **Student Management**: Migrate student features
3. **Matching System**: Migrate matching logic
4. **Contract Management**: Migrate contract features
5. **Financial System**: Migrate financial features

### Phase 4: Frontend Migration
1. **Component Development**: Build React components
2. **State Management**: Implement Zustand stores
3. **API Integration**: Connect to Supabase
4. **UI/UX**: Implement Tailwind CSS
5. **Testing**: Comprehensive testing

### Phase 5: Deployment & Go-Live
1. **Production Setup**: Configure production environment
2. **Domain Configuration**: Set up custom domain
3. **SSL Certificate**: Configure HTTPS
4. **Monitoring**: Set up monitoring and logging
5. **Go-Live**: Deploy to production

---

## Business Logic Summary

### Key Business Rules

#### Teacher Approval Process
1. **Application Review**: Admin reviews teacher application
2. **Status Progression**: New → Screening → Interview → Offer → Pending For Signature → Hired
3. **Rate Setting**: Admin sets per-lesson rate
4. **Contract Generation**: Generate teacher contract
5. **Credential Provision**: Provide login credentials

#### Student Status Management
1. **Lead Generation**: Initial student contact (Admin-managed)
2. **Consultation**: Schedule and conduct consultation (Admin-managed)
3. **Matching**: Match with suitable teachers (Admin-managed)
4. **Contract Creation**: Create student contract (Admin-managed)
5. **Service Delivery**: Provide tutoring services (Admin/Teacher-managed)
6. **NO STUDENT LOGIN**: Students cannot access the system directly

#### Financial Management
1. **Student Billing**: Generate monthly student invoices
2. **Teacher Payment**: Calculate and pay teacher earnings
3. **Payment Tracking**: Track payment status
4. **Financial Reporting**: Generate financial reports

#### Matching Algorithm
1. **Subject Matching**: Match teacher expertise with student needs
2. **Level Compatibility**: Ensure appropriate skill level
3. **Geographic Proximity**: Consider distance for in-person tutoring
4. **Availability**: Check teacher availability
5. **Workload Balance**: Distribute students evenly

### Critical Success Factors

#### Data Integrity
- **Referential Integrity**: Maintain foreign key relationships
- **Data Validation**: Validate all input data
- **Audit Trail**: Track all data changes
- **Backup Strategy**: Regular data backups

#### Performance
- **Database Indexing**: Optimize database queries
- **Caching Strategy**: Implement appropriate caching
- **API Optimization**: Optimize API response times
- **Frontend Performance**: Optimize React components

#### Security
- **Authentication**: Secure user authentication
- **Authorization**: Role-based access control
- **Data Encryption**: Encrypt sensitive data
- **API Security**: Secure API endpoints

#### User Experience
- **Intuitive Interface**: User-friendly design
- **Responsive Design**: Mobile-friendly interface
- **Fast Loading**: Optimized performance
- **Error Handling**: Graceful error handling

---

## Complete System Workflows

### Admin Workflow Summary

#### **Admin Daily Operations**
1. **Login to System**
   - Access admin dashboard (Admin accounts created manually)
   - View system overview and metrics
   - Check pending applications and tasks

2. **Teacher Management**
   - Review new teacher applications
   - Screen applications and documents
   - Schedule interviews with promising candidates
   - Approve/reject applications
   - Set teacher rates and terms
   - Generate teacher contracts
   - Send login credentials to approved teachers

3. **Student Management**
   - Register new students (no self-registration)
   - Collect student information and documents
   - Set student status and requirements
   - Match students with suitable teachers
   - Create student contracts
   - Send contract signing links via email
   - Monitor student progress and payments

4. **Matching Process**
   - Use matching algorithm to find suitable teachers
   - Consider subject expertise, location, availability
   - Create teacher-student engagements
   - Notify teachers of new assignments

5. **Financial Management**
   - Generate monthly student invoices
   - Process teacher payments
   - Track receivables and payables
   - Generate financial reports
   - Monitor payment status

6. **System Administration**
   - Manage user accounts and permissions
   - Configure system settings
   - Monitor system health
   - Generate reports and analytics

#### **Admin Key Responsibilities**
- **Teacher Onboarding**: Complete teacher approval process
- **Student Lifecycle**: Manage entire student journey
- **Financial Oversight**: Monitor all financial transactions
- **System Management**: Maintain system operations
- **Communication**: Coordinate between teachers and students

---

### Teacher Workflow Summary

#### **Teacher Signup Process (New Teacher)**
1. **Initial Application**
   - Visit teacher signup page
   - Fill out comprehensive application form
   - Provide personal information (name, email, phone, address)
   - Upload required documents (certificates, ID, etc.)
   - Select subject expertise and levels
   - Write self-description and teaching philosophy
   - Submit application

2. **Application Review Period**
   - Wait for admin review (status: "New")
   - Admin screens application and documents
   - Admin may request additional information
   - Status changes to "Screening" → "Interview"

3. **Interview Process**
   - Admin schedules interview
   - Attend interview (in-person or online)
   - Discuss teaching experience and availability
   - Status changes to "Interview" → "Offer"

4. **Approval and Contract**
   - Admin extends job offer
   - Admin sets per-lesson rate
   - Status changes to "Pending For Signature"
   - Receive contract via email
   - Sign contract digitally
   - Status changes to "Hired"

5. **Login Credentials Delivery**
   - Admin approves teacher application
   - System generates secure password
   - SendGrid sends login credentials via email
   - Teacher receives username and password
   - Account becomes active

6. **Account Activation**
   - Teacher logs in with provided credentials
   - First-time login to teacher portal
   - Complete profile setup
   - Access teacher dashboard

#### **Active Teacher Daily Operations**
1. **Login to Teacher Portal**
   - Access teacher dashboard
   - View assigned students
   - Check schedule and upcoming lessons

2. **Student Management**
   - View student profiles and requirements
   - Access student progress information
   - Communicate with students (via admin coordination)
   - Update student progress notes

3. **Time Logging**
   - Record lesson hours for each student
   - Log lesson details and progress
   - Submit time logs for billing
   - Track teaching hours and earnings

4. **Progress Reporting**
   - Write progress notes for students
   - Update student performance
   - Report any issues or concerns
   - Maintain teaching records

5. **Profile Management**
   - Update personal information
   - Manage availability schedule
   - Update subject expertise
   - Upload additional documents

6. **Financial Tracking**
   - View earnings and payment history
   - Track invoice status
   - Monitor payment schedules
   - Access financial reports

#### **Teacher Key Responsibilities**
- **Lesson Delivery**: Provide quality tutoring services
- **Progress Tracking**: Monitor and report student progress
- **Time Management**: Log all teaching hours accurately
- **Communication**: Coordinate with admin and students
- **Professional Development**: Maintain teaching standards

---

### Student Workflow Summary (Admin-Managed)

#### **Student Registration Process**
1. **Admin Registration**
   - Admin collects student information
   - Admin uploads required documents
   - Admin sets student status to "Leads"
   - Admin schedules initial consultation

2. **Consultation Phase**
   - Admin conducts student consultation
   - Admin assesses student needs and requirements
   - Admin determines suitable subjects and levels
   - Status changes to "Appointment Call" → "Mediation Open"

3. **Matching Process**
   - Admin uses matching algorithm
   - Admin finds suitable teachers
   - Admin creates teacher-student engagements
   - Status changes to "Partially Mediated" → "Mediated"

4. **Contract Creation**
   - Admin creates student contract
   - Admin sends contract via email
   - Student receives email with signing link
   - Student signs contract (no login required)
   - Status changes to "Contracted Customers"

5. **Service Delivery**
   - Admin coordinates lesson scheduling
   - Teacher provides tutoring services
   - Admin monitors progress and payments
   - Admin manages student lifecycle

#### **Student Interaction Points**
- **Contract Signing**: Via email link (no login required)
- **Communication**: Through admin coordination
- **Progress Updates**: Via admin and teacher reports
- **Payment**: Through admin-managed billing

---

### System Integration Flows

#### **Teacher-Student Matching Flow**
1. **Admin initiates matching**
2. **System filters teachers by subject and level**
3. **System calculates distances using Google Maps**
4. **System considers teacher availability and workload**
5. **Admin reviews and selects best matches**
6. **System creates teacher-student engagements**
7. **System notifies teachers of new assignments**

#### **Contract Management Flow**
1. **Admin creates student contract**
2. **System generates contract document**
3. **System sends contract via email to student**
4. **Student accesses contract via email link**
5. **Student signs contract digitally**
6. **System updates contract status**
7. **System notifies admin of signed contract**

#### **Financial Processing Flow**
1. **System tracks lesson hours and rates**
2. **System generates monthly invoices**
3. **System processes student payments**
4. **System calculates teacher earnings**
5. **System generates teacher invoices**
6. **System processes teacher payments**
7. **System updates financial records**

---

## Conclusion

This comprehensive PRD provides detailed requirements for migrating the CleverCoach tutoring platform to a modern React TypeScript/Supabase architecture. The document covers every aspect of the existing system, ensuring complete business logic preservation and feature parity.

The migration will result in:
- **Modern Technology Stack**: React, TypeScript, Supabase, Tailwind CSS
- **Improved Performance**: Better database performance and frontend optimization
- **Enhanced Security**: Row-level security and modern authentication
- **Better User Experience**: Responsive design and intuitive interface
- **Scalability**: Cloud-based infrastructure for future growth
- **Maintainability**: Clean code architecture and modern development practices

The detailed business logic documentation ensures that all existing functionality will be preserved while gaining the benefits of modern web technologies.