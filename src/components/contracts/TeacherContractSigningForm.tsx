import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SignatureCanvas from 'react-signature-canvas';
import { toast } from 'sonner';

interface TeacherData {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  phone: string;
  street: string;
  zip: string;
  city: string;
  email: string;
  per_lesson_rate: number;
  teacher_subjects: Array<{ subjects: { name: string } }>;
}

interface TeacherContractSigningFormProps {
  teacherId: string;
  teacherData: TeacherData;
  onSubmit: (signatureData: string) => Promise<void>;
}

export const TeacherContractSigningForm = ({
  teacherId,
  teacherData,
  onSubmit
}: TeacherContractSigningFormProps) => {
  const signatureRef = useRef<SignatureCanvas>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearSignature = () => {
    signatureRef.current?.clear();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate signature
    if (signatureRef.current?.isEmpty()) {
      toast.error('Please provide your signature before submitting');
      return;
    }

    setIsSubmitting(true);
    try {
      const signatureData = signatureRef.current?.toDataURL();
      if (signatureData) {
        await onSubmit(signatureData);
      }
    } catch (error) {
      console.error('Error submitting contract:', error);
      toast.error('Failed to submit contract');
    } finally {
      setIsSubmitting(false);
    }
  };

  const subjects = teacherData.teacher_subjects?.map(ts => ts.subjects.name).join(', ') || 'N/A';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pb-6">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 md:space-y-8">
          {/* Modern Hero Header */}
          <div className="relative overflow-hidden bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6 md:gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <div>
                      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Teaching Agreement</h1>
                      <p className="text-base sm:text-lg md:text-xl text-white/90">Freelance Teaching Contract</p>
                    </div>
                  </div>
                  <p className="text-white/80 text-sm sm:text-base md:text-lg max-w-2xl">
                    Welcome to CleverCoach! We're excited to have you join our team of dedicated educators.
                  </p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 min-w-[280px] sm:min-w-[320px]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <div className="font-semibold text-lg">CleverCoach</div>
                  </div>
                  <div className="space-y-2 text-sm text-white/90">
                    <div>Höschenhofweg 31, 47249 Duisburg</div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                      </svg>
                      0203 39652097
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                      </svg>
                      kontakt@clevercoach-nachhilfe.de
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Teacher Information Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white">Teacher Information</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Personal details and contact information</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="group">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">First Name</Label>
                <Input 
                  value={teacherData.first_name} 
                  disabled 
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl h-12 transition-all duration-200 group-hover:bg-gray-100 dark:group-hover:bg-gray-700"
                />
              </div>
              <div className="group">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Last Name</Label>
                <Input 
                  value={teacherData.last_name} 
                  disabled 
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl h-12 transition-all duration-200 group-hover:bg-gray-100 dark:group-hover:bg-gray-700"
                />
              </div>
              <div className="group">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Date of Birth</Label>
                <Input 
                  value={teacherData.date_of_birth || ''} 
                  disabled 
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl h-12 transition-all duration-200 group-hover:bg-gray-100 dark:group-hover:bg-gray-700"
                />
              </div>
              <div className="group">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Phone Number</Label>
                <Input 
                  value={teacherData.phone || ''} 
                  disabled 
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl h-12 transition-all duration-200 group-hover:bg-gray-100 dark:group-hover:bg-gray-700"
                />
              </div>
              <div className="group">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Postal Code</Label>
                <Input 
                  value={teacherData.zip || ''} 
                  disabled 
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl h-12 transition-all duration-200 group-hover:bg-gray-100 dark:group-hover:bg-gray-700"
                />
              </div>
              <div className="group">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">City</Label>
                <Input 
                  value={teacherData.city || ''} 
                  disabled 
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl h-12 transition-all duration-200 group-hover:bg-gray-100 dark:group-hover:bg-gray-700"
                />
              </div>
              <div className="group md:col-span-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Street Address</Label>
                <Input 
                  value={teacherData.street || ''} 
                  disabled 
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl h-12 transition-all duration-200 group-hover:bg-gray-100 dark:group-hover:bg-gray-700"
                />
              </div>
              <div className="group">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Email Address</Label>
                <Input 
                  value={teacherData.email || ''} 
                  disabled 
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl h-12 transition-all duration-200 group-hover:bg-gray-100 dark:group-hover:bg-gray-700"
                />
              </div>
            </div>
            </div>

          {/* Contract Terms */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activity Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-primary font-bold text-lg">1</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Activity & Responsibilities</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Your teaching role and duties</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <h4 className="font-semibold text-green-800 dark:text-green-200">Teaching Subjects</h4>
                  </div>
                  <p className="text-green-700 dark:text-green-300 text-sm">
                    <span className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded-md text-green-800 dark:text-green-200 font-medium">{subjects}</span>
                  </p>
                </div>
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <p>You will be teaching assigned students in these subjects and preparing them for vocational training, school diplomas, or state-recognized examinations.</p>
                  <p>Teaching can take place at students' homes, agreed locations, or online. You determine your own schedule in consultation with students/parents.</p>
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                    <p className="text-amber-800 dark:text-amber-200">
                      <strong>Important:</strong> You commit not to establish direct business relationships with assigned students during the contract period and for one additional school year after termination.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Compensation Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-primary font-bold text-lg">2</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Compensation & Payment</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Your earnings and payment schedule</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-purple-800 dark:text-purple-200">Hourly Rate</h4>
                    <div className="bg-purple-100 dark:bg-purple-900 px-4 py-2 rounded-xl">
                      <span className="text-2xl font-bold text-purple-800 dark:text-purple-200">€{teacherData.per_lesson_rate}</span>
                      <span className="text-purple-600 dark:text-purple-400 text-sm ml-2">/60min</span>
                    </div>
                  </div>
                  <p className="text-purple-700 dark:text-purple-300 text-sm">
                    This is your compensation for 60 minutes of tutoring. Cash payments are not possible.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <h4 className="font-medium text-blue-800 dark:text-blue-200">Time Tracking</h4>
                    </div>
                    <p className="text-blue-700 dark:text-blue-300 text-xs">Record your working hours in the teacher portal for accurate billing</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"/>
                        </svg>
                      </div>
                      <h4 className="font-medium text-green-800 dark:text-green-200">Payment Schedule</h4>
                    </div>
                    <p className="text-green-700 dark:text-green-300 text-xs">Monthly transfers between 15th-18th of following month</p>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <p className="text-blue-800 dark:text-blue-200 text-sm">
                    <strong>Note:</strong> A credit note will be created monthly based on your documented hours in the teacher portal, serving as your binding compensation statement.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Terms */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Termination Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-primary font-bold text-lg">3</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Contract Termination</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Notice period and termination process</p>
                </div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">Notice Period</h4>
                    <p className="text-orange-700 dark:text-orange-300 text-sm">
                      This is an unlimited contract. You can terminate it in writing with at least <strong>one month's notice</strong>. This gives us time to reassign your students.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Other Provisions Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-primary font-bold text-lg">4</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Additional Terms</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Important legal information</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <h4 className="font-medium text-blue-800 dark:text-blue-200">Freelance Status</h4>
                  </div>
                  <p className="text-blue-700 dark:text-blue-300 text-sm">This is a freelance contract, not employment. You're responsible for your own taxes and social security.</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <h4 className="font-medium text-green-800 dark:text-green-200">Confidentiality</h4>
                  </div>
                  <p className="text-green-700 dark:text-green-300 text-sm">You must keep all student and business information confidential during and after the contract.</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
                  <p className="text-purple-800 dark:text-purple-200 text-sm">
                    <strong>Agreement:</strong> By signing, you confirm that all your information is truthful and that you've read and understood this contract. A digital copy will be provided to you.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Signature Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Digital Signature</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sign your contract to complete the agreement</p>
              </div>
            </div>
            
            <div className="space-y-4 sm:space-y-6">
              <div>
                <Label className="mb-2 block font-medium text-gray-700 dark:text-gray-300 text-sm sm:text-base">Your Signature</Label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 overflow-hidden hover:border-primary transition-colors duration-200">
                  <SignatureCanvas
                    ref={signatureRef}
                    canvasProps={{
                      className: 'w-full h-32 sm:h-36 cursor-crosshair bg-white dark:bg-gray-900',
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearSignature}
                  className="mt-2 sm:mt-3"
                >
                  Clear Signature
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="group">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Teacher Name</Label>
                  <Input 
                    value={`${teacherData.first_name} ${teacherData.last_name}`} 
                    disabled 
                    className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl h-12 transition-all duration-200 group-hover:bg-gray-100 dark:group-hover:bg-gray-700"
                  />
                </div>
                <div className="group">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Company</Label>
                  <Input 
                    value="Tav und Uzun GbR" 
                    disabled 
                    className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl h-12 transition-all duration-200 group-hover:bg-gray-100 dark:group-hover:bg-gray-700"
                  />
                </div>
                <div className="group">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Date</Label>
                  <Input 
                    value={new Date().toLocaleDateString('en-GB')} 
                    disabled 
                    className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl h-12 transition-all duration-200 group-hover:bg-gray-100 dark:group-hover:bg-gray-700"
                  />
                </div>
                <div className="group">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Company Signature</Label>
                  <div className="h-12 flex items-center justify-center border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700 transition-all duration-200">
                    <img 
                      src="/c-signature.png" 
                      alt="Company Signature" 
                      className="h-10 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                      }}
                    />
                    <div className="h-10 flex items-center text-sm text-muted-foreground" style={{display: 'none'}}>
                      Digital Signature
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-8">
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="min-w-[300px] h-14 bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary/80 hover:to-primary/70 text-white font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Submitting Contract...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Sign & Submit Contract
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
