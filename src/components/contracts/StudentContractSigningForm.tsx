import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SignatureCanvas from 'react-signature-canvas';
import { toast } from 'sonner';

interface StudentContractData {
  // Parent/Guardian Info
  parent_last_name: string;
  parent_first_name: string;
  address: string;
  zip: string;
  city: string;
  phone: string;
  mobile: string;
  email: string;
  
  // Student Info
  student_last_name: string;
  student_first_name: string;
  school: string;
  level: string;
  
  // Contract Details
  lesson_mode: string; // Onsite or Online
  start_date: string;
  end_date: string;
  contract_duration: number; // months
  min_hours_per_month: number;
  lesson_duration: number; // minutes
  price_per_lesson: number;
  registration_fee: number;
  payment_mode: string; // 'Lastschrift' or 'Rechnung'
  payer_name?: string;
}

interface StudentContractSigningFormProps {
  studentId: string;
  contractData: StudentContractData;
  onSubmit: (data: { signatureData: string; bankInstitute?: string; iban?: string }) => Promise<void>;
}

export const StudentContractSigningForm = ({
  studentId,
  contractData,
  onSubmit
}: StudentContractSigningFormProps) => {
  const signatureRef = useRef<SignatureCanvas>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bankInstitute, setBankInstitute] = useState('');
  const [iban, setIban] = useState('');

  const clearSignature = () => {
    signatureRef.current?.clear();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate signature first
    if (signatureRef.current?.isEmpty()) {
      toast.error('Please provide your signature before submitting');
      return;
    }

    // Validate banking information if payment mode is direct debit
    if (contractData.payment_mode === 'Lastschrift') {
      if (!bankInstitute || bankInstitute.trim().length === 0) {
        toast.error('Please enter your bank institute name');
        return;
      }
      
      if (!iban || iban.length !== 22) {
        toast.error('Please enter a valid IBAN (must be exactly 22 characters)');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const signatureData = signatureRef.current?.toDataURL();
      if (signatureData) {
        await onSubmit({
          signatureData,
          bankInstitute: contractData.payment_mode === 'Lastschrift' ? bankInstitute : undefined,
          iban: contractData.payment_mode === 'Lastschrift' ? iban : undefined
        });
      }
    } catch (error) {
      console.error('Error submitting contract:', error);
      toast.error('Failed to submit contract');
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                      </svg>
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold mb-2 whitespace-nowrap">Tutoring Contract</h1>
                      <p className="text-xl text-white/90">Registration for Private Tutoring</p>
                    </div>
                  </div>
                  <p className="text-white/80 text-lg max-w-2xl">
                    Welcome to CleverCoach! We're excited to support your learning journey with personalized tutoring.
                  </p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 min-w-[320px]">
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

          {/* Parent/Guardian Information Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Parent/Guardian Information</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Contact details and address information</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="group">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Last Name</Label>
                <Input 
                  value={contractData.parent_last_name} 
                  disabled 
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl h-12 transition-all duration-200 group-hover:bg-gray-100 dark:group-hover:bg-gray-700"
                />
              </div>
              <div className="group">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">First Name</Label>
                <Input 
                  value={contractData.parent_first_name} 
                  disabled 
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl h-12 transition-all duration-200 group-hover:bg-gray-100 dark:group-hover:bg-gray-700"
                />
              </div>
              <div className="group">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Email</Label>
                <Input 
                  value={contractData.email} 
                  disabled 
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl h-12 transition-all duration-200 group-hover:bg-gray-100 dark:group-hover:bg-gray-700"
                />
              </div>
              <div className="group md:col-span-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Street Address</Label>
                <Input 
                  value={contractData.address} 
                  disabled 
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl h-12 transition-all duration-200 group-hover:bg-gray-100 dark:group-hover:bg-gray-700"
                />
              </div>
              <div className="group">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Postal Code</Label>
                <Input 
                  value={contractData.zip} 
                  disabled 
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl h-12 transition-all duration-200 group-hover:bg-gray-100 dark:group-hover:bg-gray-700"
                />
              </div>
              <div className="group">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">City</Label>
                <Input 
                  value={contractData.city} 
                  disabled 
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl h-12 transition-all duration-200 group-hover:bg-gray-100 dark:group-hover:bg-gray-700"
                />
              </div>
              <div className="group">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Landline</Label>
                <Input 
                  value={contractData.phone} 
                  disabled 
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl h-12 transition-all duration-200 group-hover:bg-gray-100 dark:group-hover:bg-gray-700"
                />
              </div>
              <div className="group">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Mobile</Label>
                <Input 
                  value={contractData.mobile} 
                  disabled 
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl h-12 transition-all duration-200 group-hover:bg-gray-100 dark:group-hover:bg-gray-700"
                />
              </div>
            </div>
            </div>

          {/* Student Information Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Student Information</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Student details and academic information</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="group">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Student Last Name</Label>
                <Input 
                  value={contractData.student_last_name} 
                  disabled 
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl h-12 transition-all duration-200 group-hover:bg-gray-100 dark:group-hover:bg-gray-700"
                />
              </div>
              <div className="group">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Student First Name</Label>
                <Input 
                  value={contractData.student_first_name} 
                  disabled 
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl h-12 transition-all duration-200 group-hover:bg-gray-100 dark:group-hover:bg-gray-700"
                />
              </div>
              <div className="group">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">School Type</Label>
                <Input 
                  value={contractData.school} 
                  disabled 
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl h-12 transition-all duration-200 group-hover:bg-gray-100 dark:group-hover:bg-gray-700"
                />
              </div>
              <div className="group">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Grade Level</Label>
                <Input 
                  value={contractData.level} 
                  disabled 
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl h-12 transition-all duration-200 group-hover:bg-gray-100 dark:group-hover:bg-gray-700"
                />
              </div>
              <div className="group md:col-span-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Type of Tutoring</Label>
                <Input 
                  value={contractData.lesson_mode === 'Onsite' ? 'In-Person' : contractData.lesson_mode} 
                  disabled 
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl h-12 transition-all duration-200 group-hover:bg-gray-100 dark:group-hover:bg-gray-700"
                />
              </div>
            </div>
            </div>

          {/* Billing Model Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Billing Model</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Contract terms and pricing details</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="group">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Start Date</Label>
                <Input 
                  value={contractData.start_date} 
                  disabled 
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl h-12 transition-all duration-200 group-hover:bg-gray-100 dark:group-hover:bg-gray-700"
                />
              </div>
              <div className="group">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">End Date</Label>
                <Input 
                  value={contractData.end_date} 
                  disabled 
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl h-12 transition-all duration-200 group-hover:bg-gray-100 dark:group-hover:bg-gray-700"
                />
              </div>
              <div className="group">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Contract Duration</Label>
                <Input 
                  value={`${contractData.contract_duration} Month(s)`} 
                  disabled 
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl h-12 transition-all duration-200 group-hover:bg-gray-100 dark:group-hover:bg-gray-700"
                />
              </div>
              <div className="group">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Min Hours/Month</Label>
                <Input 
                  value={contractData.min_hours_per_month.toString()} 
                  disabled 
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl h-12 transition-all duration-200 group-hover:bg-gray-100 dark:group-hover:bg-gray-700"
                />
              </div>
              <div className="group">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Lesson Duration</Label>
                <Input 
                  value={`${contractData.lesson_duration} minutes`} 
                  disabled 
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl h-12 transition-all duration-200 group-hover:bg-gray-100 dark:group-hover:bg-gray-700"
                />
              </div>
              <div className="group">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Price per Lesson</Label>
                <div className="bg-gradient-to-r from-primary/10 to-primary/20 px-4 py-3 rounded-xl border border-primary/20">
                  <span className="font-bold text-primary text-xl">€{contractData.price_per_lesson}</span>
                </div>
              </div>
              <div className="group">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Registration Fee</Label>
                <div className="bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-900 dark:to-amber-800 px-4 py-3 rounded-xl border border-amber-200 dark:border-amber-800">
                  <span className="font-bold text-amber-800 dark:text-amber-200 text-lg">€{contractData.registration_fee}</span>
                  <span className="text-amber-600 dark:text-amber-400 text-sm ml-2">(one-time)</span>
                </div>
              </div>
            </div>
            </div>

          {/* Payment Method Card */}
          {contractData.payment_mode === 'Lastschrift' ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">SEPA Direct Debit</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Automatic payment collection</p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Direct Debit Authorization</h4>
                    <p className="text-blue-700 dark:text-blue-300 text-sm mb-2">
                      I hereby authorize CleverCoach to collect payments from my account via direct debit. I instruct my bank to honor these direct debits.
                    </p>
                    <p className="text-blue-600 dark:text-blue-400 text-xs">
                      <strong>Note:</strong> You can request a refund within 8 weeks of the debit date. Your bank's terms apply.
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 group">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Account Holder</Label>
                  <Input 
                    value={contractData.payer_name || ''} 
                    disabled 
                    className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl h-12 transition-all duration-200 group-hover:bg-gray-100 dark:group-hover:bg-gray-700"
                  />
                </div>
                <div className="group">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Bank Institute *</Label>
                  <Input
                    value={bankInstitute}
                    onChange={(e) => setBankInstitute(e.target.value)}
                    required
                    placeholder="Enter bank name"
                    className="rounded-xl h-12 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="group">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">IBAN (22 characters) *</Label>
                  <Input
                    value={iban}
                    onChange={(e) => setIban(e.target.value.toUpperCase())}
                    required
                    maxLength={22}
                    pattern="[A-Z0-9]{22}"
                    placeholder="DE00000000000000000000"
                    className="font-mono rounded-xl h-12 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Invoice Payment</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Monthly invoice billing</p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Monthly Invoice</h4>
                    <p className="text-green-700 dark:text-green-300 text-sm mb-2">
                      You'll receive invoices monthly via email between the 3rd and 6th of each month.
                    </p>
                    <p className="text-green-700 dark:text-green-300 text-sm">
                      Payment is due within 14 days of invoice receipt.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white/60 dark:bg-white/5 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Bank Transfer Details</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Account Holder:</span>
                    <span className="font-medium text-gray-900 dark:text-white">Tav und Uzun GbR</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Bank:</span>
                    <span className="font-medium text-gray-900 dark:text-white">Commerzbank Duisburg</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">IBAN:</span>
                    <span className="font-mono font-medium text-gray-900 dark:text-white">DE82350400380422117200</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">BIC:</span>
                    <span className="font-mono font-medium text-gray-900 dark:text-white">COBADEFFXXX</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 dark:text-gray-400">Creditor ID:</span>
                    <span className="font-mono font-medium text-gray-900 dark:text-white">DE70ZZZ00002684542</span>
                  </div>
                </div>
              </div>
            </div>
          )}

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
            
            <div className="space-y-6">
              <div>
                <Label className="mb-2 block font-medium text-gray-700 dark:text-gray-300 text-sm sm:text-base">Parent/Guardian Signature</Label>
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
                  className="mt-3"
                >
                  Clear Signature
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Parent/Guardian Name</Label>
                  <Input 
                    value={`${contractData.parent_first_name} ${contractData.parent_last_name}`} 
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
