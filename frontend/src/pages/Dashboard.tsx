import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchPortfolio } from '../store/slices/portfolioSlice';
import { logout } from '../store/slices/authSlice';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { holdings, totalValue, totalPnl, totalPnlPercentage, isLoading } = useSelector(
    (state: RootState) => state.portfolio
  );

  useEffect(() => {
    dispatch(fetchPortfolio());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
  };

  const swingHoldings = holdings.filter(h => h.category === 'swing');
  const longTermHoldings = holdings.filter(h => h.category === 'long-term');
  const swingValue = swingHoldings.reduce((sum, h) => sum + (h.currentPrice * h.quantity), 0);
  const longTermValue = longTermHoldings.reduce((sum, h) => sum + (h.currentPrice * h.quantity), 0);

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Asset Manager Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, {user?.name}</span>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total Portfolio Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  ₹{totalValue.toLocaleString('en-IN')}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total P&L
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${totalPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalPnl >= 0 ? '+' : ''}₹{totalPnl.toLocaleString('en-IN')}
                </div>
                <div className={`text-sm ${totalPnlPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalPnlPercentage >= 0 ? '+' : ''}{totalPnlPercentage.toFixed(2)}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500">
                  Swing Trading
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  ₹{swingValue.toLocaleString('en-IN')}
                </div>
                <div className="text-sm text-gray-500">
                  {totalValue > 0 ? ((swingValue / totalValue) * 100).toFixed(1) : 0}% of portfolio
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500">
                  Long-term Investment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  ₹{longTermValue.toLocaleString('en-IN')}
                </div>
                <div className="text-sm text-gray-500">
                  {totalValue > 0 ? ((longTermValue / totalValue) * 100).toFixed(1) : 0}% of portfolio
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Holdings</CardTitle>
            </CardHeader>
            <CardContent>
              {holdings.slice(0, 5).map((holding) => (
                <div key={holding.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div>
                    <div className="font-medium">{holding.ticker}</div>
                    <div className="text-sm text-gray-500">{holding.quantity} shares</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">₹{(holding.currentPrice * holding.quantity).toLocaleString('en-IN')}</div>
                    <div className={`text-sm ${holding.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {holding.pnl >= 0 ? '+' : ''}₹{holding.pnl.toFixed(2)} ({holding.pnlPercentage.toFixed(2)}%)
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Allocation Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Swing Trading</span>
                  <span className="font-medium">{totalValue > 0 ? ((swingValue / totalValue) * 100).toFixed(1) : 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${totalValue > 0 ? (swingValue / totalValue) * 100 : 0}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Long-term Investment</span>
                  <span className="font-medium">{totalValue > 0 ? ((longTermValue / totalValue) * 100).toFixed(1) : 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${totalValue > 0 ? (longTermValue / totalValue) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
