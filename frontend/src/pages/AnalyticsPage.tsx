import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieChartIcon, 
  Target,
  Calendar,
  DollarSign,
  Activity,
  RefreshCw,
  Filter,
  Download
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';

// Mock analytics data
const performanceData = [
  { month: 'Jan', portfolio: 85000, market: 82000, pnl: 5000 },
  { month: 'Feb', portfolio: 88000, market: 83500, pnl: -2000 },
  { month: 'Mar', portfolio: 82000, market: 81000, pnl: 8000 },
  { month: 'Apr', portfolio: 95000, market: 89000, pnl: 3000 },
  { month: 'May', portfolio: 105000, market: 95000, pnl: -1000 },
  { month: 'Jun', portfolio: 125000, market: 108000, pnl: 12000 },
];

const assetAllocation = [
  { name: 'Equity', value: 65, amount: 812500, color: '#1f2937' },
  { name: 'Mutual Funds', value: 20, amount: 250000, color: '#374151' },
  { name: 'Bonds', value: 10, amount: 125000, color: '#4b5563' },
  { name: 'Cash', value: 5, amount: 62500, color: '#6b7280' }
];

const topHoldings = [
  { symbol: 'RELIANCE', allocation: 15.2, value: 190000, pnl: 12500, pnlPercent: 7.04 },
  { symbol: 'TCS', allocation: 12.8, value: 160000, pnl: -8500, pnlPercent: -5.04 },
  { symbol: 'INFY', allocation: 10.5, value: 131250, pnl: 15250, pnlPercent: 13.15 },
  { symbol: 'HDFC', allocation: 9.2, value: 115000, pnl: 8750, pnlPercent: 8.23 },
  { symbol: 'WIPRO', allocation: 8.1, value: 101250, pnl: 3250, pnlPercent: 3.31 }
];

const riskMetrics = {
  sharpeRatio: 1.24,
  volatility: 18.5,
  beta: 0.92,
  maxDrawdown: -12.3,
  var: -15.8,
  diversificationScore: 82
};

const AnalyticsPage: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('6M');

  const StatCard = ({ title, value, change, changePercent, icon: Icon, color = 'text-gray-100' }) => (
    <div className="bg-gray-800 border-2 border-gray-700 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">{title}</p>
          <p className={`text-2xl font-bold mt-2 ${color}`}>{value}</p>
          {change && (
            <div className={`flex items-center mt-2 text-xs ${change.includes('+') ? 'text-green-400' : 'text-red-400'}`}>
              {change.includes('+') ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
              <span>{change}</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-gray-700 text-gray-100 rounded-full">
          <Icon size={24} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b-2 border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-100">Portfolio Analytics</h1>
            <div className="flex items-center space-x-4">
              {/* Timeframe selector */}
              <div className="flex bg-gray-700 border-2 border-gray-600">
                {['1M', '3M', '6M', '1Y'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedTimeframe(period)}
                    className={`px-3 py-1 text-sm font-semibold transition-colors ${
                      selectedTimeframe === period
                        ? 'bg-gray-600 text-gray-100'
                        : 'text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-700 border-2 border-gray-600 text-gray-100 hover:bg-gray-600 transition-colors font-semibold">
                <Download size={16} />
                <span>Export Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Performance Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Return"
            value="+18.5%"
            change="vs market: +6.2%"
            changePercent={null}
            icon={TrendingUp}
            color="text-green-400"
          />
          <StatCard
            title="Sharpe Ratio"
            value={riskMetrics.sharpeRatio.toString()}
            change="Risk-adjusted"
            changePercent={null}
            icon={Target}
          />
          <StatCard
            title="Volatility"
            value={`${riskMetrics.volatility}%`}
            change="Annualized"
            changePercent={null}
            icon={Activity}
          />
          <StatCard
            title="Max Drawdown"
            value={`${riskMetrics.maxDrawdown}%`}
            change=""
            changePercent={null}
            icon={TrendingDown}
            color="text-red-400"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Portfolio vs Market Performance */}
          <div className="bg-gray-800 border-2 border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-100 mb-6 flex items-center">
              <BarChart3 className="mr-2" size={20} />
              Portfolio vs Market Performance
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgb(31, 41, 55)', 
                      border: '2px solid #4b5563',
                      borderRadius: '0',
                      color: '#f3f4f6'
                    }} 
                  />
                  <Line type="monotone" dataKey="portfolio" stroke="#10b981" strokeWidth={3} name="Portfolio" />
                  <Line type="monotone" dataKey="market" stroke="#6b7280" strokeWidth={2} name="Market" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Asset Allocation */}
          <div className="bg-gray-800 border-2 border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-100 mb-6 flex items-center">
              <PieChartIcon className="mr-2" size={20} />
              Asset Allocation
            </h2>
            <div className="h-48 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    dataKey="value"
                    data={assetAllocation}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    stroke="#9ca3af"
                    strokeWidth={2}
                  >
                    {assetAllocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgb(31, 41, 55)', 
                      border: '2px solid #4b5563',
                      borderRadius: '0',
                      color: '#f3f4f6'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {assetAllocation.map((asset, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 border border-gray-600 mr-2"
                      style={{ backgroundColor: asset.color }}
                    />
                    <span className="text-sm font-medium text-gray-100">{asset.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-100">₹{asset.amount.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">{asset.value}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly P&L Chart */}
        <div className="bg-gray-800 border-2 border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-100 mb-6">Monthly P&L Analysis</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgb(31, 41, 55)', 
                    border: '2px solid #4b5563',
                    borderRadius: '0',
                    color: '#f3f4f6'
                  }} 
                />
                <Bar 
                  dataKey="pnl" 
                  name="Monthly P&L"
                >
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Row - Holdings Analysis & Risk Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Holdings Performance */}
          <div className="bg-gray-800 border-2 border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-100 mb-6">Top Holdings Analysis</h2>
            <div className="space-y-4">
              {topHoldings.map((holding, index) => (
                <div key={index} className="border border-gray-600 p-4 hover:bg-gray-700 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-100">{holding.symbol[0]}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-100">{holding.symbol}</h3>
                        <p className="text-xs text-gray-400">{holding.allocation}% allocation</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-100">₹{holding.value.toLocaleString()}</div>
                      <div className={`text-sm font-semibold ${holding.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {holding.pnl >= 0 ? '+' : ''}₹{holding.pnl.toLocaleString()} ({holding.pnlPercent >= 0 ? '+' : ''}{holding.pnlPercent.toFixed(2)}%)
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-gray-400 h-2 rounded-full"
                      style={{ width: `${holding.allocation}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Analysis Dashboard */}
          <div className="bg-gray-800 border-2 border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-100 mb-6">Risk Analysis</h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-100">Portfolio Beta</span>
                  <span className="text-sm font-bold text-gray-100">{riskMetrics.beta}</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-3">
                  <div
                    className="bg-blue-500 h-3 rounded-full"
                    style={{ width: `${Math.min(riskMetrics.beta * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Lower than market volatility</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-100">Diversification Score</span>
                  <span className="text-sm font-bold text-gray-100">{riskMetrics.diversificationScore}/100</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full" 
                    style={{ width: `${riskMetrics.diversificationScore}%` }} 
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Well diversified portfolio</p>
              </div>

              <div className="bg-gray-750 border border-gray-600 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-100 mb-3">Risk Metrics Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">VaR (95%)</div>
                    <div className="font-semibold text-red-400">{riskMetrics.var}%</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Max Drawdown</div>
                    <div className="font-semibold text-red-400">{riskMetrics.maxDrawdown}%</div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-900/20 border border-blue-800 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-300 mb-2">Portfolio Assessment</h4>
                <p className="text-sm text-blue-200">
                  Your portfolio demonstrates moderate risk with excellent diversification. 
                  The current beta suggests lower volatility than the market, while maintaining good returns.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
