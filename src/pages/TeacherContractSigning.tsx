import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTeacherContract } from '@/hooks/useTeacherContract';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, CheckCircle, AlertCircle, FileText, User, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import SignaturePad from '@/components/SignaturePad';

const TeacherContractSigning = () => {
  const { encodedId } = useParams<{ encodedId: string }>();
  const navigate = useNavigate();
  const { getTeacherContractData, signContractMutation, verifyContractAccess } = useTeacherContract();

  const [teacherData, setTeacherData] = useState<any>(null);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (!encodedId) {
      setError('Invalid contract link');
      setIsLoading(false);
      return;
    }

    // Prevent multiple calls if already loaded or loading
    if (hasLoadedRef.current || (isLoading && (teacherData || error))) {
      return;
    }

    const verifyAndLoadData = async () => {
      hasLoadedRef.current = true;
      try {
        // Verify contract access
        const teacherId = await verifyContractAccess.mutateAsync(encodedId);
        
        // Load teacher data
        const data = await getTeacherContractData.mutateAsync(teacherId);
        setTeacherData(data);
        setIsVerified(true);
      } catch (err: any) {
        setError(err.message || 'Failed to load contract data');
      } finally {
        setIsLoading(false);
      }
    };

    verifyAndLoadData();
  }, [encodedId]); // Removed mutation dependencies to prevent infinite re-renders

  const handleSignatureChange = (signature: string | null) => {
    setSignatureData(signature);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signatureData) {
      toast.error('Please provide a signature');
      return;
    }

    if (!teacherData) {
      toast.error('Teacher data not available');
      return;
    }

    try {
      await signContractMutation.mutateAsync({
        teacherId: teacherData.fld_id,
        signatureData,
      });
      
      // Redirect to success page
      navigate('/contract-signed-success');
    } catch (error) {
      console.error('Contract signing error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading contract...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Contract Not Available</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  if (!teacherData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Teacher Not Found</h2>
          <p className="text-muted-foreground">The requested teacher could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-primary text-white p-8 rounded-t-xl mb-0 shadow-xl">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-3">
              Freelance Contract
          </h1>
            <div className="w-20 h-1 bg-white/30 rounded-full mb-4"></div>
            <p className="text-white/90 text-base leading-relaxed">
              between CleverCoach-Nachhilfe, represented by Tav und Uzun GbR Höschenhofweg 31 47249 Duisburg and the contractor
          </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-0">
          {/* Contract Information Section */}
          <div className="bg-white border border-gray-200 border-t-0 rounded-b-xl p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Contract Information</h2>
                <p className="text-sm text-gray-600">Personal details and contact information</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700 mb-2 block">First name</Label>
                  <Input
                    id="firstName"
                    value={teacherData.fld_first_name}
                    disabled
                    className="bg-gray-50/50 border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-medium"
                  />
                </div>
                <div>
                  <Label htmlFor="dob" className="text-sm font-semibold text-gray-700 mb-2 block">Birth date</Label>
                  <Input
                    id="dob"
                    value={teacherData.fld_dob}
                    disabled
                    className="bg-gray-50/50 border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-medium"
                  />
                </div>
                <div>
                  <Label htmlFor="zip" className="text-sm font-semibold text-gray-700 mb-2 block">Postal code</Label>
                  <Input
                    id="zip"
                    value={teacherData.fld_zip}
                    disabled
                    className="bg-gray-50/50 border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-medium"
                  />
                </div>
                <div>
                  <Label htmlFor="street" className="text-sm font-semibold text-gray-700 mb-2 block">Street, No</Label>
                  <Input
                    id="street"
                    value={teacherData.fld_street}
                    disabled
                    className="bg-gray-50/50 border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-medium"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700 mb-2 block">Last name</Label>
                  <Input
                    id="lastName"
                    value={teacherData.fld_last_name}
                    disabled
                    className="bg-gray-50/50 border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-medium"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 mb-2 block">Telephone number</Label>
                  <Input
                    id="phone"
                    value={teacherData.fld_phone}
                    disabled
                    className="bg-gray-50/50 border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-medium"
                  />
                </div>
                <div>
                  <Label htmlFor="city" className="text-sm font-semibold text-gray-700 mb-2 block">City</Label>
                  <Input
                    id="city"
                    value={teacherData.fld_city}
                    disabled
                    className="bg-gray-50/50 border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-medium"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700 mb-2 block">E-mail address</Label>
                  <Input
                    id="email"
                    value={teacherData.fld_email}
                    disabled
                    className="bg-gray-50/50 border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contract Terms */}
          <div className="bg-white border border-gray-200 p-8 space-y-6 shadow-lg rounded-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-600 font-bold text-sm">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Activity</h3>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-300">
                <p className="font-medium text-gray-800">
                  The contractors are entrusted with providing tutoring in the following subjects:{' '}
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-white text-xs font-semibold rounded-full">
                  {teacherData.subjects.join(', ')}
                  </span>
                </p>
              </div>
              
              <p>
                The contractors are commissioned to teach the students assigned to them in the corresponding school subjects and to prepare them for vocational training, a school leaving certificate or another state-recognized examination. Tutoring can take place either at home with the students, at another agreed location or online.
              </p>

              <p>
                The contractors can determine the time and scope of their work themselves. The appointment scheduling is done in consultation with the respective students or their parents. If lessons are cancelled in good time, no claims arise against the CleverCoach tutoring institute.
              </p>

              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-300">
                <p className="font-medium text-gray-800">
                  The contractors undertake not to enter into their own business relationships with the students assigned to them during the contract period and for the duration of one further school year after the end of the contract.
                </p>
              </div>
            </div>
          </div>

          {/* Fee Section */}
          <div className="bg-white border border-gray-200 p-8 space-y-6 shadow-lg rounded-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-600 font-bold text-sm">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Fee</h3>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                The contractors accept that the institute creates a credit note at the end of each month based on the hours correctly and completely documented in the teacher portal, which serves as a binding fee statement.
              </p>
              
              <p>
                The credits will be transferred to the contractors' bank account deposited with us between the 15th and 18th of the following month, provided that all hours have been entered correctly.
              </p>

              <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-gray-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800 mb-2">Hourly Rate</p>
                    <p className="text-sm text-gray-600">Unless otherwise agreed, the fee for the contractors is:</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">
                      €{teacherData.fld_per_l_rate}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">for 60 minutes</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-4 font-medium">
                  Cash payments are generally not possible.
                </p>
              </div>
            </div>
          </div>

          {/* Termination Section */}
          <div className="bg-white border border-gray-200 p-8 space-y-6 shadow-lg rounded-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-600 font-bold text-sm">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Termination</h3>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-gray-300">
              <p className="text-gray-700 leading-relaxed">
                This contract is indefinite. However, the contractors should terminate the contract in writing with a notice period of at least one month. This notice period gives the institute the opportunity to reassign the students during this time.
              </p>
            </div>
          </div>

          {/* Miscellaneous Section */}
          <div className="bg-white border border-gray-200 p-8 space-y-6 shadow-lg rounded-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-600 font-bold text-sm">4</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Miscellaneous</h3>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-300">
                <p className="font-medium text-gray-800">
                  Both parties agree that this contract is a fee contract for freelance work and not an employment contract.
                </p>
              </div>

              <p>
                The contractors undertake not to pass on data about students or other business information of the CleverCoach tutoring institute to third parties during the contract period and also after the end of the contractual relationship.
              </p>

              <p>
                The contractors undertake not to open, operate their own tutoring institute or participate in a similar form at a tutoring institute that is in direct competition with the CleverCoach tutoring institute during the contract period.
              </p>

              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-300">
                <p className="font-medium text-gray-800">
                  By their signature, the contractors assure that all information about their person has been made truthfully and that they have read and understood the contract text. A copy of the contract was handed over to the contractors digitally.
                </p>
              </div>
            </div>
          </div>

          {/* Confirmation Section */}
          <div className="bg-white border border-gray-200 p-8 space-y-8 shadow-lg rounded-xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Confirmation</h2>
                <p className="text-sm text-gray-600">Digital signature and contract acceptance</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-200">
                <Label className="text-lg font-semibold text-gray-800 mb-4 block">
                  Signature of teacher/guardian:
                </Label>
                <div className="flex flex-col items-center space-y-4">
                <SignaturePad
                  onSignatureChange={handleSignatureChange}
                    width={500}
                    height={250}
                    className="border-2 border-gray-300 rounded-lg bg-white shadow-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-primary border-primary hover:bg-primary hover:text-white transition-colors"
                    onClick={() => handleSignatureChange('')}
                  >
                    Delete signature
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700">Full name</Label>
                  <Input
                    id="fullName"
                    value={`${teacherData.fld_first_name} ${teacherData.fld_last_name}`}
                    readOnly
                    className="bg-gray-50/50 border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-sm font-semibold text-gray-700">CleverCoach tutoring</Label>
                  <Input
                    id="companyName"
                    value="Tav und Uzun Gbr"
                    readOnly
                    className="bg-gray-50/50 border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-semibold text-gray-700">Date</Label>
                  <Input
                    id="date"
                    value={new Date().toLocaleDateString('de-DE')}
                    readOnly
                    className="bg-gray-50/50 border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-center py-4">
                <div className="text-center">
                  <img 
                    src="/c-signature.png" 
                    alt="Company Signature" 
                    className="h-16 w-auto mx-auto mb-2"
                  />
                  <p className="text-sm text-gray-600">Company Signature</p>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-gray-300">
                <p className="text-sm text-gray-700 font-medium text-center">
                  By registering, you accept our terms and conditions as listed on our website.
                </p>
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  type="submit"
                  size="lg"
                  disabled={!signatureData || signContractMutation.isPending}
                  className="bg-primary hover:bg-primary/90 text-white px-12 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {signContractMutation.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                      Signing Contract...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-3" />
                      Submit Contract
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherContractSigning;
