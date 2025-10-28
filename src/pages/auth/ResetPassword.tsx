import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Lock, GraduationCap, BookOpen, Users, KeyRound, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Mouse tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    // Check if we have a hash (from the email link)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');

    // If it's not a recovery session, redirect to sign in
    if (type !== 'recovery' || !accessToken) {
      toast.error('Invalid or expired reset link');
      setTimeout(() => navigate('/'), 2000);
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      toast.success('Password updated successfully!');
      setIsSuccess(true);

      // Redirect to sign in after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
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

        {/* Left Side */}
        <div className="hidden lg:flex lg:w-1/2 bg-primary p-8 lg:p-12 items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-primary hero-pattern"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/15 rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/15 rounded-full translate-y-12 -translate-x-12 animate-pulse" style={{ animationDelay: '1s' }}></div>
          
          <div className="max-w-lg text-center space-y-8 relative z-10">
            <div className="mb-8 text-center">
              <div className="flex flex-col items-center space-y-3 group">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                  <div className="relative">
                    <GraduationCap className="w-10 h-10 text-white group-hover:rotate-12 transition-transform duration-300" />
                    <BookOpen className="absolute -bottom-1 -right-1 w-5 h-5 text-white/80 group-hover:scale-110 transition-transform duration-300" />
                    <Users className="absolute -bottom-1 -left-1 w-5 h-5 text-white/80 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </div>
                <div className="text-white">
                  <h1 className="text-2xl font-bold tracking-wide">CLEVERCOACH</h1>
                </div>
              </div>
            </div>

            <div className="relative mx-auto w-80 h-64 flex items-center justify-center group">
              <div className="absolute inset-0 bg-white/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <img 
                src="/lovable-uploads/4fba58e9-4cb5-4456-aadf-1b559eff0ee7.png"
                alt="CleverCoach Platform"
                className="w-full h-full object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-500 relative z-10"
              />
            </div>

            <div className="space-y-6">
              <h1 className="text-5xl font-bold text-white leading-tight">
                Fast, efficient and productive
              </h1>
              <p className="text-xl text-white/90 leading-relaxed">
                Connect with expert tutors, manage lessons seamlessly, and achieve your learning goals with CleverCoach.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
          <Card className="card-elevated bg-white/90 backdrop-blur-xl">
            <CardContent className="p-8">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Password Updated!</h2>
                <p className="text-gray-600">
                  Your password has been successfully updated. You will be redirected to the sign-in page shortly.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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

      {/* Left Side - Same as SignIn */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary p-8 lg:p-12 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-primary hero-pattern"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/15 rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/15 rounded-full translate-y-12 -translate-x-12 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-0 w-16 h-16 bg-white/10 rounded-full translate-x-8 animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        <div className="max-w-lg text-center space-y-8 relative z-10">
          {/* Logo */}
          <div className="mb-8 text-center">
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
              </div>
            </div>
          </div>

          {/* Illustration */}
          <div className="relative mx-auto w-80 h-64 flex items-center justify-center group">
            <div className="absolute inset-0 bg-white/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <img 
              src="/lovable-uploads/4fba58e9-4cb5-4456-aadf-1b559eff0ee7.png"
              alt="CleverCoach Platform Illustration"
              className="w-full h-full object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-500 relative z-10"
            />
          </div>

          {/* Heading */}
          <div className="space-y-6">
            <h1 className="text-5xl font-bold text-white leading-tight">
              Fast, efficient and productive
            </h1>
            <p className="text-xl text-white/90 leading-relaxed">
              Connect with expert tutors, manage lessons seamlessly, and achieve your learning goals with CleverCoach.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Reset Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="w-full max-w-lg space-y-8">
          <Card className="card-elevated bg-white/90 backdrop-blur-xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
            <CardContent className="p-8">
              <div className="space-y-8">
                <div className="space-y-3 text-center">
                  <h2 className="text-3xl font-bold text-foreground text-gradient">
                    Reset Password
                  </h2>
                  <p className="text-muted-foreground text-lg">Enter your new password below</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                      <KeyRound className="w-4 h-4" />
                      <span>New Password</span>
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter new password (min 6 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-14 pl-4 pr-4 transition-all duration-300 border-2 rounded-xl text-base"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                      <KeyRound className="w-4 h-4" />
                      <span>Confirm Password</span>
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="h-14 pl-4 pr-4 transition-all duration-300 border-2 rounded-xl text-base"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-14 btn-hero font-semibold rounded-xl group disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Updating password...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Lock className="w-4 h-4" />
                        <span>Update Password</span>
                      </div>
                    )}
                  </Button>
                </form>

                <div className="text-center">
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/auth/sign-in')}
                    className="text-gray-600"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Sign In
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
