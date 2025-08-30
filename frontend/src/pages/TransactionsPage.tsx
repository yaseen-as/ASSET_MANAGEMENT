import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ArrowUpRight, ArrowDownLeft, Search, Filter, Download } from 'lucide-react';

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
  ]);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'ALL' || transaction.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'secondary';
      case 'PENDING':
        return 'outline';
      case 'FAILED':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const totalBuyAmount = transactions
    .filter(t => t.type === 'BUY' && t.status === 'COMPLETED')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSellAmount = transactions
    .filter(t => t.type === 'SELL' && t.status === 'COMPLETED')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
              <ArrowDownLeft className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(totalBuyAmount)}
              </div>
              <p className="text-xs text-muted-foreground">
                {transactions.filter(t => t.type === 'BUY' && t.status === 'COMPLETED').length} transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalSellAmount)}
              </div>
              <p className="text-xs text-muted-foreground">
                {transactions.filter(t => t.type === 'SELL' && t.status === 'COMPLETED').length} transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                totalSellAmount - totalBuyAmount >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(totalSellAmount - totalBuyAmount)}
              </div>
              <p className="text-xs text-muted-foreground">
                Sales minus purchases
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filter Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by symbol..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                {['ALL', 'BUY', 'SELL'].map((type) => (
                  <Button
                    key={type}
                    variant={filterType === type ? "default" : "outline"}
                    onClick={() => setFilterType(type)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    {type}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No transactions found matching your criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Symbol</th>
                      <th className="text-left py-3 px-4">Type</th>
                      <th className="text-left py-3 px-4">Quantity</th>
                      <th className="text-left py-3 px-4">Price</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          {new Date(transaction.date).toLocaleDateString('en-IN')}
                        </td>
                        <td className="py-3 px-4 font-medium">{transaction.symbol}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            {transaction.type === 'BUY' ? (
                              <ArrowDownLeft className="h-4 w-4 text-red-600 mr-1" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                            )}
                            <span className={transaction.type === 'BUY' ? 'text-red-600' : 'text-green-600'}>
                              {transaction.type}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">{transaction.quantity}</td>
                        <td className="py-3 px-4">{formatCurrency(transaction.price)}</td>
                        <td className="py-3 px-4 font-medium">
                          <span className={transaction.type === 'BUY' ? 'text-red-600' : 'text-green-600'}>
                            {transaction.type === 'BUY' ? '-' : '+'}{formatCurrency(transaction.amount)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={getStatusColor(transaction.status)}>
                            {transaction.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TransactionsPage;
