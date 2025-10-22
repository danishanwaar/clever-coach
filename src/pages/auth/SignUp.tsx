import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubjects } from '@/hooks/useSubjects';
import { useLevels } from '@/hooks/useLevels';
import { useEducational } from '@/hooks/useEducational';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, ArrowRight, Check, GraduationCap, User, FileText, CheckCircle, BookOpen, Users, Sparkles, Shield, Zap, Star, Target, Award, AlertCircle, X } from 'lucide-react';
import { validateStep, ValidationError } from '@/lib/validation';

// Subject icons mapping - updated for German subjects
const subjectIcons: Record<string, string> = {
  'Deutsch': '🇩🇪',
  'Englisch': '🇬🇧',
  'Französisch': '🇫🇷',
  'Spanisch': '🇪🇸',
  'Latein': '🏛️',
  'Mathematik': '🔢',
  'Physik': '⚛️',
  'Chemie': '🧪',
  'Biologie': '🧬',
  'Informatik': '💻',
  'Geschichte': '📚',
  'Geografie': '🌍',
  'Philosophie': '🧠',
  'Psychologie': '🧠',
  'BWL': '💼',
  'Wirtschaft': '📊',
  'Recht': '⚖️',
  'Kunst': '🎨',
  'Musik': '🎵',
  'Andere': '...'
};

export default function SignUp() {
  const [currentStep, setCurrentStep] = useState(1);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isFocused, setIsFocused] = useState({});
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: Subjects
    selectedSubjects: [] as Array<{ id: string; name: string; class: string }>,
    
    // Step 2: Educational background
    education: '',
    
    // Step 3: Personal information
    firstName: '',
    lastName: '',
    email: '',
    gender: '',
    birthDate: '',
    phone: '',
    street: '',
    postalCode: '',
    city: '',
    transport: 'public',
    photo: null as File | null,
    description: '',
    howFound: '',
    
    // Step 4: Terms
    authorizationMinors: false,
    termsAccepted: false,
    whatsappConsent: false,
  });

  const { signUpTeacher, loading } = useAuth();
  const navigate = useNavigate();
  const { data: subjects, isLoading: subjectsLoading } = useSubjects();
  const { data: levels, isLoading: levelsLoading } = useLevels();
  const { data: educational, isLoading: educationalLoading } = useEducational();

  // Mouse tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const updateFormData = (field: string, value: any) => {
    // Note: We keep values as-is to allow Select components to properly match and display selected values
    // The Select component already shows the correct display text from SelectItem children
    
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation errors for this field when user makes changes
    if (validationErrors.length > 0) {
      const filteredErrors = validationErrors.filter(error => error.field !== field);
      if (filteredErrors.length !== validationErrors.length) {
        setValidationErrors(filteredErrors);
      }
    }
  };

  // Group subjects by category
  const groupedSubjects = subjects?.reduce((acc, subject) => {
    const category = subject.category || 'Miscellaneous';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(subject);
    return acc;
  }, {} as Record<string, typeof subjects>) || {};

  // Get hot subjects for pre-selection
  const hotSubjects = subjects?.filter(subject => subject.isHot) || [];
  
  // Get non-hot subjects for regular categories
  const nonHotSubjects = subjects?.filter(subject => !subject.isHot) || [];
  const nonHotGrouped = nonHotSubjects.reduce((acc, subject) => {
    const category = subject.category || 'Miscellaneous';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(subject);
    return acc;
  }, {} as Record<string, typeof subjects>);
  
  // Combine categories with Hot Subjects as separate category
  const combinedCategories = {
    'Hot-Subjects': hotSubjects,
    'STEM & Languages': [
      ...(nonHotGrouped['STEM'] || []),
      ...(nonHotGrouped['Languages'] || [])
    ],
    'Humanities & Social Sciences': [
      ...(nonHotGrouped['Humanities'] || []),
      ...(nonHotGrouped['Social Sciences'] || [])
    ],
    'Business & Legal': [
      ...(nonHotGrouped['Business'] || []),
      ...(nonHotGrouped['Legal'] || [])
    ],
    'Arts & Creative': [
      ...(nonHotGrouped['Arts'] || [])
    ],
    'Miscellaneous': [
      ...(nonHotGrouped['Miscellaneous'] || [])
    ]
  };

  // Pre-select hot subjects on component mount
  useEffect(() => {
    if (hotSubjects.length > 0 && formData.selectedSubjects.length === 0) {
      const preSelectedSubjects = hotSubjects.map(subject => ({
        id: subject.fld_id.toString(),
        name: subject.fld_subject,
        class: ''
      }));
      updateFormData('selectedSubjects', preSelectedSubjects);
    }
  }, [hotSubjects, formData.selectedSubjects.length]);

  // Get error message for a specific field
  const getFieldError = (field: string) => {
    return validationErrors.find(error => error.field === field)?.message;
  };

  // Get all validation errors for the current step
  const getStepErrors = () => {
    return validationErrors.filter(error => {
      switch (currentStep) {
        case 1:
          return error.field === 'selectedSubjects';
        case 2:
          return error.field === 'education';
        case 3:
          return ['firstName', 'lastName', 'email', 'gender', 'birthDate', 'phone', 'street', 'postalCode', 'city', 'description', 'howFound'].includes(error.field);
        case 4:
          return ['authorizationMinors', 'termsAccepted'].includes(error.field);
        default:
          return false;
      }
    });
  };

  const nextStep = () => {
    // Validate current step before proceeding
    const validation = validateStep(currentStep, formData);
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }
    
    // Clear validation errors if step is valid
    setValidationErrors([]);
    
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    // Validate the final step before submission
    const validation = validateStep(4, formData);
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    // Create comprehensive teacher account with all form data
    const result = await signUpTeacher(formData);
    
    // Show success modal instead of redirecting
    if (result.success) {
      setShowSuccessModal(true);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    // Reset form to initial state
    setCurrentStep(1);
    setFormData({
      selectedSubjects: [],
      education: '',
      firstName: '',
      lastName: '',
      email: '',
      gender: '',
      birthDate: '',
      phone: '',
      street: '',
      postalCode: '',
      city: '',
      transport: 'public',
      photo: null,
      description: '',
      howFound: '',
      authorizationMinors: false,
      termsAccepted: false,
      whatsappConsent: false,
    });
    setValidationErrors([]);
  };

  const steps = [
    { number: 1, title: 'Subjects', description: 'Subjects', icon: GraduationCap },
    { number: 2, title: 'Educational background', description: 'Educational background', icon: FileText },
    { number: 3, title: 'Self-description / Personal information', description: 'Self-description / Personal information', icon: User },
    { number: 4, title: 'Additional information', description: 'Additional information', icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl transition-all duration-1000 ease-out"
          style={{
            left: mousePosition.x / 20,
            top: mousePosition.y / 20,
          }}
        />
        <div 
          className="absolute w-64 h-64 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-2xl transition-all duration-700 ease-out"
          style={{
            right: mousePosition.x / 30,
            bottom: mousePosition.y / 30,
          }}
        />
      </div>

       {/* Left Sidebar - Enhanced */}
       <div className="hidden lg:flex lg:w-1/3 bg-primary p-8 flex-col relative overflow-hidden">
         {/* Enhanced Background Pattern */}
         <div className="absolute inset-0 bg-primary hero-pattern"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/15 rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/15 rounded-full translate-y-12 -translate-x-12 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-0 w-16 h-16 bg-white/10 rounded-full translate-x-8 animate-pulse" style={{ animationDelay: '2s' }}></div>
        
         {/* Logo at Top */}
         <div className="relative z-10 mb-8 text-center">
           <div className="flex flex-col items-center space-y-3 group">
             <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300 shadow-2xl">
               <div className="relative">
                 <GraduationCap className="w-10 h-10 text-white group-hover:rotate-12 transition-transform duration-300" />
                 <BookOpen className="absolute -bottom-1 -right-1 w-5 h-5 text-white/80 group-hover:scale-110 transition-transform duration-300" />
                 <Users className="absolute -bottom-1 -left-1 w-5 h-5 text-white/80 group-hover:scale-110 transition-transform duration-300" />
               </div>
             </div>
             <div className="text-white">
               <h1 className="text-2xl font-bold tracking-wide group-hover:scale-105 transition-transform duration-300">CLEVERCOACH</h1>
               <p className="text-white/80 text-sm">Teacher Registration</p>
             </div>
           </div>
         </div>
        
        {/* Modern Steps */}
        <div className="relative z-10 flex-1 space-y-4">
          {steps.map((step, index) => (
            <div key={step.number} className="group cursor-pointer" onClick={() => setCurrentStep(step.number)}>
              <div className="flex items-center space-x-4 p-4 rounded-2xl transition-all duration-300 hover:bg-white/10">
                {/* Step Circle */}
                <div className="relative">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                    currentStep === step.number 
                      ? 'bg-white text-primary border-white shadow-xl scale-110' 
                      : currentStep > step.number 
                        ? 'bg-white/20 text-white border-white/30 shadow-lg scale-105'
                        : 'bg-transparent text-white border-white/50 group-hover:border-white/70 group-hover:scale-105'
                  }`}>
                    {currentStep > step.number ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <span className="font-bold text-base">{step.number}</span>
                    )}
                  </div>
                  
                  {/* Progress Line */}
                  {index < steps.length - 1 && (
                    <div className={`absolute top-12 left-1/2 w-0.5 h-8 transform -translate-x-1/2 transition-all duration-500 ${
                      currentStep > step.number 
                        ? 'bg-white' 
                        : 'bg-white/30'
                    }`} />
                  )}
                </div>
                
                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <step.icon className={`w-4 h-4 transition-colors duration-300 ${
                      currentStep === step.number 
                        ? 'text-white' 
                        : currentStep > step.number 
                          ? 'text-white/80' 
                          : 'text-white/60'
                    }`} />
                    <h3 className={`font-semibold transition-all duration-300 ${
                      currentStep === step.number 
                        ? 'text-white text-base' 
                        : currentStep > step.number 
                          ? 'text-white/90 text-sm' 
                          : 'text-white/70 text-sm group-hover:text-white/90'
                    }`}>
                      {step.title}
                    </h3>
                  </div>
                  <p className={`text-xs transition-colors duration-300 ${
                    currentStep === step.number 
                      ? 'text-white/90' 
                      : 'text-white/60 group-hover:text-white/80'
                  }`}>
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modern Progress Bar */}
        <div className="relative z-10 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{currentStep}</span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Step {currentStep} of {steps.length}</p>
                  <p className="text-white/70 text-xs">{steps[currentStep - 1]?.title}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/80 text-xs">{Math.round((currentStep / steps.length) * 100)}% Complete</p>
              </div>
            </div>
            
            <div className="w-full bg-white/20 rounded-full h-2 mb-3">
              <div 
                className="bg-gradient-to-r from-white to-white/80 rounded-full h-2 transition-all duration-500 ease-out"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              />
            </div>
            
            <div className="flex justify-center space-x-1">
              {steps.map((step, index) => (
                <div
                  key={step.number}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    currentStep === step.number
                      ? 'bg-white scale-125'
                      : currentStep > step.number
                      ? 'bg-white/80 scale-110'
                      : 'bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Content */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 lg:p-12 overflow-y-auto relative z-10">
        <div className="max-w-4xl mx-auto">
           {/* Enhanced Mobile Header */}
           <div className="lg:hidden mb-8 text-center">
             <div className="flex flex-col items-center space-y-4 mb-8">
               {/* Enhanced Education Icon */}
                <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center shadow-2xl group">
                  <div className="relative">
                    <GraduationCap className="w-10 h-10 text-primary group-hover:rotate-12 transition-transform duration-300" />
                    <BookOpen className="absolute -bottom-1 -right-1 w-5 h-5 text-primary-light group-hover:scale-110 transition-transform duration-300" />
                    <Users className="absolute -bottom-1 -left-1 w-5 h-5 text-primary-light group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </div>
                <div className="text-gray-700">
                  <h1 className="text-2xl font-bold tracking-wide text-gradient">CLEVERCOACH</h1>
                  <p className="text-primary/80 text-sm">Teacher Registration</p>
                </div>
             </div>
            
            {/* Modern Step Indicator */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100">
              <div className="space-y-4">
                {/* Step Progress */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{currentStep}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Step {currentStep} of {steps.length}</p>
                      <p className="text-xs text-gray-600">{steps[currentStep - 1]?.title}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{Math.round((currentStep / steps.length) * 100)}% Complete</p>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-primary to-primary-light rounded-full h-2 transition-all duration-500 ease-out"
                    style={{ width: `${(currentStep / steps.length) * 100}%` }}
                  />
                </div>
                
                {/* Step Dots */}
                <div className="flex justify-center space-x-2">
                  {steps.map((step, index) => (
                    <div
                      key={step.number}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        currentStep === step.number
                          ? 'bg-primary scale-125'
                          : currentStep > step.number
                          ? 'bg-primary-light scale-110'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Step 1: Subjects - Redesigned for Better UX */}
          {currentStep === 1 && (
            <div className="space-y-8 bg-white/90 backdrop-blur-sm p-6 sm:p-8 lg:p-10 rounded-2xl shadow-2xl border border-gray-100 hover:shadow-3xl transition-all duration-500">
              <div className="text-center space-y-6">
                <div className="flex items-center justify-center space-x-3 mb-6">
                  <Target className="w-10 h-10 text-primary" />
                  <h1 className="text-4xl font-bold text-gradient">Choose Your Subjects</h1>
                </div>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Select all the subjects you can teach. You can choose multiple subjects to expand your teaching opportunities.
                </p>
                
                {/* Progress indicator */}
                <div className="bg-accent rounded-xl p-6 border border-primary/20">
                  <div className="flex items-center justify-center space-x-2 mb-3">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-primary">Quick Tip</span>
                  </div>
                  <p className="text-sm text-primary text-center">
                    <strong>Hot subjects</strong> are pre-selected as they're in high demand. 
                    Feel free to add more subjects to increase your chances of getting matched with students!
                  </p>
                </div>
              </div>

              {/* Subject Selection - Segregated by Category */}
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">Available Subjects</h3>
                  <div className="text-sm text-gray-600">
                    {formData.selectedSubjects.length} selected
                  </div>
                </div>

                {/* Validation Error Display */}
                {getFieldError('selectedSubjects') && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Please fix the following errors:</p>
                      <p className="text-sm text-red-700 mt-1">{getFieldError('selectedSubjects')}</p>
                    </div>
                  </div>
                )}
                
                {subjectsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-2 text-gray-600">Loading subjects...</span>
                  </div>
                ) : (
                  Object.entries(combinedCategories).map(([category, categorySubjects]) => (
                    <div key={category} className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-md font-semibold text-gray-700 capitalize">
                          {category === 'Hot-Subjects' ? '🔥 Hot Subjects' : category}
                        </h4>
                        {category === 'Hot-Subjects' && (
                          <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-medium">
                            High Demand
                          </span>
                        )}
                        <div className="flex-1 h-px bg-gray-200"></div>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                        {categorySubjects.map((subject) => {
                          const isSelected = formData.selectedSubjects.some(s => s.id === subject.fld_id.toString());
                          const selectedSubject = formData.selectedSubjects.find(s => s.id === subject.fld_id.toString());
                          const isHot = subject.isHot;
                          return (
                            <div 
                              key={subject.fld_id} 
                              className={`group relative cursor-pointer transition-all duration-300 ${
                                isSelected 
                                  ? 'transform scale-105' 
                                  : 'hover:scale-102'
                              }`}
                              onClick={() => {
                                if (isSelected) {
                                  updateFormData('selectedSubjects', 
                                    formData.selectedSubjects.filter(s => s.id !== subject.fld_id.toString())
                                  );
                                } else {
                                  updateFormData('selectedSubjects', [
                                    ...formData.selectedSubjects,
                                    { id: subject.fld_id.toString(), name: subject.fld_subject, class: '' }
                                  ]);
                                }
                              }}
                            >
                              <div className={`relative p-3 rounded-lg border-2 transition-all duration-300 ${
                                isSelected ? 'h-40' : 'h-32'
                              } flex flex-col ${
                                isSelected
                                  ? 'border-primary bg-accent shadow-lg'
                                  : 'border-gray-200 bg-white hover:bg-accent/30'
                              }`}>
                                
                                {/* Selection indicator */}
                                <div className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${
                                  isSelected 
                                    ? 'bg-primary text-primary-foreground scale-110' 
                                    : 'bg-gray-200 group-hover:bg-primary/30'
                                }`}>
                                  {isSelected && <Check className="w-3 h-3" />}
                                </div>
                                
                                {/* Subject content */}
                                <div className="text-center space-y-2 flex-1 flex flex-col justify-center">
                                  <div className="text-2xl group-hover:scale-110 transition-transform duration-300">
                                    {subject.emoji || '📚'}
                                  </div>
                                  <div className="space-y-1">
                                    <h4 className={`font-semibold text-sm transition-colors ${
                                      isSelected ? 'text-primary' : 'text-gray-700 group-hover:text-primary'
                                    }`}>
                                      {subject.fld_subject}
                                    </h4>
                                  </div>
                                </div>

                                {/* Level Selection - Integrated */}
                                {isSelected && (
                                  <div className="mt-2 flex-shrink-0">
                                    <Select 
                                      value={selectedSubject?.class || ''} 
                                      onValueChange={(value) => {
                                        updateFormData('selectedSubjects', 
                                          formData.selectedSubjects.map(s => 
                                            s.id === subject.fld_id.toString() ? { ...s, class: value } : s
                                          )
                                        );
                                      }}
                                    >
                                      <SelectTrigger className="h-7 text-xs   rounded-md">
                                        <SelectValue placeholder="Select level" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {levelsLoading ? (
                                          <SelectItem value="loading" disabled>Loading levels...</SelectItem>
                                        ) : (
                                          levels?.map((level) => (
                                            <SelectItem key={level.fld_id} value={level.fld_id.toString()}>
                                              {level.fld_level}
                                            </SelectItem>
                                          ))
                                        )}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-between items-center pt-6">
                <div className="text-sm text-gray-600">
                  {formData.selectedSubjects.length > 0 ? (
                    <span className="text-primary font-medium">
                      Great! You've selected {formData.selectedSubjects.length} subject{formData.selectedSubjects.length > 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span>Please select at least one subject to continue</span>
                  )}
                </div>
                <Button 
                  onClick={nextStep} 
                  disabled={formData.selectedSubjects.length === 0}
                  className="btn-hero px-8 py-4 rounded-xl font-semibold group disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continue <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Educational Background - Enhanced */}
          {currentStep === 2 && (
            <div className="space-y-8 bg-white/90 backdrop-blur-sm p-6 sm:p-8 lg:p-10 rounded-2xl shadow-2xl border border-gray-100 hover:shadow-3xl transition-all duration-500">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <Award className="w-8 h-8 text-primary" />
                  <h1 className="text-4xl font-bold text-gradient">Educational Background</h1>
                </div>
                <p className="text-lg text-muted-foreground">
                  Tell us about your educational qualifications
                </p>
              </div>

              <div className="max-w-2xl mx-auto space-y-8">
                {/* Validation Error Display */}
                {getFieldError('education') && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Please fix the following errors:</p>
                      <p className="text-sm text-red-700 mt-1">{getFieldError('education')}</p>
                    </div>
                  </div>
                )}
                

                <div className="space-y-4">
                  <Label htmlFor="education" className="text-lg font-semibold text-gray-700 flex items-center space-x-2">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    <span>Highest Educational Qualification</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.education} onValueChange={(value) => updateFormData('education', value)}>
                    <SelectTrigger className={`h-14 text-base border-2 rounded-xl transition-all duration-300 ${
                      getFieldError('education') ? 'border-red-300 focus:border-red-500' : 'border-gray-200 '
                    }`}>
                      <SelectValue placeholder="Select your highest qualification..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-2">
                      {educationalLoading ? (
                        <SelectItem value="loading" disabled className="text-base py-3">Loading educational backgrounds...</SelectItem>
                      ) : (
                        educational?.map((edu) => (
                          <SelectItem key={edu.fld_id} value={edu.fld_ename} className="text-base py-3">
                            {edu.fld_ename}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Educational Benefits */}
                <div className="bg-accent rounded-xl p-6 border border-primary/20">
                  <h3 className="font-semibold text-primary mb-3 flex items-center space-x-2">
                    <Star className="w-5 h-5" />
                    <span>Why we need this information</span>
                  </h3>
                  <ul className="space-y-2 text-sm text-primary">
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <span>Helps us match you with appropriate students</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <span>Builds trust with parents and students</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <span>Enables better lesson planning and delivery</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 sm:justify-between pt-6">
                <Button 
                  onClick={prevStep} 
                  variant="outline" 
                  className="px-8 py-4 border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-800 rounded-xl font-semibold transition-all duration-300 hover:scale-105 w-full sm:w-auto group"
                >
                  <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" /> Back
                </Button>
                <Button 
                  onClick={nextStep} 
                  className="btn-hero px-8 py-4 rounded-xl font-semibold group w-full sm:w-auto"
                >
                  Continue <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Personal Information - Enhanced */}
          {currentStep === 3 && (
            <div className="space-y-8 bg-white/90 backdrop-blur-sm p-6 sm:p-8 lg:p-10 rounded-2xl shadow-2xl border border-gray-100 hover:shadow-3xl transition-all duration-500">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <User className="w-8 h-8 text-primary" />
                  <h1 className="text-4xl font-bold text-gradient">Personal Information</h1>
                </div>
                <p className="text-lg text-muted-foreground">
                  Tell us about yourself and your teaching experience
                </p>
              </div>

              <div className="max-w-4xl mx-auto space-y-8">
                {/* Step Validation Errors */}
                {getStepErrors().length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-red-800 mb-2">Please fix the following errors:</p>
                        <ul className="space-y-1">
                          {getStepErrors().map((error, index) => (
                            <li key={index} className="text-sm text-red-700">• {error.message}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Self Description */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold text-gray-800 flex items-center space-x-2">
                    <FileText className="w-6 h-6 text-primary" />
                    <span>Self Description</span>
                  </h2>
                  <div className="space-y-3">
                    <Label className="text-base font-medium text-gray-700">
                      Please describe your current job and explain why you would like to tutor (600 characters). <span className="text-red-500">*</span>
                    </Label>
                    <Textarea 
                      value={formData.description}
                      onChange={(e) => updateFormData('description', e.target.value)}
                      placeholder="Tell us about yourself, your teaching experience, and why you want to become a tutor..."
                      className={`min-h-[120px] text-base border-2 rounded-xl transition-all duration-300 ${
                        getFieldError('description') ? 'border-red-300 focus:border-red-500' : 'border-gray-200 '
                      }`}
                      maxLength={600}
                    />
                    <div className="text-right text-sm text-gray-500">
                      {formData.description.length}/600 characters
                    </div>
                    {getFieldError('description') && (
                      <p className="text-sm text-red-600">{getFieldError('description')}</p>
                    )}
                  </div>
                </div>

                {/* Personal Information Form */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-800 flex items-center space-x-2">
                    <User className="w-6 h-6 text-primary" />
                    <span>Personal Details</span>
                  </h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700">First name <span className="text-red-500">*</span></Label>
                      <Input 
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => updateFormData('firstName', e.target.value)}
                        className={`h-12 border-2 rounded-xl transition-all duration-300 ${
                          getFieldError('firstName') ? 'border-red-300 focus:border-red-500' : 'border-gray-200 '
                        }`}
                        placeholder="Enter your first name"
                      />
                      {getFieldError('firstName') && (
                        <p className="text-sm text-red-600">{getFieldError('firstName')}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700">Last name <span className="text-red-500">*</span></Label>
                      <Input 
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => updateFormData('lastName', e.target.value)}
                        className={`h-12 border-2 rounded-xl transition-all duration-300 ${
                          getFieldError('lastName') ? 'border-red-300 focus:border-red-500' : 'border-gray-200 '
                        }`}
                        placeholder="Enter your last name"
                      />
                      {getFieldError('lastName') && (
                        <p className="text-sm text-red-600">{getFieldError('lastName')}</p>
                      )}
                    </div>
                    <div className="sm:col-span-2 space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email address <span className="text-red-500">*</span></Label>
                      <Input 
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateFormData('email', e.target.value)}
                        className={`h-12 border-2 rounded-xl transition-all duration-300 ${
                          getFieldError('email') ? 'border-red-300 focus:border-red-500' : 'border-gray-200 '
                        }`}
                        placeholder="Enter your email address"
                      />
                      {getFieldError('email') && (
                        <p className="text-sm text-red-600">{getFieldError('email')}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Gender <span className="text-red-500">*</span></Label>
                      <Select value={formData.gender} onValueChange={(value) => updateFormData('gender', value)}>
                        <SelectTrigger className={`h-12 border-2 rounded-xl transition-all duration-300 ${
                          getFieldError('gender') ? 'border-red-300 focus:border-red-500' : 'border-gray-200 '
                        }`}>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-2">
                          <SelectItem value="male" className="text-base py-3">Male</SelectItem>
                          <SelectItem value="female" className="text-base py-3">Female</SelectItem>
                          <SelectItem value="other" className="text-base py-3">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {getFieldError('gender') && (
                        <p className="text-sm text-red-600">{getFieldError('gender')}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birthDate" className="text-sm font-semibold text-gray-700">Birth date <span className="text-red-500">*</span></Label>
                      <Input 
                        id="birthDate"
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => updateFormData('birthDate', e.target.value)}
                        className={`h-12 border-2 rounded-xl transition-all duration-300 ${
                          getFieldError('birthDate') ? 'border-red-300 focus:border-red-500' : 'border-gray-200 '
                        }`}
                      />
                      {getFieldError('birthDate') && (
                        <p className="text-sm text-red-600">{getFieldError('birthDate')}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">Phone number <span className="text-red-500">*</span></Label>
                      <Input 
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => updateFormData('phone', e.target.value)}
                        className={`h-12 border-2 rounded-xl transition-all duration-300 ${
                          getFieldError('phone') ? 'border-red-300 focus:border-red-500' : 'border-gray-200 '
                        }`}
                        placeholder="Enter your phone number"
                      />
                      {getFieldError('phone') && (
                        <p className="text-sm text-red-600">{getFieldError('phone')}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="street" className="text-sm font-semibold text-gray-700">Street address <span className="text-red-500">*</span></Label>
                      <Input 
                        id="street"
                        value={formData.street}
                        onChange={(e) => updateFormData('street', e.target.value)}
                        className={`h-12 border-2 rounded-xl transition-all duration-300 ${
                          getFieldError('street') ? 'border-red-300 focus:border-red-500' : 'border-gray-200 '
                        }`}
                        placeholder="Enter your street address"
                      />
                      {getFieldError('street') && (
                        <p className="text-sm text-red-600">{getFieldError('street')}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode" className="text-sm font-semibold text-gray-700">Postal code <span className="text-red-500">*</span></Label>
                      <Input 
                        id="postalCode"
                        value={formData.postalCode}
                        onChange={(e) => updateFormData('postalCode', e.target.value)}
                        className={`h-12 border-2 rounded-xl transition-all duration-300 ${
                          getFieldError('postalCode') ? 'border-red-300 focus:border-red-500' : 'border-gray-200 '
                        }`}
                        placeholder="Enter postal code"
                      />
                      {getFieldError('postalCode') && (
                        <p className="text-sm text-red-600">{getFieldError('postalCode')}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-sm font-semibold text-gray-700">City <span className="text-red-500">*</span></Label>
                      <Input 
                        id="city"
                        value={formData.city}
                        onChange={(e) => updateFormData('city', e.target.value)}
                        className={`h-12 border-2 rounded-xl transition-all duration-300 ${
                          getFieldError('city') ? 'border-red-300 focus:border-red-500' : 'border-gray-200 '
                        }`}
                        placeholder="Enter your city"
                      />
                      {getFieldError('city') && (
                        <p className="text-sm text-red-600">{getFieldError('city')}</p>
                      )}
                    </div>
                  </div>

                  {/* Transport Method */}
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold text-gray-700">Transportation Method</Label>
                    <RadioGroup 
                      value={formData.transport} 
                      onValueChange={(value) => updateFormData('transport', value)}
                      className="space-y-4"
                    >
                      <div className="flex items-center space-x-4 p-4 border-2 border-gray-200  rounded-xl transition-all duration-300 cursor-pointer group">
                        <RadioGroupItem value="public" id="public" className="text-primary" />
                        <Label htmlFor="public" className="flex items-center space-x-3 cursor-pointer flex-1">
                          <span className="text-2xl group-hover:scale-110 transition-transform duration-300">🚌</span>
                          <span className="font-medium group-hover:text-primary transition-colors">Public Transportation</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-4 p-4 border-2 border-gray-200  rounded-xl transition-all duration-300 cursor-pointer group">
                        <RadioGroupItem value="bicycle" id="bicycle" className="text-primary" />
                        <Label htmlFor="bicycle" className="flex items-center space-x-3 cursor-pointer flex-1">
                          <span className="text-2xl group-hover:scale-110 transition-transform duration-300">🚲</span>
                          <span className="font-medium group-hover:text-primary transition-colors">Bicycle</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-4 p-4 border-2 border-gray-200  rounded-xl transition-all duration-300 cursor-pointer group">
                        <RadioGroupItem value="car" id="car" className="text-primary" />
                        <Label htmlFor="car" className="flex items-center space-x-3 cursor-pointer flex-1">
                          <span className="text-2xl group-hover:scale-110 transition-transform duration-300">🚗</span>
                          <span className="font-medium group-hover:text-primary transition-colors">Car</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                      <Sparkles className="w-6 h-6 text-primary" />
                      <span>Additional Information</span>
                    </h3>
                    
                    {/* Photo Upload - Compact Design */}
                    <div className="bg-gradient-to-br from-accent to-accent/50 rounded-xl p-4 border border-primary/20 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                            <Shield className="w-3 h-3 text-primary" />
                          </div>
                          <div>
                            <Label className="text-sm font-semibold text-primary">Profile Photo</Label>
                            <p className="text-xs text-primary/80">Required</p>
                          </div>
                        </div>
                        
                        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-primary/10">
                          <p className="text-xs text-primary mb-3">
                            Professional photo is important for your application
                          </p>
                          
                          {/* Compact Upload Area */}
                          <div className="relative">
                            <div className="border-2 border-dashed  rounded-lg p-4 text-center hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 group cursor-pointer">
                              <div className="space-y-2">
                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-primary group-hover:text-primary-light transition-colors">
                                    Click to upload
                                  </p>
                                  <p className="text-xs text-primary/70">
                                    PNG, JPG up to 10MB
                                  </p>
                                </div>
                              </div>
                              <Input 
                                type="file" 
                                accept="image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    updateFormData('photo', file);
                                  }
                                }}
                              />
                            </div>
                          </div>
                          
                          {/* Compact Guidelines */}
                          <div className="mt-3">
                            <div className="flex flex-wrap gap-2">
                              <div className="flex items-center space-x-1 px-2 py-1 bg-white/40 rounded text-xs text-primary">
                                <div className="w-1 h-1 bg-primary rounded-full"></div>
                                <span>Good lighting</span>
                              </div>
                              <div className="flex items-center space-x-1 px-2 py-1 bg-white/40 rounded text-xs text-primary">
                                <div className="w-1 h-1 bg-primary rounded-full"></div>
                                <span>Professional</span>
                              </div>
                              <div className="flex items-center space-x-1 px-2 py-1 bg-white/40 rounded text-xs text-primary">
                                <div className="w-1 h-1 bg-primary rounded-full"></div>
                                <span>Clear face</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* File Preview */}
                          {formData.photo && (
                            <div className="mt-3 p-2 bg-success/10 border border-success/20 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <div className="w-5 h-5 bg-success/20 rounded-full flex items-center justify-center">
                                  <Check className="w-3 h-3 text-success" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-xs font-medium text-success">Uploaded!</p>
                                  <p className="text-xs text-success/70 truncate">{formData.photo.name}</p>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => updateFormData('photo', null)}
                                  className="text-success hover:text-success/70 h-6 px-2 text-xs"
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* How did you find us */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold text-gray-700">How did you find out about us? <span className="text-red-500">*</span></Label>
                      <Select value={formData.howFound} onValueChange={(value) => updateFormData('howFound', value)}>
                        <SelectTrigger className={`h-12 border-2 rounded-xl transition-all duration-300 ${
                          getFieldError('howFound') ? 'border-red-300 focus:border-red-500' : 'border-gray-200 '
                        }`}>
                          <SelectValue placeholder="Select how you found us..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-2">
                          <SelectItem value="search" className="text-base py-3">Search Engine</SelectItem>
                          <SelectItem value="social" className="text-base py-3">Social Media</SelectItem>
                          <SelectItem value="friend" className="text-base py-3">Friend/Referral</SelectItem>
                          <SelectItem value="advertisement" className="text-base py-3">Advertisement</SelectItem>
                          <SelectItem value="other" className="text-base py-3">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {getFieldError('howFound') && (
                        <p className="text-sm text-red-600">{getFieldError('howFound')}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 sm:justify-between pt-8">
                  <Button 
                    onClick={prevStep} 
                    variant="outline" 
                    className="px-8 py-4 border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-800 rounded-xl font-semibold transition-all duration-300 hover:scale-105 w-full sm:w-auto group"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" /> Back
                  </Button>
                  <Button 
                    onClick={nextStep} 
                    className="btn-hero px-8 py-4 rounded-xl font-semibold group w-full sm:w-auto"
                  >
                    Continue <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review and Submit - Enhanced */}
          {currentStep === 4 && (
            <div className="space-y-8 bg-white/90 backdrop-blur-sm p-6 sm:p-8 lg:p-10 rounded-2xl shadow-2xl border border-gray-100 hover:shadow-3xl transition-all duration-500">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <CheckCircle className="w-8 h-8 text-primary" />
                  <h1 className="text-4xl font-bold text-gradient">Review & Submit</h1>
                </div>
                <p className="text-lg text-muted-foreground">
                  Please review and accept the terms to complete your registration
                </p>
              </div>

              <div className="max-w-3xl mx-auto space-y-8">
                {/* Step Validation Errors */}
                {getStepErrors().length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-red-800 mb-2">Please fix the following errors:</p>
                        <ul className="space-y-1">
                          {getStepErrors().map((error, index) => (
                            <li key={index} className="text-sm text-red-700">• {error.message}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Terms and Conditions */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-800 flex items-center space-x-2">
                    <Shield className="w-6 h-6 text-primary" />
                    <span>Terms & Conditions</span>
                  </h2>
                  
                  <div className="space-y-6">
                    <div className={`flex items-start space-x-4 p-6 border-2 rounded-xl transition-all duration-300 group ${
                      getFieldError('authorizationMinors') ? 'border-red-300' : 'border-gray-200'
                    }`}>
                      <Checkbox 
                        id="authorization"
                        checked={formData.authorizationMinors}
                        onCheckedChange={(checked) => updateFormData('authorizationMinors', checked)}
                        className="mt-1 text-primary"
                      />
                      <div className="flex-1">
                        <Label htmlFor="authorization" className="text-base leading-relaxed cursor-pointer group-hover:text-primary transition-colors">
                          <strong>Authorization to work with minors:</strong> I am authorized to work with minors and have no relevant criminal record involving minors. <span className="text-red-500">*</span>
                        </Label>
                        <p className="text-sm text-gray-600 mt-2">
                          This is required for all tutors working with students under 18 years of age.
                        </p>
                        {getFieldError('authorizationMinors') && (
                          <p className="text-sm text-red-600 mt-2">{getFieldError('authorizationMinors')}</p>
                        )}
                      </div>
                    </div>

                    <div className={`flex items-start space-x-4 p-6 border-2 rounded-xl transition-all duration-300 group ${
                      getFieldError('termsAccepted') ? 'border-red-300' : 'border-gray-200'
                    }`}>
                      <Checkbox 
                        id="terms"
                        checked={formData.termsAccepted}
                        onCheckedChange={(checked) => updateFormData('termsAccepted', checked)}
                        className="mt-1 text-primary"
                      />
                      <div className="flex-1">
                        <Label htmlFor="terms" className="text-base leading-relaxed cursor-pointer group-hover:text-primary transition-colors">
                          <strong>Terms and Conditions:</strong> I accept the platform's terms and conditions and privacy policy. <span className="text-red-500">*</span>
                        </Label>
                        <p className="text-sm text-gray-600 mt-2">
                          By accepting, you agree to our terms of service and privacy policy.
                        </p>
                        {getFieldError('termsAccepted') && (
                          <p className="text-sm text-red-600 mt-2">{getFieldError('termsAccepted')}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-6 border-2 border-gray-200  rounded-xl transition-all duration-300 group">
                      <Checkbox 
                        id="whatsapp"
                        checked={formData.whatsappConsent}
                        onCheckedChange={(checked) => updateFormData('whatsappConsent', checked)}
                        className="mt-1 text-primary"
                      />
                      <div className="flex-1">
                        <Label htmlFor="whatsapp" className="text-base leading-relaxed cursor-pointer group-hover:text-primary transition-colors">
                          <strong>WhatsApp Communication:</strong> I agree to be contacted via WhatsApp for important updates and notifications.
                        </Label>
                        <p className="text-sm text-gray-600 mt-2">
                          This helps us keep you informed about new opportunities and platform updates.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Success Preview */}
                <div className="bg-accent rounded-xl p-6 border border-primary/20">
                  <h3 className="font-semibold text-primary mb-4 flex items-center space-x-2">
                    <Sparkles className="w-5 h-5" />
                    <span>What happens next?</span>
                  </h3>
                  <ul className="space-y-3 text-sm text-primary">
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <span>Your application will be reviewed by our team</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <span>You'll receive an email confirmation within 24 hours</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <span>Once approved, you can start teaching students</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 sm:justify-between pt-8">
                <Button 
                  onClick={prevStep} 
                  variant="outline" 
                  className="px-8 py-4 border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-800 rounded-xl font-semibold transition-all duration-300 hover:scale-105 w-full sm:w-auto group"
                >
                  <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" /> Back
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={loading || !formData.termsAccepted || !formData.authorizationMinors}
                  className="btn-hero px-8 py-4 rounded-xl font-semibold group w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Processing Application...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>Submit Application</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Mobile Step Indicator */}
          <div className="lg:hidden mt-6 flex justify-center">
            <div className="text-sm text-muted-foreground bg-white px-4 py-2 rounded-full shadow-sm">
              Step {currentStep} of 4
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-in fade-in-0 zoom-in-95 duration-300">
            {/* Close Button */}
            <button
              onClick={handleCloseSuccessModal}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            {/* Success Content */}
            <div className="text-center space-y-6">
              {/* Success Icon */}
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>

              {/* Success Message */}
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-gray-900">
                  Application Submitted Successfully! 🎉
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Thank you, <strong>{formData.firstName}</strong>! Your teacher application has been submitted and is now under review.
                </p>
              </div>

              {/* Next Steps */}
              <div className="bg-blue-50 rounded-xl p-4 text-left">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4" />
                  <span>What happens next?</span>
                </h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
                    <span>You'll receive an email confirmation within 24 hours</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
                    <span>Our team will review your application</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
                    <span>Once approved, you can start teaching students</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={handleCloseSuccessModal}
                  variant="outline"
                  className="flex-1 border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-800 rounded-xl font-semibold transition-all duration-300"
                >
                  Close
                </Button>
                <Button
                  onClick={() => navigate('/auth/signin')}
                  className="flex-1 btn-hero rounded-xl font-semibold transition-all duration-300"
                >
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}