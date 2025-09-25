import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  DollarSign,
  Activity,
  BarChart3,
  RefreshCw,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { RootState, AppDispatch } from '../store/store';
import { fetchPortfolioAsync } from '../store/slices/portfolioSlice';
import AddHoldingModal from '../components/AddHoldingModal';

const PortfolioPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { holdings, totalValue, totalPnl, totalPnlPercentage, isLoading } = useSelector(
    (state: RootState) => state.portfolio
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'swing' | 'long-term'>('all');

  useEffect(() => {
    dispatch(fetchPortfolioAsync());
  }, [dispatch]);

  const filteredHoldings = holdings.filter(holding => {
    const matchesSearch = holding.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (holding.ticker && holding.ticker.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterBy === 'all' || holding.category === filterBy;
    return matchesSearch && matchesFilter;
  });

  const StatCard = ({ title, value, change, changePercent, icon: Icon, prefix = '₹' }) => (
    <div className="bg-gray-800 border-2 border-gray-700 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-gray-100 mt-2">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
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
            <h1 className="text-2xl font-bold text-gray-100">Portfolio</h1>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => dispatch(fetchPortfolioAsync())}
                className="p-2 border-2 border-gray-500 hover:bg-gray-600 hover:text-gray-100 transition-colors"
              >
                <RefreshCw size={20} />
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 border-2 border-gray-600 text-gray-100 hover:bg-gray-600 transition-colors font-semibold"
              >
                <Plus size={20} />
                <span>Add Holding</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Portfolio Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Portfolio Value"
            value={totalValue}
            change={totalPnl}
            changePercent={totalPnlPercentage}
            icon={DollarSign}
          />
          <StatCard
            title="Total P&L"
            value={`${totalPnl >= 0 ? '+' : ''}${totalPnl.toLocaleString()}`}
            change={totalPnl}
            changePercent={totalPnlPercentage}
            icon={totalPnl >= 0 ? TrendingUp : TrendingDown}
          />
          <StatCard
            title="Holdings Count"
            value={holdings.length}
            change={0}
            changePercent={0}
            icon={BarChart3}
            prefix=""
          />
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-gray-800 border-2 border-gray-700 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search holdings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="text-gray-400" size={20} />
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as 'all' | 'swing' | 'long-term')}
                className="px-4 py-2 bg-gray-700 border border-gray-600 text-gray-100 focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              >
                <option value="all">All Holdings</option>
                <option value="swing">Swing Trading</option>
                <option value="long-term">Long-term</option>
              </select>
            </div>
          </div>
        </div>

        {/* Holdings Table */}
        <div className="bg-gray-800 border-2 border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-gray-100">Holdings ({filteredHoldings.length})</h2>
          </div>

          {filteredHoldings.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Activity className="mx-auto h-12 w-12 text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">No holdings found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || filterBy !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Start building your portfolio by adding your first holding'
                }
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-700 border-2 border-gray-600 text-gray-100 hover:bg-gray-600 transition-colors font-semibold"
              >
                <Plus size={16} />
                <span>Add First Holding</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-750">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Symbol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Avg Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Current Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Market Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      P&L
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredHoldings.map((holding) => (
                    <tr key={holding.id} className="hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-bold text-gray-100">
                              {holding.symbol[0]}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-100">{holding.symbol}</div>
                            <div className="text-sm text-gray-400">{holding.ticker || holding.symbol}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold border-2 ${
                          holding.category === 'swing' 
                            ? 'bg-blue-900 text-blue-100 border-blue-700' 
                            : 'bg-green-900 text-green-100 border-green-700'
                        }`}>
                          {holding.category || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                        {holding.quantity.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                        ₹{holding.avgPrice.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                        ₹{holding.currentPrice.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                        ₹{(holding.currentPrice * holding.quantity).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${
                          (holding.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          <div className="flex items-center">
                            {(holding.pnl || 0) >= 0 ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
                            {(holding.pnl || 0) >= 0 ? '+' : ''}₹{(holding.pnl || 0).toLocaleString()}
                          </div>
                          <div className="text-xs">
                            ({(holding.pnlPercentage || 0) >= 0 ? '+' : ''}{(holding.pnlPercentage || 0).toFixed(2)}%)
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="p-1 border border-gray-500 hover:bg-gray-600 hover:text-gray-100 transition-colors">
                            <Edit size={16} />
                          </button>
                          <button className="p-1 border border-gray-500 hover:bg-gray-600 hover:text-gray-100 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <AddHoldingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default PortfolioPage;
