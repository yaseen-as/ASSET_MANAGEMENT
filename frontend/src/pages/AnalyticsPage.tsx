import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { TrendingUp, TrendingDown, PieChart, BarChart3, Calendar, Download } from 'lucide-react';

const AnalyticsPage: React.FC = () => {
  const { holdings } = useSelector((state: RootState) => state.portfolio);

  // Mock analytics data
  const [analyticsData, setAnalyticsData] = useState({
    monthlyPnL: [
      { month: 'Jan', value: 5000 },
      { month: 'Feb', value: -2000 },
      { month: 'Mar', value: 8000 },
      { month: 'Apr', value: 3000 },
      { month: 'May', value: -1000 },
      { month: 'Jun', value: 12000 },
    ],
    sectorAllocation: [
      { sector: 'Technology', value: 45000, percentage: 35 },
      { sector: 'Banking', value: 38000, percentage: 30 },
      { sector: 'Healthcare', value: 25000, percentage: 20 },
      { sector: 'Energy', value: 19000, percentage: 15 },
    ],
    topPerformers: [
      { symbol: 'RELIANCE', gain: 15.5, value: 25000 },
      { symbol: 'TCS', gain: 12.3, value: 20000 },
      { symbol: 'INFY', gain: 8.7, value: 15000 },
    ],
    riskMetrics: {
      sharpeRatio: 1.24,
      volatility: 18.5,
      beta: 0.92,
      maxDrawdown: -12.3,
    },
  });

  const [selectedTimeframe, setSelectedTimeframe] = useState('6M');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const generateReport = () => {
    // Mock report generation
    console.log('Generating portfolio report...');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Portfolio Analytics</h1>
          <div className="flex space-x-4">
            <div className="flex bg-white rounded-lg border">
              {['1M', '3M', '6M', '1Y', 'ALL'].map((timeframe) => (
                <button
                  key={timeframe}
                  onClick={() => setSelectedTimeframe(timeframe)}
                  className={`px-4 py-2 text-sm font-medium ${
                    selectedTimeframe === timeframe
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 hover:text-gray-900'
                  } ${timeframe === '1M' ? 'rounded-l-lg' : ''} ${
                    timeframe === 'ALL' ? 'rounded-r-lg' : ''
                  }`}
                >
                  {timeframe}
                </button>
              ))}
            </div>
            <Button onClick={generateReport}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Return</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">+18.5%</div>
              <p className="text-xs text-muted-foreground">vs. market: +12.3%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.riskMetrics.sharpeRatio}</div>
              <p className="text-xs text-muted-foreground">Risk-adjusted return</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Volatility</CardTitle>
              <TrendingDown className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.riskMetrics.volatility}%</div>
              <p className="text-xs text-muted-foreground">Annualized</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Max Drawdown</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {analyticsData.riskMetrics.maxDrawdown}%
              </div>
              <p className="text-xs text-muted-foreground">Worst decline</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly P&L Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Monthly P&L Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between space-x-2">
                {analyticsData.monthlyPnL.map((data, index) => (
                  <div key={data.month} className="flex flex-col items-center flex-1">
                    <div
                      className={`w-full ${
                        data.value >= 0 ? 'bg-green-500' : 'bg-red-500'
                      } rounded-t`}
                      style={{
                        height: `${Math.abs(data.value) / 200}px`,
                        minHeight: '4px',
                      }}
                    />
                    <span className="text-xs text-gray-600 mt-2">{data.month}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sector Allocation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                Sector Allocation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.sectorAllocation.map((sector, index) => (
                  <div key={sector.sector} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][index],
                        }}
                      />
                      <span className="font-medium">{sector.sector}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(sector.value)}</div>
                      <div className="text-sm text-gray-600">{sector.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.topPerformers.map((stock, index) => (
                  <div key={stock.symbol} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-lg font-bold text-green-600">#{index + 1}</div>
                      <div>
                        <div className="font-semibold">{stock.symbol}</div>
                        <div className="text-sm text-gray-600">{formatCurrency(stock.value)}</div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      +{stock.gain}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Risk Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Portfolio Beta</span>
                    <span className="text-sm font-bold">{analyticsData.riskMetrics.beta}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${analyticsData.riskMetrics.beta * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Lower than market volatility</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Diversification Score</span>
                    <span className="text-sm font-bold">82/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '82%' }} />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Well diversified portfolio</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Risk Assessment</h4>
                  <p className="text-sm text-blue-800">
                    Your portfolio shows moderate risk with good diversification across sectors. 
                    Consider rebalancing if any sector exceeds 40% allocation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
