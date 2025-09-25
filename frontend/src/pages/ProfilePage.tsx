import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { 
  User, 
  Mail, 
  Key, 
  Shield, 
  Save, 
  Bell,
  Settings,
  CheckCircle,
  AlertTriangle,
  Edit,
  Lock,
  Trash2
} from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || 'John Doe',
    email: user?.email || 'john.doe@example.com',
    angelOneApiKey: '****-****-****-****',
    angelOneClientId: '****-****-****',
    notifications: {
      priceAlerts: true,
      portfolioUpdates: true,
      marketNews: false,
    },
  });

  const [isEditing, setIsEditing] = useState(false);

  const StatCard = ({ title, value, change, changePercent, icon: Icon, color = 'text-gray-100' }) => (
    <div className="bg-gray-800 border-2 border-gray-700 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">{title}</p>
          <p className={`text-2xl font-bold mt-2 ${color}`}>{value}</p>
          {change && (
            <div className="text-xs text-gray-500 mt-1">{change}</div>
          )}
        </div>
        <div className="p-3 bg-gray-700 text-gray-100 rounded-full">
          <Icon size={24} />
        </div>
      </div>
    </div>
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNotificationChange = (key: string) => {
    setProfileData({
      ...profileData,
      notifications: {
        ...profileData.notifications,
        [key]: !profileData.notifications[key as keyof typeof profileData.notifications],
      },
    });
  };

  const handleSave = () => {
    console.log('Saving profile data:', profileData);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b-2 border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <User className="mr-3 text-blue-400" size={28} />
              <h1 className="text-2xl font-bold text-gray-100">Profile Settings</h1>
            </div>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-700 border-2 border-gray-600 text-gray-100 hover:bg-gray-600 transition-colors font-semibold"
            >
              <Edit size={16} />
              <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Account Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Member Since"
            value="Jan 2024"
            change="Active account"
            changePercent={null}
            icon={User}
            color="text-blue-400"
          />
          <StatCard
            title="Total Holdings"
            value="12"
            change="Diversified portfolio"
            changePercent={null}
            icon={Settings}
            color="text-green-400"
          />
          <StatCard
            title="Portfolio Value"
            value="₹1,25,000"
            change="Current market value"
            changePercent={null}
            icon={CheckCircle}
          />
          <StatCard
            title="Alert Status"
            value="Active"
            change="5 active alerts"
            changePercent={null}
            icon={Bell}
            color="text-yellow-400"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-gray-800 border-2 border-gray-700">
              <div className="p-6 border-b-2 border-gray-700">
                <h2 className="text-xl font-bold text-gray-100 flex items-center">
                  <User className="mr-2" size={20} />
                  Personal Information
                </h2>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Full Name</label>
                  <input
                    name="name"
                    value={profileData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 text-gray-100 focus:border-blue-500 focus:outline-none transition-colors ${
                      !isEditing ? 'opacity-75' : ''
                    }`}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Email Address</label>
                  <input
                    name="email"
                    type="email"
                    value={profileData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 text-gray-100 focus:border-blue-500 focus:outline-none transition-colors ${
                      !isEditing ? 'opacity-75' : ''
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Angel One API Settings */}
            <div className="bg-gray-800 border-2 border-gray-700">
              <div className="p-6 border-b-2 border-gray-700">
                <h2 className="text-xl font-bold text-gray-100 flex items-center">
                  <Key className="mr-2" size={20} />
                  Angel One API Configuration
                </h2>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">API Key</label>
                  <input
                    name="angelOneApiKey"
                    type="password"
                    value={profileData.angelOneApiKey}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Enter your Angel One API Key"
                    className={`w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors ${
                      !isEditing ? 'opacity-75' : ''
                    }`}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Client ID</label>
                  <input
                    name="angelOneClientId"
                    value={profileData.angelOneClientId}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Enter your Angel One Client ID"
                    className={`w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors ${
                      !isEditing ? 'opacity-75' : ''
                    }`}
                  />
                </div>

                <div className="bg-blue-900/20 border border-blue-800 p-4">
                  <div className="flex">
                    <Shield className="h-5 w-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-blue-300">Security Note</h4>
                      <p className="text-sm text-blue-200 mt-1">
                        Your API credentials are encrypted and stored securely. They are only used to fetch your portfolio data from Angel One.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-gray-800 border-2 border-gray-700">
              <div className="p-6 border-b-2 border-gray-700">
                <h2 className="text-xl font-bold text-gray-100 flex items-center">
                  <Bell className="mr-2" size={20} />
                  Notification Preferences
                </h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-750 border border-gray-600">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-100">Price Alerts</h4>
                    <p className="text-sm text-gray-400">Get notified when stock prices hit your target</p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('priceAlerts')}
                    disabled={!isEditing}
                    className={`px-4 py-2 border-2 text-sm font-semibold transition-colors ${
                      profileData.notifications.priceAlerts
                        ? 'border-green-500 text-green-400 bg-green-900/20'
                        : 'border-gray-600 text-gray-400'
                    } ${!isEditing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-30'}`}
                  >
                    {profileData.notifications.priceAlerts ? 'ON' : 'OFF'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-750 border border-gray-600">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-100">Portfolio Updates</h4>
                    <p className="text-sm text-gray-400">Daily summary of your portfolio performance</p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('portfolioUpdates')}
                    disabled={!isEditing}
                    className={`px-4 py-2 border-2 text-sm font-semibold transition-colors ${
                      profileData.notifications.portfolioUpdates
                        ? 'border-green-500 text-green-400 bg-green-900/20'
                        : 'border-gray-600 text-gray-400'
                    } ${!isEditing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-30'}`}
                  >
                    {profileData.notifications.portfolioUpdates ? 'ON' : 'OFF'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-750 border border-gray-600">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-100">Market News</h4>
                    <p className="text-sm text-gray-400">Breaking news and market updates</p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('marketNews')}
                    disabled={!isEditing}
                    className={`px-4 py-2 border-2 text-sm font-semibold transition-colors ${
                      profileData.notifications.marketNews
                        ? 'border-green-500 text-green-400 bg-green-900/20'
                        : 'border-gray-600 text-gray-400'
                    } ${!isEditing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-30'}`}
                  >
                    {profileData.notifications.marketNews ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex space-x-4">
                <button 
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 border-2 border-green-500 text-white hover:bg-green-700 transition-colors font-semibold"
                >
                  <Save size={16} />
                  <span>Save Changes</span>
                </button>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Summary */}
            <div className="bg-gray-800 border-2 border-gray-700">
              <div className="p-6 border-b-2 border-gray-700">
                <h2 className="text-xl font-bold text-gray-100">Account Summary</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Member Since</span>
                  <span className="text-sm font-semibold text-gray-100">Jan 2024</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Total Holdings</span>
                  <span className="text-sm font-semibold text-gray-100">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Portfolio Value</span>
                  <span className="text-sm font-semibold text-gray-100">₹1,25,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Account Status</span>
                  <div className="inline-flex items-center px-2 py-1 text-xs font-semibold uppercase tracking-wide text-green-400 border border-green-400">
                    <CheckCircle size={12} className="mr-1" />
                    Active
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 border-2 border-gray-700">
              <div className="p-6 border-b-2 border-gray-700">
                <h2 className="text-xl font-bold text-gray-100">Quick Actions</h2>
              </div>
              <div className="p-6 space-y-3">
                <button className="w-full flex items-center justify-start space-x-3 p-3 border-2 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-gray-100 transition-colors">
                  <Lock size={16} />
                  <span>Change Password</span>
                </button>
                <button className="w-full flex items-center justify-start space-x-3 p-3 border-2 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-gray-100 transition-colors">
                  <Shield size={16} />
                  <span>Two-Factor Auth</span>
                </button>
                <button className="w-full flex items-center justify-start space-x-3 p-3 border-2 border-red-600 text-red-400 hover:bg-red-900/20 transition-colors">
                  <Trash2 size={16} />
                  <span>Delete Account</span>
                </button>
              </div>
            </div>

            {/* Security Status */}
            <div className="bg-gray-800 border-2 border-gray-700">
              <div className="p-6 border-b-2 border-gray-700">
                <h2 className="text-xl font-bold text-gray-100">Security Status</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center space-x-3 text-green-400">
                  <CheckCircle size={16} />
                  <span className="text-sm">Email Verified</span>
                </div>
                <div className="flex items-center space-x-3 text-green-400">
                  <CheckCircle size={16} />
                  <span className="text-sm">API Keys Configured</span>
                </div>
                <div className="flex items-center space-x-3 text-yellow-400">
                  <AlertTriangle size={16} />
                  <span className="text-sm">2FA Not Enabled</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
