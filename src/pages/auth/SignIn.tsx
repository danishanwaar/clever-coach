import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, EyeOff, GraduationCap, BookOpen, Users, Mail, Lock, ArrowRight, Sparkles, Shield, Zap } from 'lucide-react';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState({ email: false, password: false });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { signIn, loading } = useAuth();
  const navigate = useNavigate();

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
    const result = await signIn(email, password);
    if (result.success) {
      navigate('/');
    }
  };

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
      <div className="hidden lg:flex lg:w-1/2 bg-primary p-8 lg:p-12 items-center justify-center relative overflow-hidden">
        {/* Enhanced Background Pattern */}
        <div className="absolute inset-0 bg-primary hero-pattern"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/15 rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/15 rounded-full translate-y-12 -translate-x-12 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-0 w-16 h-16 bg-white/10 rounded-full translate-x-8 animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        <div className="max-w-lg text-center space-y-8 relative z-10">
          {/* Enhanced Logo with Animation */}
          <div className="mb-8 text-center">
            <div className="flex flex-col items-center space-y-3 group">
              {/* Animated Education Icon */}
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

      {/* Right Side - Enhanced Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="w-full max-w-lg space-y-8">
          {/* Enhanced Login Form Card */}
          <Card className="card-elevated bg-white/90 backdrop-blur-xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
            <CardContent className="p-8">
              <div className="space-y-8">
                <div className="space-y-3 text-center">
                  <h2 className="text-3xl font-bold text-foreground text-gradient">
                    Welcome back!
                  </h2>
                  <p className="text-muted-foreground text-lg">Sign in to your account</p>
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
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setIsFocused({ ...isFocused, email: true })}
                        onBlur={() => setIsFocused({ ...isFocused, email: false })}
                        required
                        className={`h-14 pl-4 pr-4 transition-all duration-300 border-2 rounded-xl text-base`}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                      <Lock className="w-4 h-4" />
                      <span>Password</span>
                    </Label>
                    <div className="relative group">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setIsFocused({ ...isFocused, password: true })}
                        onBlur={() => setIsFocused({ ...isFocused, password: false })}
                        required
                        className={`h-14 pl-4 pr-14 transition-all duration-300 rounded-xl text-base`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 w-10 hover:bg-accent rounded-lg transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-500" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-500" />
                        )}
                      </Button>
                    </div>
                    
                    <div className="flex justify-end">
                      <Link
                        to="/auth/forgot-password"
                        className="text-sm text-primary hover:text-primary-light hover:underline transition-colors font-medium"
                      >
                        Forgot your password?
                      </Link>
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
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>Sign In</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </Button>
                </form>

                <div className="text-center">
                  <span className="text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <Link 
                      to="/auth/signup" 
                      className="text-primary hover:text-primary-light hover:underline font-semibold transition-colors"
                    >
                      Create one now
                    </Link>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Back to Home - Mobile Only */}
          <div className="lg:hidden text-center">
            <Link 
              to="/" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center space-x-1"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}