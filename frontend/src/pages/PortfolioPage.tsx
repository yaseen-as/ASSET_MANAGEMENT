import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchPortfolioAsync } from '../store/slices/portfolioSlice';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Plus, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import AddHoldingModal from '../components/AddHoldingModal';
import PortfolioChart from '../components/PortfolioChart';

const PortfolioPage: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { holdings, totalValue, totalPnl, isLoading } = useSelector((state: RootState) => state.portfolio);

  useEffect(() => {
    dispatch(fetchPortfolioAsync());
  }, [dispatch]);

  const handleSyncPortfolio = () => {
    // Sync with Angel One API
    dispatch(fetchPortfolioAsync());
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Portfolio Management</h1>
          <div className="flex space-x-4">
            <Button onClick={handleSyncPortfolio} variant="outline" disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Sync Portfolio
            </Button>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Holding
            </Button>
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
              {totalPnl >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalPnl)}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatPercentage((totalPnl / (totalValue - totalPnl)) * 100)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Holdings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{holdings.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Portfolio Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Portfolio Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <PortfolioChart />
          </CardContent>
        </Card>

        {/* Holdings Table */}
        <Card>
          <CardHeader>
            <CardTitle>Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            {holdings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No holdings found. Add your first holding to get started.</p>
                <Button onClick={() => setShowAddModal(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Holding
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Symbol</th>
                      <th className="text-left py-3 px-4">Quantity</th>
                      <th className="text-left py-3 px-4">Avg Price</th>
                      <th className="text-left py-3 px-4">Current Price</th>
                      <th className="text-left py-3 px-4">Market Value</th>
                      <th className="text-left py-3 px-4">P&L</th>
                      <th className="text-left py-3 px-4">P&L %</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map((holding) => {
                      const pnl = (holding.currentPrice - holding.avgPrice) * holding.quantity;
                      const pnlPercentage = ((holding.currentPrice - holding.avgPrice) / holding.avgPrice) * 100;
                      const marketValue = holding.currentPrice * holding.quantity;

                      return (
                        <tr key={holding.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{holding.symbol}</td>
                          <td className="py-3 px-4">{holding.quantity}</td>
                          <td className="py-3 px-4">{formatCurrency(holding.avgPrice)}</td>
                          <td className="py-3 px-4">{formatCurrency(holding.currentPrice)}</td>
                          <td className="py-3 px-4">{formatCurrency(marketValue)}</td>
                          <td className={`py-3 px-4 font-medium ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(pnl)}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={pnl >= 0 ? 'secondary' : 'destructive'}>
                              {formatPercentage(pnlPercentage)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Holding Modal */}
        {showAddModal && (
          <AddHoldingModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default PortfolioPage;
