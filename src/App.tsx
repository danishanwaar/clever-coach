import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Teachers from "./pages/Teachers";
import Applicants from "./pages/Applicants";
import Students from "./pages/Students";
import StudentProfile from "./pages/students/StudentProfile";
import Invoices from "./pages/Invoices";
import Receivables from "./pages/Receivables";
import Payables from "./pages/Payables";
import CreateTeacherInvoice from "./pages/invoices/CreateTeacherInvoice";
import CreateStudentInvoice from "./pages/invoices/CreateStudentInvoice";
import InvoiceView from "./pages/invoices/InvoiceView";
import InvoiceEdit from "./pages/invoices/InvoiceEdit";
import DynamicMatcher from "./pages/DynamicMatcher";
import TeacherContractSigning from "./pages/TeacherContractSigning";
import ContractSignedSuccess from "./pages/ContractSignedSuccess";
import StudentContractSigning from "./pages/StudentContractSigning";
import StudentContractSuccess from "./pages/StudentContractSuccess";
import StudentContractView from "./pages/StudentContractView";
import TeacherProfile from "./pages/teacher/TeacherProfile";
import TeacherStudents from "./pages/teacher/TeacherStudents";
import TeacherTimeLogs from "./pages/teacher/TeacherTimeLogs";
import TeacherFinancials from "./pages/teacher/TeacherFinancials";
import TeacherDocuments from "./pages/teacher/TeacherDocuments";
import TeacherActivity from "./pages/teacher/TeacherActivity";
import TeacherProgressNotes from "./pages/teacher/TeacherProgressNotes";
import TeacherSettings from "./pages/teacher/TeacherSettings";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import AdminSignup from "./pages/auth/AdminSignup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          
          {/* Auth Routes - Redirect if already authenticated */}
          <Route 
            path="/auth/signin" 
            element={
              <AuthGuard redirectTo="/dashboard">
                <SignIn />
              </AuthGuard>
            } 
          />
          <Route 
            path="/auth/signup" 
            element={
              <AuthGuard redirectTo="/dashboard">
                <SignUp />
              </AuthGuard>
            } 
          />
          <Route 
            path="/auth/admin-signup" 
            element={
              <AuthGuard redirectTo="/dashboard">
                <AdminSignup />
              </AuthGuard>
            } 
          />
          <Route 
            path="/auth/forgot-password" 
            element={
              <AuthGuard redirectTo="/dashboard">
                <ForgotPassword />
              </AuthGuard>
            } 
          />
          <Route 
            path="/auth/reset-password" 
            element={<ResetPassword />} 
          />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* Profile and Settings - Protected */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* Core Management Pages - Protected */}
          <Route 
            path="/teachers" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Teachers />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/applicants" 
            element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <Applicants />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/students"
            element={
              <ProtectedRoute>
                <Layout>
                  <Students />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* Dynamic Matcher - Protected */}
          <Route 
            path="/dynamic-matcher" 
            element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <DynamicMatcher />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* Public Contract Routes */}
          <Route 
            path="/teacher-contract-signing/:encodedId" 
            element={<TeacherContractSigning />} 
          />
          <Route 
            path="/contract-signed-success" 
            element={<ContractSignedSuccess />} 
          />
          <Route 
            path="/student-contract-signing/:encodedId" 
            element={<StudentContractSigning />} 
          />
          <Route 
            path="/student-contract-success" 
            element={<StudentContractSuccess />} 
          />
          <Route 
            path="/student-contract-view/:encodedId" 
            element={<StudentContractView />} 
          />
          
          {/* Student Detail Routes */}
          <Route path="/students/:id" element={
            <ProtectedRoute>
              <Layout>
                <StudentProfile />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/students/:id/:tab" element={
            <ProtectedRoute>
              <Layout>
                <StudentProfile />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Teacher Portal Routes */}
          <Route 
            path="/teacher/profile" 
            element={
              <ProtectedRoute requiredRole="teacher">
                <Layout>
                  <TeacherProfile />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/teacher/profile/:tab" 
            element={
              <ProtectedRoute requiredRole="teacher">
                <Layout>
                  <TeacherProfile />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/teacher/students" 
            element={
              <ProtectedRoute requiredRole="teacher">
                <TeacherStudents />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/teacher/time-logs" 
            element={
              <ProtectedRoute requiredRole="teacher">
                <TeacherTimeLogs />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/teacher/financials" 
            element={
              <ProtectedRoute requiredRole="teacher">
                <TeacherFinancials />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/teacher/documents" 
            element={
              <ProtectedRoute requiredRole="teacher">
                <TeacherDocuments />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/teacher/activity" 
            element={
              <ProtectedRoute requiredRole="teacher">
                <TeacherActivity />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/teacher/progress-notes" 
            element={
              <ProtectedRoute requiredRole="teacher">
                <TeacherProgressNotes />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/teacher/settings" 
            element={
              <ProtectedRoute requiredRole="teacher">
                <TeacherSettings />
              </ProtectedRoute>
            } 
          />
          
          {/* Financials Routes */}
          <Route 
            path="/financials" 
            element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <Invoices />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/financials/receivables" 
            element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <Receivables />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/financials/payables" 
            element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <Payables />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* Invoice Creation Routes */}
          <Route 
            path="/financials/create-teacher-invoice" 
            element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <CreateTeacherInvoice />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/financials/create-student-invoice" 
            element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <CreateStudentInvoice />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* Invoice Management Routes */}
          <Route 
            path="/invoices/view/:id"
            element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <InvoiceView />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route 
            path="/invoices/edit/:id"
            element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <InvoiceEdit />
                </Layout>
              </ProtectedRoute>
            }
          />
          
  
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
