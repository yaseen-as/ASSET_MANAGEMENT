import React, { useState } from 'react';
import { 
  Bell, 
  Plus, 
  Trash2, 
  Edit, 
  AlertTriangle, 
  TrendingUp,
  TrendingDown,
  Activity,
  Play,
  Pause
} from 'lucide-react';
import { alertToasts } from '../lib/toast';

interface Alert {
  id: string;
  symbol: string;
  type: 'price_above' | 'price_below' | 'volume_high' | 'change_percent';
  value: number;
  currentValue: number;
  isActive: boolean;
  createdAt: string;
}

const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      symbol: 'RELIANCE',
      type: 'price_above',
      value: 2500,
      currentValue: 2456.75,
      isActive: true,
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      symbol: 'TCS',
      type: 'price_below',
      value: 3500,
      currentValue: 3567.80,
      isActive: true,
      createdAt: '2024-01-14',
    },
    {
      id: '3',
      symbol: 'INFY',
      type: 'change_percent',
      value: 5,
      currentValue: 1.01,
      isActive: false,
      createdAt: '2024-01-13',
    },
    {
      id: '4',
      symbol: 'HDFC',
      type: 'price_above',
      value: 1650,
      currentValue: 1675.30,
      isActive: true,
      createdAt: '2024-01-12',
    },
  ]);

  const [showAddAlert, setShowAddAlert] = useState(false);
  const [newAlert, setNewAlert] = useState({
    symbol: '',
    type: 'price_above' as Alert['type'],
    value: '',
  });

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

  const handleAddAlert = () => {
    if (newAlert.symbol && newAlert.value) {
      const alert: Alert = {
        id: Date.now().toString(),
        symbol: newAlert.symbol.toUpperCase(),
        type: newAlert.type,
        value: parseFloat(newAlert.value),
        currentValue: 0,
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0],
      };
      
      setAlerts([...alerts, alert]);
      alertToasts.alertCreated(newAlert.symbol.toUpperCase());
      setNewAlert({ symbol: '', type: 'price_above', value: '' });
      setShowAddAlert(false);
    }
  };

  const handleDeleteAlert = (id: string) => {
    const alertToDelete = alerts.find(alert => alert.id === id);
    setAlerts(alerts.filter(alert => alert.id !== id));
    if (alertToDelete) {
      alertToasts.alertDeleted(alertToDelete.symbol);
    }
  };

  const handleToggleAlert = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
    ));
  };

  const getAlertTypeLabel = (type: Alert['type']) => {
    const labels = {
      price_above: 'Price Above',
      price_below: 'Price Below',
      volume_high: 'High Volume',
      change_percent: 'Change %',
    };
    return labels[type];
  };

  const getAlertStatus = (alert: Alert) => {
    if (!alert.isActive) return { status: 'inactive', color: 'gray-500', bgColor: 'bg-gray-700' };
    
    switch (alert.type) {
      case 'price_above':
        return alert.currentValue >= alert.value 
          ? { status: 'triggered', color: 'red-400', bgColor: 'bg-red-900/20' }
          : { status: 'active', color: 'green-400', bgColor: 'bg-green-900/20' };
      case 'price_below':
        return alert.currentValue <= alert.value 
          ? { status: 'triggered', color: 'red-400', bgColor: 'bg-red-900/20' }
          : { status: 'active', color: 'green-400', bgColor: 'bg-green-900/20' };
      case 'change_percent':
        return Math.abs(alert.currentValue) >= alert.value 
          ? { status: 'triggered', color: 'red-400', bgColor: 'bg-red-900/20' }
          : { status: 'active', color: 'green-400', bgColor: 'bg-green-900/20' };
      default:
        return { status: 'active', color: 'green-400', bgColor: 'bg-green-900/20' };
    }
  };

  const triggeredAlerts = alerts.filter(a => {
    const status = getAlertStatus(a);
    return status.status === 'triggered';
  }).length;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b-2 border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Bell className="mr-3 text-yellow-400" size={28} />
              <h1 className="text-2xl font-bold text-gray-100">Price Alerts</h1>
            </div>
            <button 
              onClick={() => setShowAddAlert(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 border-2 border-blue-500 text-white hover:bg-blue-700 transition-colors font-semibold"
            >
              <Plus size={16} />
              <span>Add Alert</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alert Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Alerts"
            value={alerts.length.toString()}
            change="All time"
            changePercent={null}
            icon={Bell}
          />
          <StatCard
            title="Active Alerts"
            value={alerts.filter(a => a.isActive).length.toString()}
            change="Currently monitoring"
            changePercent={null}
            icon={Activity}
            color="text-green-400"
          />
          <StatCard
            title="Triggered"
            value={triggeredAlerts.toString()}
            change="Needs attention"
            changePercent={null}
            icon={AlertTriangle}
            color="text-red-400"
          />
          <StatCard
            title="Inactive"
            value={alerts.filter(a => !a.isActive).length.toString()}
            change="Paused alerts"
            changePercent={null}
            icon={Pause}
            color="text-gray-400"
          />
        </div>

        {/* Alerts List */}
        <div className="bg-gray-800 border-2 border-gray-700">
          <div className="p-6 border-b-2 border-gray-700">
            <h2 className="text-xl font-bold text-gray-100 flex items-center">
              <AlertTriangle className="mr-2" size={20} />
              Your Alerts
            </h2>
          </div>
          
          <div className="p-6">
            {alerts.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                <p className="text-gray-400 text-lg mb-6">No alerts set up yet</p>
                <button 
                  onClick={() => setShowAddAlert(true)}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 border-2 border-blue-500 text-white hover:bg-blue-700 transition-colors font-semibold mx-auto"
                >
                  <Plus size={16} />
                  <span>Create Your First Alert</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {alerts.map((alert) => {
                  const status = getAlertStatus(alert);
                  return (
                    <div key={alert.id} className={`border-2 border-gray-600 p-6 hover:bg-gray-700 transition-all duration-300 ${status.bgColor}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-4">
                            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-gray-100">{alert.symbol[0]}</span>
                            </div>
                            <div>
                              <h3 className="font-bold text-xl text-gray-100">{alert.symbol}</h3>
                              <div className={`inline-flex items-center px-3 py-1 text-xs font-semibold uppercase tracking-wide text-${status.color} border border-${status.color}`}>
                                {status.status === 'triggered' && <AlertTriangle size={12} className="mr-1" />}
                                {status.status === 'active' && <Activity size={12} className="mr-1" />}
                                {status.status === 'inactive' && <Pause size={12} className="mr-1" />}
                                {status.status}
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-400 font-semibold">Condition</p>
                              <p className="text-gray-100">{getAlertTypeLabel(alert.type)} ₹{alert.value}
                                {alert.type === 'change_percent' && '%'}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400 font-semibold">Current Value</p>
                              <p className={`font-semibold ${
                                status.status === 'triggered' ? 'text-red-400' : 'text-gray-100'
                              }`}>
                                ₹{alert.currentValue}{alert.type === 'change_percent' && '%'}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400 font-semibold">Created</p>
                              <p className="text-gray-100">{new Date(alert.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3 ml-6">
                          <button
                            onClick={() => handleToggleAlert(alert.id)}
                            className={`px-3 py-2 border-2 text-sm font-semibold transition-colors flex items-center space-x-1 ${
                              alert.isActive 
                                ? 'border-yellow-600 text-yellow-400 hover:bg-yellow-900/20' 
                                : 'border-green-600 text-green-400 hover:bg-green-900/20'
                            }`}
                          >
                            {alert.isActive ? <Pause size={14} /> : <Play size={14} />}
                            <span>{alert.isActive ? 'Pause' : 'Activate'}</span>
                          </button>
                          <button className="px-3 py-2 border-2 border-gray-600 text-gray-400 hover:bg-gray-600 hover:text-gray-100 transition-colors">
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteAlert(alert.id)}
                            className="px-3 py-2 border-2 border-red-600 text-red-400 hover:bg-red-900/20 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Alert Modal */}
      {showAddAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 border-2 border-gray-700 p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-100 mb-6">Add New Alert</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Stock Symbol</label>
                <input
                  type="text"
                  value={newAlert.symbol}
                  onChange={(e) => setNewAlert({ ...newAlert, symbol: e.target.value })}
                  placeholder="e.g., RELIANCE"
                  className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Alert Type</label>
                <select
                  value={newAlert.type}
                  onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value as Alert['type'] })}
                  className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 text-gray-100 focus:border-blue-500 focus:outline-none"
                >
                  <option value="price_above">Price Above</option>
                  <option value="price_below">Price Below</option>
                  <option value="change_percent">Change Percentage</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Target Value
                  {newAlert.type === 'change_percent' && ' (%)'}
                  {(newAlert.type === 'price_above' || newAlert.type === 'price_below') && ' (₹)'}
                </label>
                <input
                  type="number"
                  value={newAlert.value}
                  onChange={(e) => setNewAlert({ ...newAlert, value: e.target.value })}
                  placeholder="Enter target value"
                  className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex space-x-4 pt-8">
              <button 
                onClick={() => setShowAddAlert(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddAlert}
                className="flex-1 px-4 py-3 bg-blue-600 border-2 border-blue-500 text-white hover:bg-blue-700 transition-colors font-semibold"
              >
                Add Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsPage;
