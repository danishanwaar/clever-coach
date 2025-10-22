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
import StudentMatchMaking from "./pages/students/StudentMatchMaking";
import StudentContracts from "./pages/students/StudentContracts";
import StudentFinancials from "./pages/students/StudentFinancials";
import StudentProgressNotes from "./pages/students/StudentProgressNotes";
import StudentTimeLogs from "./pages/students/StudentTimeLogs";
import StudentActivity from "./pages/students/StudentActivity";
import StudentSettings from "./pages/students/StudentSettings";
import StudentContractDownload from "./pages/students/StudentContractDownload";
import Invoices from "./pages/Invoices";
import Receivables from "./pages/Receivables";
import Payables from "./pages/Payables";
import CreateTeacherInvoice from "./pages/invoices/CreateTeacherInvoice";
import CreateStudentInvoice from "./pages/invoices/CreateStudentInvoice";
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
          }>
            <Route index element={<StudentProfile />} />
            <Route path="profile" element={<StudentProfile />} />
          </Route>
          <Route 
            path="/students/:id/match-making" 
            element={
              <ProtectedRoute>
                <Layout>
                  <StudentMatchMaking />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/students/:id/contracts" 
            element={
              <ProtectedRoute>
                <Layout>
                  <StudentContracts />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/students/:id/financials" 
            element={
              <ProtectedRoute>
                <Layout>
                  <StudentFinancials />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/students/:id/progress-notes" 
            element={
              <ProtectedRoute>
                <Layout>
                  <StudentProgressNotes />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/students/:id/time-logs" 
            element={
              <ProtectedRoute>
                <Layout>
                  <StudentTimeLogs />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/students/:id/activity" 
            element={
              <ProtectedRoute>
                <Layout>
                  <StudentActivity />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/students/:id/settings" 
            element={
              <ProtectedRoute>
                <Layout>
                  <StudentSettings />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/students/:id/contract-download" 
            element={
              <ProtectedRoute>
                <Layout>
                  <StudentContractDownload />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* Teacher Portal Routes */}
          <Route 
            path="/teacher/profile" 
            element={
              <ProtectedRoute requiredRole="teacher">
                <TeacherProfile />
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
          
          {/* Invoice Routes */}
          <Route 
            path="/invoices" 
            element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <Invoices />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/receivables" 
            element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <Receivables />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/payables" 
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
            path="/invoices/create-teacher" 
            element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <CreateTeacherInvoice />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/invoices/create-student" 
            element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <CreateStudentInvoice />
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
