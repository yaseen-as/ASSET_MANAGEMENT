import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLoginMutation, useSignupMutation } from '../hooks/useAuthMutation';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, User, Mail, Lock, ArrowRight } from 'lucide-react';
import { validationToasts, authToasts, showToast } from '../lib/toast';

interface FormData {
  email: string;
  password: string;
  confirmPassword?: string;
  fullName?: string;
}

const AuthPage: React.FC = () => {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState<boolean>(
    location.pathname === '/login' || location.pathname === '/auth'
  );
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });

  const navigate = useNavigate();
  const { isAuthenticated, isLoading, error, setError } = useAuth();
  const loginMutation = useLoginMutation();
  const signupMutation = useSignupMutation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const returnUrl = (location.state as any)?.from?.pathname || '/';
      navigate(returnUrl, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  useEffect(() => {
    setIsLogin(location.pathname === '/login' || location.pathname === '/auth');
    setError(null);
  }, [location, setError]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      validationToasts.requiredFields();
      return false;
    }

    if (!isLogin) {
      if (!formData.fullName) {
        validationToasts.fullNameRequired();
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        validationToasts.passwordMismatch();
        return false;
      }
      if (formData.password.length < 6) {
        validationToasts.passwordTooShort();
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (isLogin) {
      loginMutation.mutate(
        { email: formData.email, password: formData.password },
        {
          onSuccess: () => authToasts.loginSuccess(),
          onError: (err: any) => authToasts.authError(err?.message || 'Login failed'),
        }
      );
    } else {
      signupMutation.mutate(
        { email: formData.email, password: formData.password, name: formData.fullName || '' },
        {
          onSuccess: () => authToasts.signupSuccess(),
          onError: (err: any) => authToasts.authError(err?.message || 'Signup failed'),
        }
      );
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: ''
    });
    setError(null);
  };

  const handleSocialLogin = (provider: string) => {
    showToast.info('Coming soon', `${provider} sign-in will be available soon.`);
  };

  return (
    <>
      <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 border border-white/10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 border border-white/5 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-white rounded-full animate-ping delay-500"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white rounded-full animate-ping delay-1000"></div>
        </div>

        <Card className="w-full max-w-md bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl relative z-10">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 shadow-lg">
              <User className="w-6 h-6 text-black" />
            </div>
            <CardTitle className="text-3xl font-bold text-white tracking-tight">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
            <CardDescription className="text-gray-300">
              {isLogin 
                ? 'Sign in to your account to continue' 
                : 'Sign up to get started with your account'
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-white font-medium">
                    Full Name
                  </Label>
                  <div className="relative">
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pl-10 h-12 focus:bg-white/15 focus:border-white/40 transition-all duration-300"
                      required={!isLogin}
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pl-10 h-12 focus:bg-white/15 focus:border-white/40 transition-all duration-300"
                    required
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pl-10 pr-10 h-12 focus:bg-white/15 focus:border-white/40 transition-all duration-300"
                    required
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white font-medium">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pl-10 pr-10 h-12 focus:bg-white/15 focus:border-white/40 transition-all duration-300"
                      required={!isLogin}
                    />
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {isLogin && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      id="remember"
                      type="checkbox"
                      className="w-4 h-4 bg-white/10 border-white/20 rounded focus:ring-white/50 focus:ring-2"
                    />
                    <Label htmlFor="remember" className="text-sm text-gray-300">
                      Remember me
                    </Label>
                  </div>
                  <button
                    type="button"
                    className="text-sm text-white hover:text-gray-300 transition-colors underline underline-offset-4"
                    onClick={() => showToast.info('Password recovery', 'Password recovery will be available soon.')}
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <Button
                type="submit"
                disabled={loginMutation.isPending || signupMutation.isPending}
                className="w-full bg-white text-black hover:bg-gray-200 h-12 font-semibold text-base transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {(loginMutation.isPending || signupMutation.isPending) ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </div>
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-black px-4 text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant="outline"
                className="bg-transparent border-white/20 text-white hover:bg-white/10 h-12 transition-all duration-300"
                onClick={() => handleSocialLogin('Google')}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="bg-transparent border-white/20 text-white hover:bg-white/10 h-12 transition-all duration-300"
                onClick={() => handleSocialLogin('Facebook')}
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </Button>
            </div>

            <div className="text-center">
              <span className="text-gray-400">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
              </span>
              <button
                type="button"
                onClick={toggleAuthMode}
                className="text-white hover:text-gray-300 transition-colors underline underline-offset-4 font-medium"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AuthPage;