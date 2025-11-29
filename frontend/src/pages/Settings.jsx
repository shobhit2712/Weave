import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Palette, LogOut, Bell, Shield, Moon, Sun } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import useChatStore from '../store/chatStore';
import { authAPI, userAPI } from '../services/apiService';
import socketService from '../services/socketService';
import { THEMES } from '../utils/constants';

function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const { reset: resetChat } = useChatStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await authAPI.logout();
      socketService.disconnect();
      logout();
      resetChat();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleThemeChange = async (newTheme) => {
    setTheme(newTheme);
    try {
      await userAPI.updateTheme(newTheme);
      toast.success('Theme updated');
    } catch (error) {
      console.error('Failed to save theme:', error);
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Settings</h1>
        </div>

        {/* Theme Settings */}
        <div className="card bg-base-100 shadow-2xl mb-6 border border-base-300 hover:shadow-3xl transition-shadow duration-300">
          <div className="card-body">
            <h3 className="card-title flex items-center gap-2 text-primary">
              <Palette size={24} />
              Theme
            </h3>
            <p className="text-sm text-base-content/60 mb-4">
              Choose your preferred theme
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {THEMES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => handleThemeChange(t.value)}
                  className={`btn transition-all duration-200 ${theme === t.value ? 'btn-primary shadow-lg scale-105' : 'btn-outline hover:scale-105 hover:shadow-md'}`}
                >
                  <span className="mr-2">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h3 className="card-title flex items-center gap-2">
              <Shield size={24} />
              Account
            </h3>
            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notifications</p>
                  <p className="text-sm text-base-content/60">Push notifications for new messages</p>
                </div>
                <input type="checkbox" className="toggle toggle-primary" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Sound</p>
                  <p className="text-sm text-base-content/60">Play sound for new messages</p>
                </div>
                <input type="checkbox" className="toggle toggle-primary" defaultChecked />
              </div>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          className="btn btn-error w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="loading loading-spinner"></span>
          ) : (
            <>
              <LogOut size={20} />
              Logout
            </>
          )}
        </button>
        
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
  );
}

export default Settings;
