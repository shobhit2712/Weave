import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { authAPI } from '../services/apiService';
import { validateEmail, validatePassword, validateUsername, getPasswordStrength, getPasswordStrengthLabel, getPasswordStrengthColor } from '../utils/validation';

function Register() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const passwordStrength = getPasswordStrength(formData.password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (!validateUsername(formData.username)) {
      newErrors.username = 'Username must be 3-30 characters (letters, numbers, underscores only)';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsLoading(true);
    try {
      const { confirmPassword, ...registerData } = formData;
      const response = await authAPI.register(registerData);
      login(response.user, response.accessToken, response.refreshToken);
      toast.success('Account created successfully!');
      navigate('/chat');
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle validation errors from backend
      if (error.response?.data?.errors) {
        const backendErrors = {};
        error.response.data.errors.forEach(err => {
          backendErrors[err.field] = err.message;
        });
        setErrors(backendErrors);
        toast.error('Please check the form for errors');
      } else {
        const message = error.response?.data?.message || 'Failed to create account';
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10 p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl">
        <div className="card-body">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-content mb-4">
              <UserPlus size={32} />
            </div>
            <h1 className="text-3xl font-bold">Create Account</h1>
            <p className="text-base-content/60 mt-2">Join Weave today</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Full Name</span>
              </label>
              <label className="input input-bordered flex items-center gap-2">
                <User size={20} className="opacity-70" />
                <input
                  type="text"
                  name="fullName"
                  placeholder="John Doe"
                  className="grow"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </label>
              {errors.fullName && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.fullName}</span>
                </label>
              )}
            </div>

            {/* Username */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Username</span>
              </label>
              <label className="input input-bordered flex items-center gap-2">
                <span className="opacity-70">@</span>
                <input
                  type="text"
                  name="username"
                  placeholder="johndoe"
                  className="grow"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </label>
              {errors.username && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.username}</span>
                </label>
              )}
            </div>

            {/* Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <label className="input input-bordered flex items-center gap-2">
                <Mail size={20} className="opacity-70" />
                <input
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  className="grow"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </label>
              {errors.email && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.email}</span>
                </label>
              )}
            </div>

            {/* Password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <label className="input input-bordered flex items-center gap-2">
                <Lock size={20} className="opacity-70" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Create a password"
                  className="grow"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="btn btn-ghost btn-xs btn-circle"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </label>
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>Password Strength:</span>
                    <span className={`font-medium text-${getPasswordStrengthColor(passwordStrength)}`}>
                      {getPasswordStrengthLabel(passwordStrength)}
                    </span>
                  </div>
                  <progress 
                    className={`progress progress-${getPasswordStrengthColor(passwordStrength)} w-full`} 
                    value={passwordStrength} 
                    max="5"
                  ></progress>
                </div>
              )}
              {errors.password && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.password}</span>
                </label>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Confirm Password</span>
              </label>
              <label className="input input-bordered flex items-center gap-2">
                <Lock size={20} className="opacity-70" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  className="grow"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="btn btn-ghost btn-xs btn-circle"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </label>
              {errors.confirmPassword && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.confirmPassword}</span>
                </label>
              )}
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="btn btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? <span className="loading loading-spinner"></span> : 'Create Account'}
            </button>
          </form>

          {/* Footer */}
          <div className="divider">OR</div>
          <p className="text-center text-sm">
            Already have an account?{' '}
            <Link to="/login" className="link link-primary font-medium">
              Sign in
            </Link>
          </p>
          
          {/* Copyright */}
          <div className="mt-8 text-center text-xs text-base-content/60">
            <p>© {new Date().getFullYear()} Weave Chat Platform</p>
            <p>Created by Shobhit Pandey</p>
            <p>
              <a href="mailto:techslave19@gmail.com" className="link link-hover">
                techslave19@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
