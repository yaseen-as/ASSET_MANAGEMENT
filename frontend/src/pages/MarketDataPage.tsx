import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart3 } from 'lucide-react';

const MarketDataPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Mock market data
  const marketData = [
    {
      symbol: 'RELIANCE',
      price: 2456.75,
      change: 23.45,
      changePercent: 0.96,
      volume: 1234567,
      high: 2478.90,
      low: 2435.20,
    },
    {
      symbol: 'TCS',
      price: 3567.80,
      change: -45.20,
      changePercent: -1.25,
      volume: 987654,
      high: 3598.50,
      low: 3545.30,
    },
    {
      symbol: 'INFY',
      price: 1834.65,
      change: 18.30,
      changePercent: 1.01,
      volume: 2345678,
      high: 1847.90,
      low: 1825.40,
    },
    {
      symbol: 'HINDUNILVR',
      price: 2789.45,
      change: -12.55,
      changePercent: -0.45,
      volume: 567890,
      high: 2801.20,
      low: 2776.80,
    },
    {
      symbol: 'HDFCBANK',
      price: 1678.90,
      change: 31.20,
      changePercent: 1.89,
      volume: 3456789,
      high: 1687.45,
      low: 1665.30,
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-IN');
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Market Data</h1>
          <Button variant="outline">
            <Activity className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>

        {/* Market Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">NIFTY 50</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">21,456.78</div>
              <p className="text-xs text-green-600">+234.56 (+1.11%)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">SENSEX</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">71,234.89</div>
              <p className="text-xs text-green-600">+567.89 (+0.80%)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bank NIFTY</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45,123.45</div>
              <p className="text-xs text-red-600">-123.45 (-0.27%)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">IT Index</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">34,567.12</div>
              <p className="text-xs text-green-600">+89.34 (+0.26%)</p>
            </CardContent>
          </Card>
        </div>

        {/* Top Stocks Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Top Stocks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Symbol</th>
                    <th className="text-left py-3 px-4">Price</th>
                    <th className="text-left py-3 px-4">Change</th>
                    <th className="text-left py-3 px-4">Change %</th>
                    <th className="text-left py-3 px-4">Volume</th>
                    <th className="text-left py-3 px-4">High</th>
                    <th className="text-left py-3 px-4">Low</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {marketData.map((stock) => (
                    <tr key={stock.symbol} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{stock.symbol}</td>
                      <td className="py-3 px-4">{formatCurrency(stock.price)}</td>
                      <td className={`py-3 px-4 font-medium ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={stock.changePercent >= 0 ? 'secondary' : 'destructive'}>
                          {formatPercentage(stock.changePercent)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">{formatNumber(stock.volume)}</td>
                      <td className="py-3 px-4">{formatCurrency(stock.high)}</td>
                      <td className="py-3 px-4">{formatCurrency(stock.low)}</td>
                      <td className="py-3 px-4">
                        <Button variant="outline" size="sm">
                          Add to Portfolio
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Market News Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Market News</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="font-semibold text-lg">Sensex hits new all-time high</h3>
                <p className="text-gray-600 mt-2">
                  The BSE Sensex crossed 71,000 for the first time, driven by strong buying in banking and IT stocks.
                </p>
                <span className="text-sm text-gray-500">2 hours ago</span>
              </div>
              
              <div className="border-b pb-4">
                <h3 className="font-semibold text-lg">RBI maintains repo rate at 6.50%</h3>
                <p className="text-gray-600 mt-2">
                  The Reserve Bank of India kept the key policy rate unchanged, citing inflation concerns.
                </p>
                <span className="text-sm text-gray-500">5 hours ago</span>
              </div>
              
              <div className="border-b pb-4">
                <h3 className="font-semibold text-lg">Tech stocks rally on AI optimism</h3>
                <p className="text-gray-600 mt-2">
                  Information technology stocks gained momentum as investors showed confidence in AI-driven growth.
                </p>
                <span className="text-sm text-gray-500">1 day ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MarketDataPage;
