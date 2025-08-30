import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { User, Mail, Key, Shield, Save } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    angelOneApiKey: '****-****-****-****',
    angelOneClientId: '****-****-****',
    notifications: {
      priceAlerts: true,
      portfolioUpdates: true,
      marketNews: false,
    },
  });

  const [isEditing, setIsEditing] = useState(false);

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
    // Save profile data
    console.log('Saving profile data:', profileData);
    setIsEditing(false);
    // TODO: Implement API call to update profile
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <Button onClick={() => setIsEditing(!isEditing)} variant="outline">
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={profileData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={profileData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Angel One API Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="h-5 w-5 mr-2" />
                  Angel One API Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="angelOneApiKey">API Key</Label>
                  <Input
                    id="angelOneApiKey"
                    name="angelOneApiKey"
                    type="password"
                    value={profileData.angelOneApiKey}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="mt-1"
                    placeholder="Enter your Angel One API Key"
                  />
                </div>
                
                <div>
                  <Label htmlFor="angelOneClientId">Client ID</Label>
                  <Input
                    id="angelOneClientId"
                    name="angelOneClientId"
                    value={profileData.angelOneClientId}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="mt-1"
                    placeholder="Enter your Angel One Client ID"
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-md">
                  <div className="flex">
                    <Shield className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-800">Security Note</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Your API credentials are encrypted and stored securely. They are only used to fetch your portfolio data from Angel One.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="priceAlerts" className="text-sm font-medium">
                      Price Alerts
                    </Label>
                    <p className="text-sm text-gray-500">Get notified when stock prices hit your target</p>
                  </div>
                  <Button
                    type="button"
                    variant={profileData.notifications.priceAlerts ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleNotificationChange('priceAlerts')}
                    disabled={!isEditing}
                  >
                    {profileData.notifications.priceAlerts ? 'ON' : 'OFF'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="portfolioUpdates" className="text-sm font-medium">
                      Portfolio Updates
                    </Label>
                    <p className="text-sm text-gray-500">Daily summary of your portfolio performance</p>
                  </div>
                  <Button
                    type="button"
                    variant={profileData.notifications.portfolioUpdates ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleNotificationChange('portfolioUpdates')}
                    disabled={!isEditing}
                  >
                    {profileData.notifications.portfolioUpdates ? 'ON' : 'OFF'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="marketNews" className="text-sm font-medium">
                      Market News
                    </Label>
                    <p className="text-sm text-gray-500">Breaking news and market updates</p>
                  </div>
                  <Button
                    type="button"
                    variant={profileData.notifications.marketNews ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleNotificationChange('marketNews')}
                    disabled={!isEditing}
                  >
                    {profileData.notifications.marketNews ? 'ON' : 'OFF'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {isEditing && (
              <div className="flex space-x-4">
                <Button onClick={handleSave} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            )}
          </div>

          {/* Account Summary Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Member Since</span>
                  <span className="text-sm font-medium">Jan 2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Holdings</span>
                  <span className="text-sm font-medium">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Portfolio Value</span>
                  <span className="text-sm font-medium">₹1,25,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Account Status</span>
                  <Badge variant="secondary">Active</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Key className="h-4 w-4 mr-2" />
                  Two-Factor Auth
                </Button>
                <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                  <User className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
