import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Shield, Camera } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { userAPI } from '../services/apiService';

function Profile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    username: user?.username || '',
    bio: user?.bio || ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await userAPI.updateProfile(formData);
      updateUser(response.user);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await userAPI.updateAvatar(formData);
      updateUser({ avatar: response.avatar });
      toast.success('Avatar updated successfully');
    } catch (error) {
      toast.error('Failed to update avatar');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200/30 to-base-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate('/chat')} className="btn btn-ghost btn-circle hover:bg-primary/10">
            <ArrowLeft />
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Profile</h1>
        </div>

        {/* Avatar Section */}
        <div className="card bg-base-100 shadow-2xl mb-6 hover:shadow-3xl transition-shadow duration-300 border border-base-300">
          <div className="card-body items-center text-center">
            <div className="relative">
              <div className="avatar">
                <div className="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-4 shadow-xl">
                  <img src={user?.avatar} alt={user?.fullName} />
                </div>
              </div>
              <label className="btn btn-circle btn-primary btn-sm absolute bottom-0 right-0">
                <Camera size={16} />
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
            <h2 className="card-title mt-4">{user?.fullName}</h2>
            <p className="text-base-content/60">@{user?.username}</p>
          </div>
        </div>

        {/* Profile Form */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title mb-4">Edit Profile</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Full Name</span>
                </label>
                <label className="input input-bordered flex items-center gap-2">
                  <User size={20} className="opacity-70" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="grow"
                    disabled={isLoading}
                  />
                </label>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Username</span>
                </label>
                <label className="input input-bordered flex items-center gap-2">
                  <span className="opacity-70">@</span>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="grow"
                    disabled={isLoading}
                  />
                </label>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Bio</span>
                </label>
                <textarea
                  name="bio"
                  className="textarea textarea-bordered h-24"
                  placeholder="Tell us about yourself..."
                  value={formData.bio}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Email</span>
                </label>
                <label className="input input-bordered flex items-center gap-2">
                  <Mail size={20} className="opacity-70" />
                  <input
                    type="email"
                    value={user?.email}
                    className="grow"
                    disabled
                  />
                </label>
                <label className="label">
                  <span className="label-text-alt">Email cannot be changed</span>
                </label>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary w-full"
                disabled={isLoading}
              >
                {isLoading ? <span className="loading loading-spinner"></span> : 'Save Changes'}
              </button>
            </form>
            
            {/* Copyright Footer */}
            <div className="mt-8 pt-6 border-t border-base-300 text-center text-xs text-base-content/60">
              <p>© {new Date().getFullYear()} Weave Chat Platform</p>
              <p className="mt-1">Created by Shobhit Pandey</p>
              <p className="mt-1">
                <a href="mailto:techslave19@gmail.com" className="link link-hover">
                  techslave19@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
