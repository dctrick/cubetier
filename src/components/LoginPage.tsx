import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon, LoaderIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import credentials from '../../cred.json';
const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    let isValid = true;
    
    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email');
      isValid = false;
    } else if (email !== credentials.email) {
      setEmailError('Invalid credentials');
      isValid = false;
    } else {
      setEmailError('');
    }
    
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password !== credentials.password) {
      setPasswordError('Invalid credentials');
      isValid = false;
    } else {
      setPasswordError('');
    }
    
    if (isValid) {
      // Simulate login process with animation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Login and redirect to form page
      login();
      navigate('/form');
    } else {
      setIsLoggingIn(false);
    }
  };
  return <div className="min-h-screen w-full bg-black flex items-center justify-center p-4">
      <div className="absolute w-full h-full">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gray-800/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gray-700/15 rounded-full filter blur-3xl"></div>
      </div>
      <div className="relative z-10 w-full max-w-md backdrop-blur-lg backdrop-filter bg-black/60 rounded-2xl border border-gray-900 shadow-2xl p-8 transition-all duration-300">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-500">
            Enter your credentials to access your account
          </p>
          {isLoggingIn && (
            <div className="mt-4 p-3 bg-green-900/30 border border-green-800 rounded-lg animate-pulse">
              <p className="text-green-400 text-sm">Verifying credentials...</p>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-400 block">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MailIcon className="h-5 w-5 text-gray-600" />
              </div>
              <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className={`w-full pl-10 pr-4 py-3 bg-black/80 border ${emailError ? 'border-red-800' : 'border-gray-800'} rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-all duration-200`} placeholder="name@example.com" />
            </div>
            {emailError && <p className="text-red-600 text-sm mt-1">{emailError}</p>}
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-400 block">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockIcon className="h-5 w-5 text-gray-600" />
              </div>
              <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className={`w-full pl-10 pr-12 py-3 bg-black/80 border ${passwordError ? 'border-red-800' : 'border-gray-800'} rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-all duration-200`} placeholder="••••••••" />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-600 hover:text-gray-400 focus:outline-none">
                  {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>
            {passwordError && <p className="text-red-600 text-sm mt-1">{passwordError}</p>}
          </div>

          <button 
            type="submit" 
            disabled={isLoggingIn}
            className="w-full py-3 px-4 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 focus:ring-offset-black transition-all duration-200 shadow-lg hover:shadow-gray-700/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoggingIn ? (
              <>
                <LoaderIcon className="h-5 w-5 animate-spin" />
                Authenticating...
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>
        <div className="mt-10 text-center">
          <div className="inline-flex items-center justify-center w-full">
            <hr className="w-full h-px bg-gray-800 border-0" />
            <span className="absolute px-3 text-xs font-medium text-gray-500 bg-black/80 backdrop-blur-sm">
              Premium Access
            </span>
          </div>
        </div>
      </div>
    </div>;
};
export default LoginPage;