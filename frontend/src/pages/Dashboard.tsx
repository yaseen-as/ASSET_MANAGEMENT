import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-300">Welcome, {user?.name}</span>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Portfolio Value</h3>
            <p className="text-2xl font-bold text-green-400">₹5,00,000</p>
            <p className="text-sm text-gray-400">+2.5% today</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Total P&L</h3>
            <p className="text-2xl font-bold text-green-400">+₹25,000</p>
            <p className="text-sm text-gray-400">+5.25%</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Holdings</h3>
            <p className="text-2xl font-bold text-white">12</p>
            <p className="text-sm text-gray-400">Active positions</p>
          </div>
        </div>

        <div className="mt-8 bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-300">RELIANCE bought at ₹2,456.75</span>
              <span className="text-green-400">+₹1,200</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-300">TCS dividend received</span>
              <span className="text-green-400">+₹500</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-300">INFY sold at ₹1,523.45</span>
              <span className="text-red-400">-₹800</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
