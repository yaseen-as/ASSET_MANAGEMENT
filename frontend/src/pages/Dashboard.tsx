import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Star, 
  Activity, 
  DollarSign, 
  PieChart, 
  BarChart3,
  Plus,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  Bookmark,
  Bell,
  RefreshCw,
  LogOut
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, AreaChart, Area, Pie } from 'recharts';
import type { RootState } from '../store/store';
import { fetchPortfolioAsync } from '../store/slices/portfolioSlice';
import { logout } from '../store/slices/authSlice';
import type { AppDispatch } from '../store/store';

// Mock data for charts and additional features
const portfolioHistoryData = [
  { month: 'Jan', value: 100000 },
  { month: 'Feb', value: 105000 },
  { month: 'Mar', value: 98000 },
  { month: 'Apr', value: 112000 },
  { month: 'May', value: 125000 },
  { month: 'Jun', value: 138000 }
];

const sectorAllocation = [
  { name: 'Technology', value: 35, color: '#1f2937' },
  { name: 'Banking', value: 25, color: '#374151' },
  { name: 'Healthcare', value: 20, color: '#4b5563' },
  { name: 'Energy', value: 12, color: '#6b7280' },
  { name: 'Others', value: 8, color: '#9ca3af' }
];

const watchlistStocks = [
  { symbol: 'RELIANCE', price: 2456.75, change: 2.5, changePercent: 0.10 },
  { symbol: 'TCS', price: 3421.80, change: -15.20, changePercent: -0.44 },
  { symbol: 'INFY', price: 1523.45, change: 8.90, changePercent: 0.59 },
  { symbol: 'HDFC', price: 1654.30, change: 12.75, changePercent: 0.78 },
  { symbol: 'ICICIBANK', price: 987.60, change: -5.40, changePercent: -0.54 }
];

const recentRecommendations = [
  { 
    symbol: 'WIPRO', 
    action: 'BUY', 
    targetPrice: 485.50, 
    currentPrice: 420.30, 
    confidence: 87, 
    date: '2024-06-03',
    performance: 8.5
  },
  { 
    symbol: 'MARUTI', 
    action: 'HOLD', 
    targetPrice: 11250.00, 
    currentPrice: 10890.75, 
    confidence: 72, 
    date: '2024-06-02',
    performance: 2.3
  },
  { 
    symbol: 'BAJFINANCE', 
    action: 'SELL', 
    targetPrice: 6800.00, 
    currentPrice: 7145.25, 
    confidence: 91, 
    date: '2024-06-01',
    performance: -4.8
  }
];

const marketIndices = [
  { name: 'NIFTY 50', value: 23486.50, change: 156.75, changePercent: 0.67 },
  { name: 'SENSEX', value: 77234.20, change: 298.45, changePercent: 0.39 },
  { name: 'NIFTY BANK', value: 51678.90, change: -234.60, changePercent: -0.45 }
];

const topMovers = {
  gainers: [
    { symbol: 'ADANIPORTS', change: 5.67 },
    { symbol: 'COALINDIA', change: 4.23 },
    { symbol: 'NTPC', change: 3.89 }
  ],
  losers: [
    { symbol: 'BHARTIARTL', change: -2.45 },
    { symbol: 'HCLTECH', change: -1.98 },
    { symbol: 'TECHM', change: -1.67 }
  ]
};

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { holdings, totalValue, totalPnl, totalPnlPercentage, isLoading } = useSelector(
    (state: RootState) => state.portfolio
  );

  const [selectedTimeframe, setSelectedTimeframe] = useState('6M');

  useEffect(() => {
    dispatch(fetchPortfolioAsync());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
  };

  // Calculate day's change (mock for now)
  const dayChange = totalPnl * 0.1; // Mock 10% of total P&L as today's change
  const dayChangePercent = totalPnlPercentage * 0.1;

  const StatCard = ({ title, value, change, changePercent, icon: Icon, prefix = '₹', suffix = '' }) => (
    <div className="bg-gray-800 border-2 border-gray-700 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-gray-100 mt-2">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
          {change !== undefined && (
            <div className={`flex items-center mt-2 ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {change >= 0 ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              <span className="text-sm font-semibold ml-1">
                {prefix}{Math.abs(change).toLocaleString()} ({Math.abs(changePercent).toFixed(2)}%)
              </span>
            </div>
          )}
        </div>
        <div className="p-3 bg-gray-700 text-gray-100 rounded-full">
          <Icon size={24} />
        </div>
      </div>
    </div>
  );

  const WatchlistCard = () => (
    <div className="bg-gray-800 border-2 border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-100 flex items-center">
          <Eye className="mr-2" size={20} />
          Watchlist
        </h2>
        <button className="p-2 border-2 border-gray-500 hover:bg-gray-600 hover:text-gray-100 transition-colors">
          <Plus size={16} />
        </button>
      </div>
      <div className="space-y-4">
        {watchlistStocks.map((stock, index) => (
          <div key={index} className="flex items-center justify-between p-3 border border-gray-600 hover:bg-gray-700 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-700 text-gray-100 rounded-full flex items-center justify-center text-sm font-bold">
                {stock.symbol[0]}
              </div>
              <div>
                <p className="font-semibold text-gray-100">{stock.symbol}</p>
                <p className="text-sm text-gray-400">₹{stock.price.toLocaleString()}</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`flex items-center ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {stock.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span className="ml-1 font-semibold">
                  {stock.changePercent.toFixed(2)}%
                </span>
              </div>
              <div className="flex space-x-2 mt-2">
                <button className="p-1 border border-gray-500 hover:bg-gray-600 hover:text-gray-100 transition-colors">
                  <Activity size={12} />
                </button>
                <button className="p-1 border border-gray-500 hover:bg-gray-600 hover:text-gray-100 transition-colors">
                  <Bookmark size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const RecommendationsCard = () => (
    <div className="bg-gray-800 border-2 border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-100 flex items-center">
          <Star className="mr-2" size={20} />
          Recent Recommendations
        </h2>
        <button className="text-sm font-semibold text-gray-100 hover:underline flex items-center">
          View All <ArrowRight size={16} className="ml-1" />
        </button>
      </div>
      <div className="space-y-4">
        {recentRecommendations.map((rec, index) => (
          <div key={index} className="border border-gray-600 p-4 hover:bg-gray-700 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 text-xs font-bold border-2 ${
                  rec.action === 'BUY' ? 'border-green-500 bg-green-500 text-gray-100' :
                  rec.action === 'SELL' ? 'border-red-500 bg-red-500 text-gray-100' :
                  'border-gray-500 bg-gray-500 text-gray-100'
                }`}>
                  {rec.action}
                </span>
                <span className="font-bold text-gray-100">{rec.symbol}</span>
              </div>
              <span className={`text-sm font-semibold ${rec.performance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {rec.performance >= 0 ? '+' : ''}{rec.performance}%
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Target</p>
                <p className="font-semibold text-gray-100">₹{rec.targetPrice.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-400">Current</p>
                <p className="font-semibold text-gray-100">₹{rec.currentPrice.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-400">Confidence</p>
                <p className="font-semibold text-gray-100">{rec.confidence}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const MarketSnapshotCard = () => (
    <div className="bg-gray-800 border-2 border-gray-700 p-6">
      <h2 className="text-xl font-bold text-gray-100 flex items-center mb-6">
        <BarChart3 className="mr-2" size={20} />
        Market Snapshot
      </h2>
      
      <div className="space-y-4 mb-6">
        {marketIndices.map((index, i) => (
          <div key={i} className="flex items-center justify-between p-3 border border-gray-600">
            <div>
              <p className="font-semibold text-gray-100">{index.name}</p>
              <p className="text-lg font-bold text-gray-100">{index.value.toLocaleString()}</p>
            </div>
            <div className={`text-right ${index.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              <div className="flex items-center justify-end">
                {index.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span className="ml-1 font-semibold">{index.changePercent.toFixed(2)}%</span>
              </div>
              <p className="text-sm">
                {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold text-gray-100 mb-3 flex items-center">
            <TrendingUp size={16} className="mr-1" />
            Top Gainers
          </h3>
          {topMovers.gainers.map((stock, i) => (
            <div key={i} className="flex justify-between items-center py-1">
              <span className="text-sm font-medium text-gray-100">{stock.symbol}</span>
              <span className="text-sm font-semibold text-green-400">+{stock.change}%</span>
            </div>
          ))}
        </div>
        <div>
          <h3 className="font-semibold text-gray-100 mb-3 flex items-center">
            <TrendingDown size={16} className="mr-1" />
            Top Losers
          </h3>
          {topMovers.losers.map((stock, i) => (
            <div key={i} className="flex justify-between items-center py-1">
              <span className="text-sm font-medium text-gray-100">{stock.symbol}</span>
              <span className="text-sm font-semibold text-red-400">{stock.change}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="animate-spin text-gray-400" size={24} />
          <span className="text-gray-400 text-lg">Loading Portfolio...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b-2 border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-100">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Welcome, {user?.name}</span>
              <button 
                onClick={() => dispatch(fetchPortfolioAsync())}
                className="p-2 border-2 border-gray-500 hover:bg-gray-600 hover:text-gray-100 transition-colors"
              >
                <RefreshCw size={20} />
              </button>
              <button className="p-2 border-2 border-gray-500 hover:bg-gray-600 hover:text-gray-100 transition-colors">
                <Bell size={20} />
              </button>
              <button 
                onClick={handleLogout}
                className="p-2 border-2 border-gray-500 hover:bg-gray-600 hover:text-gray-100 transition-colors"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Portfolio Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Portfolio Value"
            value={totalValue}
            change={dayChange}
            changePercent={dayChangePercent}
            icon={DollarSign}
          />
          <StatCard
            title="Day's Gain/Loss"
            value={`${dayChange >= 0 ? '+' : ''}${dayChange.toLocaleString()}`}
            icon={dayChange >= 0 ? TrendingUp : TrendingDown}
            change={dayChange}
            changePercent={dayChangePercent}
            prefix=""
          />
          <StatCard
            title="Total P&L"
            value={`${totalPnl >= 0 ? '+' : ''}${totalPnl.toLocaleString()}`}
            change={totalPnl}
            changePercent={totalPnlPercentage}
            icon={totalPnl >= 0 ? TrendingUp : TrendingDown}
          />
          <StatCard
            title="Active Positions"
            value={holdings.length}
            change={0}
            changePercent={0}
            icon={Activity}
            prefix=""
          />
        </div>

        {/* Portfolio Chart and Allocation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-gray-800 border-2 border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-100">Portfolio Performance</h2>
              <div className="flex space-x-2">
                {['1D', '1W', '1M', '3M', '6M', '1Y'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedTimeframe(period)}
                    className={`px-3 py-1 text-sm font-semibold border-2 transition-colors ${
                      selectedTimeframe === period
                        ? 'border-gray-300 bg-gray-700 text-gray-100'
                        : 'border-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={portfolioHistoryData}>
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
                  <Area type="monotone" dataKey="value" stroke="#9ca3af" fill="#374151" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gray-800 border-2 border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-100 mb-6 flex items-center">
              <PieChart className="mr-2" size={20} />
              Sector Allocation
            </h2>
            <div className="h-48 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    dataKey="value"
                    data={sectorAllocation}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    stroke="#9ca3af"
                    strokeWidth={2}
                  >
                    {sectorAllocation.map((entry, index) => (
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
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {sectorAllocation.map((sector, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 border border-gray-600 mr-2"
                      style={{ backgroundColor: sector.color }}
                    />
                    <span className="text-sm font-medium text-gray-100">{sector.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-100">{sector.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row - Watchlist, Recommendations, Market Snapshot */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <WatchlistCard />
          <RecommendationsCard />
          <MarketSnapshotCard />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
