import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Filter, 
  Download,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Activity,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';

interface Transaction {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  amount: number;
  date: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
}

const TransactionsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  
  // Mock transaction data
  const [transactions] = useState<Transaction[]>([
    {
      id: '1',
      symbol: 'RELIANCE',
      type: 'BUY',
      quantity: 10,
      price: 2450.50,
      amount: 24505.00,
      date: '2024-01-20',
      status: 'COMPLETED',
    },
    {
      id: '2',
      symbol: 'TCS',
      type: 'BUY',
      quantity: 5,
      price: 3580.75,
      amount: 17903.75,
      date: '2024-01-18',
      status: 'COMPLETED',
    },
    {
      id: '3',
      symbol: 'INFY',
      type: 'SELL',
      quantity: 8,
      price: 1820.25,
      amount: 14562.00,
      date: '2024-01-15',
      status: 'COMPLETED',
    },
    {
      id: '4',
      symbol: 'HDFCBANK',
      type: 'BUY',
      quantity: 12,
      price: 1675.00,
      amount: 20100.00,
      date: '2024-01-12',
      status: 'PENDING',
    },
    {
      id: '5',
      symbol: 'WIPRO',
      type: 'BUY',
      quantity: 25,
      price: 420.80,
      amount: 10520.00,
      date: '2024-01-10',
      status: 'FAILED',
    },
    {
      id: '6',
      symbol: 'HDFC',
      type: 'SELL',
      quantity: 15,
      price: 1680.50,
      amount: 25207.50,
      date: '2024-01-08',
      status: 'COMPLETED',
    },
  ]);

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

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || transaction.type === filterType;
    const matchesStatus = filterStatus === 'ALL' || transaction.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle size={14} className="text-green-400" />;
      case 'PENDING':
        return <Clock size={14} className="text-yellow-400" />;
      case 'FAILED':
        return <X size={14} className="text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-400 border-green-400 bg-green-900/20';
      case 'PENDING':
        return 'text-yellow-400 border-yellow-400 bg-yellow-900/20';
      case 'FAILED':
        return 'text-red-400 border-red-400 bg-red-900/20';
      default:
        return 'text-gray-400 border-gray-400';
    }
  };

  const totalBuyAmount = transactions
    .filter(t => t.type === 'BUY' && t.status === 'COMPLETED')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSellAmount = transactions
    .filter(t => t.type === 'SELL' && t.status === 'COMPLETED')
    .reduce((sum, t) => sum + t.amount, 0);

  const netFlow = totalSellAmount - totalBuyAmount;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b-2 border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Activity className="mr-3 text-blue-400" size={28} />
              <h1 className="text-2xl font-bold text-gray-100">Transaction History</h1>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 border-2 border-green-500 text-white hover:bg-green-700 transition-colors font-semibold">
              <Download size={16} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Purchases"
            value={formatCurrency(totalBuyAmount)}
            change={`${transactions.filter(t => t.type === 'BUY' && t.status === 'COMPLETED').length} transactions`}
            changePercent={null}
            icon={ArrowDownLeft}
            color="text-red-400"
          />
          <StatCard
            title="Total Sales"
            value={formatCurrency(totalSellAmount)}
            change={`${transactions.filter(t => t.type === 'SELL' && t.status === 'COMPLETED').length} transactions`}
            changePercent={null}
            icon={ArrowUpRight}
            color="text-green-400"
          />
          <StatCard
            title="Net Flow"
            value={formatCurrency(netFlow)}
            change="Sales minus purchases"
            changePercent={null}
            icon={netFlow >= 0 ? TrendingUp : TrendingDown}
            color={netFlow >= 0 ? 'text-green-400' : 'text-red-400'}
          />
          <StatCard
            title="Total Transactions"
            value={transactions.length.toString()}
            change="All time"
            changePercent={null}
            icon={Activity}
          />
        </div>

        {/* Filters and Search */}
        <div className="bg-gray-800 border-2 border-gray-700 mb-8">
          <div className="p-6 border-b-2 border-gray-700">
            <h2 className="text-xl font-bold text-gray-100 flex items-center">
              <Filter className="mr-2" size={20} />
              Filter Transactions
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Search */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Search Symbol</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    placeholder="Search by symbol..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border-2 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Transaction Type Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Transaction Type</label>
                <div className="flex bg-gray-700 border-2 border-gray-600">
                  {['ALL', 'BUY', 'SELL'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`flex-1 px-3 py-3 text-sm font-semibold transition-colors ${
                        filterType === type
                          ? 'bg-gray-600 text-gray-100'
                          : 'text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Status</label>
                <div className="flex bg-gray-700 border-2 border-gray-600">
                  {['ALL', 'COMPLETED', 'PENDING', 'FAILED'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`flex-1 px-2 py-3 text-xs font-semibold transition-colors ${
                        filterStatus === status
                          ? 'bg-gray-600 text-gray-100'
                          : 'text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-gray-800 border-2 border-gray-700">
          <div className="p-6 border-b-2 border-gray-700">
            <h2 className="text-xl font-bold text-gray-100">All Transactions</h2>
            <p className="text-gray-400 mt-1">Showing {filteredTransactions.length} of {transactions.length} transactions</p>
          </div>
          <div className="p-6">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                <p className="text-gray-400 text-lg mb-4">No transactions found matching your criteria.</p>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('ALL');
                    setFilterStatus('ALL');
                  }}
                  className="px-4 py-2 bg-blue-600 border-2 border-blue-500 text-white hover:bg-blue-700 transition-colors font-semibold"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-700">
                      <th className="text-left py-4 px-4 text-gray-300 font-semibold">Date</th>
                      <th className="text-left py-4 px-4 text-gray-300 font-semibold">Symbol</th>
                      <th className="text-left py-4 px-4 text-gray-300 font-semibold">Type</th>
                      <th className="text-left py-4 px-4 text-gray-300 font-semibold">Quantity</th>
                      <th className="text-left py-4 px-4 text-gray-300 font-semibold">Price</th>
                      <th className="text-left py-4 px-4 text-gray-300 font-semibold">Amount</th>
                      <th className="text-left py-4 px-4 text-gray-300 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction, index) => (
                      <tr 
                        key={transaction.id} 
                        className={`border-b border-gray-700 hover:bg-gray-750 transition-colors ${
                          index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'
                        }`}
                      >
                        <td className="py-4 px-4 text-gray-100">
                          <div className="flex items-center space-x-2">
                            <Calendar size={14} className="text-gray-400" />
                            <span>{new Date(transaction.date).toLocaleDateString('en-IN')}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-gray-100">{transaction.symbol[0]}</span>
                            </div>
                            <span className="font-semibold text-gray-100">{transaction.symbol}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className={`inline-flex items-center space-x-1 px-3 py-1 border text-sm font-semibold ${
                            transaction.type === 'BUY' 
                              ? 'text-red-400 border-red-400 bg-red-900/20' 
                              : 'text-green-400 border-green-400 bg-green-900/20'
                          }`}>
                            {transaction.type === 'BUY' ? (
                              <ArrowDownLeft size={12} />
                            ) : (
                              <ArrowUpRight size={12} />
                            )}
                            <span>{transaction.type}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-100 font-medium">{transaction.quantity.toLocaleString()}</td>
                        <td className="py-4 px-4 text-gray-100">{formatCurrency(transaction.price)}</td>
                        <td className="py-4 px-4 font-bold">
                          <span className={transaction.type === 'BUY' ? 'text-red-400' : 'text-green-400'}>
                            {transaction.type === 'BUY' ? '-' : '+'}{formatCurrency(transaction.amount)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-semibold uppercase tracking-wide border ${getStatusColor(transaction.status)}`}>
                            {getStatusIcon(transaction.status)}
                            <span>{transaction.status}</span>
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
      </div>
    </div>
  );
};

export default TransactionsPage;
