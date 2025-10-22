import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Mail, CheckCircle, GraduationCap, BookOpen, Users, ArrowRight, Sparkles, Shield, Zap, Send } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { resetPassword, loading } = useAuth();

  // Mouse tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await resetPassword(email);
    if (result.success) {
      setIsEmailSent(true);
    }
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <div 
            className="absolute w-96 h-96 bg-gradient-to-rrounded-full blur-3xl transition-all duration-1000 ease-out"
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

        {/* Left Side - Enhanced Illustration & Content */}
        <div className="hidden lg:flex lg:w-1/2 hero-gradient p-8 lg:p-12 items-center justify-center relative overflow-hidden">
          {/* Enhanced Background Pattern */}
          <div className="absolute inset-0 hero-gradient hero-pattern"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/15 rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/15 rounded-full translate-y-12 -translate-x-12 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 right-0 w-16 h-16 bg-white/10 rounded-full translate-x-8 animate-pulse" style={{ animationDelay: '2s' }}></div>
          
          <div className="max-w-lg text-center space-y-8 relative z-10">
            {/* Enhanced Logo with Animation */}
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

            {/* Enhanced Illustration with Hover Effects */}
            <div className="relative mx-auto w-80 h-64 flex items-center justify-center group">
              <div className="absolute inset-0 bg-white/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <img 
                src="/lovable-uploads/4fba58e9-4cb5-4456-aadf-1b559eff0ee7.png"
                alt="CleverCoach Platform Illustration"
                className="w-full h-full object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-500 relative z-10"
              />
            </div>

            {/* Enhanced Main Heading with Staggered Animation */}
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

        {/* Right Side - Enhanced Success Message */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
          <div className="w-full max-w-lg space-y-8">
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
              <CardContent className="p-8">
                <div className="space-y-8 text-center">
                   <div className="flex justify-center">
                     <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center shadow-lg group">
                       <CheckCircle className="w-10 h-10 text-primary group-hover:scale-110 transition-transform duration-300" />
                     </div>
                   </div>
                   
                   <div className="space-y-4">
                     <h2 className="text-3xl font-bold text-gradient">
                       Email sent successfully!
                     </h2>
                     <p className="text-lg text-muted-foreground">
                       We've sent a password reset link to <strong className="text-primary">{email}</strong>
                     </p>
                   </div>

                  <div className="space-y-6">
                    <div className="bg-accent rounded-xl p-6 border border-primary/20">
                      <h3 className="font-semibold text-primary mb-3 flex items-center justify-center space-x-2">
                        <Mail className="w-5 h-5" />
                        <span>What to do next</span>
                      </h3>
                      <ul className="space-y-2 text-sm text-primary text-left">
                        <li className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                          <span>Check your email inbox for the reset link</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                          <span>If you don't see it, check your spam folder</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                          <span>Click the link to reset your password</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="space-y-4">
                      <Button 
                        onClick={() => setIsEmailSent(false)}
                        variant="outline"
                        className="w-full h-12 border-2 border-primary hover:border-primary-light text-primary hover:text-primary-light rounded-xl font-semibold transition-all duration-300 hover:scale-105 group"
                      >
                        <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                        Try another email
                      </Button>
                      
                      <Link to="/auth/signin">
                        <Button variant="ghost" className="w-full h-12 text-gray-600 hover:text-primary hover:bg-accent rounded-xl font-semibold transition-all duration-300 group">
                          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                          Back to Sign In
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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

      {/* Left Side - Enhanced Illustration & Content */}
        <div className="hidden lg:flex lg:w-1/2 hero-gradient p-8 lg:p-12 items-center justify-center relative overflow-hidden">
          {/* Enhanced Background Pattern */}
          <div className="absolute inset-0 hero-gradient hero-pattern"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/15 rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/15 rounded-full translate-y-12 -translate-x-12 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-0 w-16 h-16 bg-white/10 rounded-full translate-x-8 animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        <div className="max-w-lg text-center space-y-8 relative z-10">
          {/* Enhanced Logo with Animation */}
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

          {/* Enhanced Illustration with Hover Effects */}
          <div className="relative mx-auto w-80 h-64 flex items-center justify-center group">
            <div className="absolute inset-0 bg-white/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <img 
              src="/lovable-uploads/4fba58e9-4cb5-4456-aadf-1b559eff0ee7.png"
              alt="CleverCoach Platform Illustration"
              className="w-full h-full object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-500 relative z-10"
            />
          </div>

          {/* Enhanced Main Heading with Staggered Animation */}
          <div className="space-y-6">
            <h1 className="text-5xl font-bold text-white leading-tight">
              Fast, efficient and productive
            </h1>
            <p className="text-xl text-white/90 leading-relaxed">
              Connect with expert tutors, manage lessons seamlessly, and achieve your learning goals with CleverCoach.
            </p>
            
            \
          </div>
        </div>
      </div>

      {/* Right Side - Enhanced Reset Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="w-full max-w-lg space-y-8">
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
            <CardContent className="p-8">
              <div className="space-y-8">
                <div className="space-y-4 text-center">
                   <div className="flex justify-center">
                     <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center shadow-lg group">
                       <Mail className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                     </div>
                   </div>
                   <h2 className="text-3xl font-bold text-gradient">
                     Forgot your password?
                   </h2>
                  <p className="text-lg text-muted-foreground">
                    No worries! Enter your email and we'll send you reset instructions.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>Email Address</span>
                    </Label>
                    <div className="relative group">
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        required
                        className={`h-14 pl-4 pr-4 transition-all duration-300 rounded-xl text-base`}
                      />
                    </div>
                  </div>

                   <Button 
                     type="submit" 
                     className="w-full h-14 btn-hero font-semibold rounded-xl group disabled:opacity-50 disabled:cursor-not-allowed"
                     disabled={loading}
                   >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Sending reset link...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>Send Reset Link</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </Button>
                </form>

                <div className="text-center">
                  <Link 
                    to="/auth/signin" 
                     className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center space-x-1 group"
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span>Back to Sign In</span>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
