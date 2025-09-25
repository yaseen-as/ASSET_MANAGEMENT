import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Search,
  Filter,
  RefreshCw,
  Star,
  Activity,
  BarChart3,
  DollarSign,
  Clock,
  Globe,
  Plus
} from 'lucide-react';

// Enhanced mock market data
const marketIndices = [
  { name: 'NIFTY 50', value: 23486.50, change: 156.75, changePercent: 0.67 },
  { name: 'SENSEX', value: 77234.20, change: 298.45, changePercent: 0.39 },
  { name: 'NIFTY BANK', value: 51678.90, change: -234.60, changePercent: -0.45 },
  { name: 'NIFTY IT', value: 32145.80, change: 412.30, changePercent: 1.30 }
];

const topStocks = [
  { symbol: 'RELIANCE', price: 2456.75, change: 32.50, changePercent: 1.34, volume: '2.5M', marketCap: '16.6L Cr', high: 2478.90, low: 2435.20 },
  { symbol: 'TCS', price: 3421.80, change: -15.20, changePercent: -0.44, volume: '1.8M', marketCap: '12.4L Cr', high: 3450.50, low: 3410.30 },
  { symbol: 'INFY', price: 1523.45, change: 28.90, changePercent: 1.93, volume: '3.2M', marketCap: '6.3L Cr', high: 1540.20, low: 1510.80 },
  { symbol: 'HDFC', price: 1654.30, change: 42.75, changePercent: 2.65, volume: '2.1M', marketCap: '9.1L Cr', high: 1670.45, low: 1640.20 },
  { symbol: 'ICICIBANK', price: 987.60, change: -15.40, changePercent: -1.53, volume: '4.5M', marketCap: '6.9L Cr', high: 1005.80, low: 982.30 },
  { symbol: 'WIPRO', price: 420.30, change: 8.50, changePercent: 2.06, volume: '2.8M', marketCap: '2.3L Cr', high: 425.60, low: 415.20 }
];

const sectorPerformance = [
  { sector: 'Banking', change: 2.34, stocks: ['HDFC', 'ICICI', 'SBI'] },
  { sector: 'IT', change: 1.87, stocks: ['TCS', 'INFY', 'WIPRO'] },
  { sector: 'Auto', change: -0.95, stocks: ['MARUTI', 'M&M', 'TATA MOTORS'] },
  { sector: 'Pharma', change: 3.21, stocks: ['SUN PHARMA', 'CIPLA', 'LUPIN'] },
  { sector: 'FMCG', change: 0.78, stocks: ['HUL', 'ITC', 'NESTLE'] },
  { sector: 'Energy', change: 1.45, stocks: ['RELIANCE', 'ONGC', 'IOC'] }
];

const marketNews = [
  { 
    headline: 'Markets hit record highs as IT sector shows strong growth',
    summary: 'Technology stocks led the rally with INFY and TCS showing exceptional performance in Q3 results.',
    time: '15 minutes ago'
  },
  {
    headline: 'Banking stocks rally on positive quarterly results', 
    summary: 'HDFC Bank and ICICI Bank reported better-than-expected earnings for the quarter.',
    time: '1 hour ago'
  },
  {
    headline: 'Oil prices impact energy sector performance today',
    summary: 'Rising crude oil prices boost energy sector stocks including Reliance and ONGC.',
    time: '2 hours ago'
  }
];

const MarketDataPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'gainers' | 'losers'>('all');
  
  const filteredStocks = topStocks.filter(stock => {
    const matchesSearch = stock.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = 
      selectedCategory === 'all' || 
      (selectedCategory === 'gainers' && stock.change > 0) ||
      (selectedCategory === 'losers' && stock.change < 0);
    return matchesSearch && matchesCategory;
  });

  const StatCard = ({ title, value, change, changePercent, icon: Icon }) => (
    <div className="bg-gray-800 border-2 border-gray-700 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-gray-100 mt-2">{value.toLocaleString()}</p>
          <div className={`flex items-center mt-2 ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span className="text-sm font-semibold ml-1">
              {change >= 0 ? '+' : ''}{change.toFixed(2)} ({changePercent.toFixed(2)}%)
            </span>
          </div>
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
            <h1 className="text-2xl font-bold text-gray-100">Market Data</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-400">
                <Clock size={16} />
                <span className="text-sm">Last updated: {new Date().toLocaleTimeString()}</span>
              </div>
              <button className="p-2 border-2 border-gray-500 hover:bg-gray-600 hover:text-gray-100 transition-colors">
                <RefreshCw size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Market Indices */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {marketIndices.map((index, i) => (
            <StatCard
              key={i}
              title={index.name}
              value={index.value}
              change={index.change}
              changePercent={index.changePercent}
              icon={BarChart3}
            />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Stock Search and Filter */}
          <div className="lg:col-span-2 bg-gray-800 border-2 border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-100">Live Stocks</h2>
              <div className="flex items-center space-x-2 text-gray-400">
                <Activity size={16} className="animate-pulse" />
                <span className="text-sm">Live</span>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search stocks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="text-gray-400" size={20} />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as 'all' | 'gainers' | 'losers')}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 text-gray-100 focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                >
                  <option value="all">All Stocks</option>
                  <option value="gainers">Top Gainers</option>
                  <option value="losers">Top Losers</option>
                </select>
              </div>
            </div>

            {/* Stocks Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Symbol</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Change</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">High/Low</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Volume</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredStocks.map((stock, index) => (
                    <tr key={index} className="hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center mr-3">
                            <span className="text-xs font-bold text-gray-100">{stock.symbol[0]}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-100">{stock.symbol}</span>
                            <div className="text-xs text-gray-400">{stock.marketCap}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-100">₹{stock.price.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          <div className="flex items-center">
                            {stock.change >= 0 ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
                            {stock.change >= 0 ? '+' : ''}₹{stock.change.toFixed(2)}
                          </div>
                          <div className="text-xs">({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-100">
                          <div>H: ₹{stock.high.toLocaleString()}</div>
                          <div className="text-gray-400">L: ₹{stock.low.toLocaleString()}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">{stock.volume}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button className="p-1 border border-gray-500 hover:bg-gray-600 hover:text-gray-100 transition-colors">
                            <Star size={16} />
                          </button>
                          <button className="p-1 border border-gray-500 hover:bg-gray-600 hover:text-gray-100 transition-colors">
                            <Plus size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sector Performance */}
          <div className="bg-gray-800 border-2 border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-100 mb-6 flex items-center">
              <Globe className="mr-2" size={20} />
              Sector Performance
            </h2>
            <div className="space-y-4">
              {sectorPerformance.map((sector, index) => (
                <div key={index} className="border border-gray-600 p-4 hover:bg-gray-700 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-100">{sector.sector}</h3>
                    <span className={`text-sm font-semibold ${sector.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {sector.change >= 0 ? '+' : ''}{sector.change.toFixed(2)}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mb-2">
                    Top stocks: {sector.stocks.join(', ')}
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${sector.change >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(Math.abs(sector.change) * 20, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Market News Section */}
        <div className="bg-gray-800 border-2 border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-100 mb-6">Market News & Updates</h2>
          <div className="space-y-4">
            {marketNews.map((news, index) => (
              <div key={index} className="border border-gray-600 p-4 hover:bg-gray-700 transition-colors">
                <h3 className="font-semibold text-gray-100 mb-2">{news.headline}</h3>
                <p className="text-sm text-gray-300 mb-2">{news.summary}</p>
                <p className="text-xs text-gray-400">{news.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketDataPage;
