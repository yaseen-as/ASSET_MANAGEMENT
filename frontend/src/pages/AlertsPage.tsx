import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Bell, Plus, Trash2, Edit, AlertTriangle } from 'lucide-react';

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
  ]);

  const [showAddAlert, setShowAddAlert] = useState(false);
  const [newAlert, setNewAlert] = useState({
    symbol: '',
    type: 'price_above' as Alert['type'],
    value: '',
  });

  const handleAddAlert = () => {
    if (newAlert.symbol && newAlert.value) {
      const alert: Alert = {
        id: Date.now().toString(),
        symbol: newAlert.symbol.toUpperCase(),
        type: newAlert.type,
        value: parseFloat(newAlert.value),
        currentValue: 0, // Will be updated by market data
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0],
      };
      
      setAlerts([...alerts, alert]);
      setNewAlert({ symbol: '', type: 'price_above', value: '' });
      setShowAddAlert(false);
    }
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
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
    if (!alert.isActive) return { status: 'inactive', color: 'gray' };
    
    switch (alert.type) {
      case 'price_above':
        return alert.currentValue >= alert.value 
          ? { status: 'triggered', color: 'red' }
          : { status: 'active', color: 'green' };
      case 'price_below':
        return alert.currentValue <= alert.value 
          ? { status: 'triggered', color: 'red' }
          : { status: 'active', color: 'green' };
      case 'change_percent':
        return Math.abs(alert.currentValue) >= alert.value 
          ? { status: 'triggered', color: 'red' }
          : { status: 'active', color: 'green' };
      default:
        return { status: 'active', color: 'green' };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Price Alerts</h1>
          <Button onClick={() => setShowAddAlert(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Alert
          </Button>
        </div>

        {/* Alert Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{alerts.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {alerts.filter(a => a.isActive).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Triggered</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {alerts.filter(a => {
                  const status = getAlertStatus(a);
                  return status.status === 'triggered';
                }).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive</CardTitle>
              <Bell className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-400">
                {alerts.filter(a => !a.isActive).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No alerts set up yet</p>
                <Button onClick={() => setShowAddAlert(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Alert
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {alerts.map((alert) => {
                  const status = getAlertStatus(alert);
                  return (
                    <div key={alert.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-lg">{alert.symbol}</h3>
                            <Badge 
                              variant={
                                status.status === 'triggered' ? 'destructive' :
                                status.status === 'active' ? 'secondary' : 'outline'
                              }
                            >
                              {status.status}
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>
                              <strong>Condition:</strong> {getAlertTypeLabel(alert.type)} ₹{alert.value}
                              {alert.type === 'change_percent' && '%'}
                            </p>
                            <p>
                              <strong>Current:</strong> ₹{alert.currentValue}
                              {alert.type === 'change_percent' && '%'}
                            </p>
                            <p>
                              <strong>Created:</strong> {new Date(alert.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleAlert(alert.id)}
                          >
                            {alert.isActive ? 'Pause' : 'Activate'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAlert(alert.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Alert Modal */}
        {showAddAlert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Add New Alert</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="symbol">Stock Symbol</Label>
                  <Input
                    id="symbol"
                    value={newAlert.symbol}
                    onChange={(e) => setNewAlert({ ...newAlert, symbol: e.target.value })}
                    placeholder="e.g., RELIANCE"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="type">Alert Type</Label>
                  <select
                    id="type"
                    value={newAlert.type}
                    onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value as Alert['type'] })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="price_above">Price Above</option>
                    <option value="price_below">Price Below</option>
                    <option value="change_percent">Change Percentage</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="value">
                    Target Value
                    {newAlert.type === 'change_percent' && ' (%)'}
                    {(newAlert.type === 'price_above' || newAlert.type === 'price_below') && ' (₹)'}
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    value={newAlert.value}
                    onChange={(e) => setNewAlert({ ...newAlert, value: e.target.value })}
                    placeholder="Enter target value"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddAlert(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button onClick={handleAddAlert} className="flex-1">
                  Add Alert
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsPage;
