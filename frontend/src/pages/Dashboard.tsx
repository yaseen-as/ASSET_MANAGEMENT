import React from 'react';
import { useAuth } from '../context/AuthContext';
import { usePortfolio, useSyncPortfolio } from '../hooks/usePortfolio';
import { StatCard } from '../components/ui/stat-card';
import { HoldingsTable } from '../components/HoldingsTable';
import { MarketOverview } from '../components/MarketOverview';
import { Button } from '../components/ui/button';
import { showToast } from '../lib/toast';

// Icons (you can install lucide-react for these)
const DollarSign = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
  </svg>
);

const TrendingUp = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const Briefcase = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6" />
  </svg>
);

const Refresh = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { data: portfolio, isLoading: portfolioLoading, error: portfolioError } = usePortfolio();
  const syncPortfolio = useSyncPortfolio();

  const handleLogout = async () => {
    await logout();
  };

  const handleSync = () => {
    syncPortfolio.mutate();
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  // Calculate additional metrics
  const swingHoldings = portfolio?.holdings.filter(h => h.category === 'SWING') || [];
  const longTermHoldings = portfolio?.holdings.filter(h => h.category === 'LONG_TERM') || [];
  
  const totalInvestment = portfolio?.holdings.reduce((sum, h) => sum + h.investment, 0) || 0;

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Portfolio Dashboard</h1>
            <p className="text-gray-400 mt-1">Welcome back, {user?.name}</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleSync}
              disabled={syncPortfolio.isPending}
              variant="outline"
              size="sm"
              className="text-white border-gray-600 hover:bg-gray-700"
            >
              <Refresh className={`h-4 w-4 mr-2 ${syncPortfolio.isPending ? 'animate-spin' : ''}`} />
              {syncPortfolio.isPending ? 'Syncing...' : 'Sync Portfolio'}
            </Button>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="text-white border-gray-600 hover:bg-gray-700"
            >
              <Refresh className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button 
              onClick={handleLogout}
              variant="destructive"
              size="sm"
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Error State */}
        {portfolioError && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-300">
                  Failed to load portfolio data
                </h3>
                <div className="mt-2 text-sm text-red-200">
                  <p>Please check your connection and try again.</p>
                </div>
                <div className="mt-4">
                  <Button
                    onClick={handleRefresh}
                    variant="outline"
                    size="sm"
                    className="text-red-300 border-red-600 hover:bg-red-800"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Portfolio Value"
            value={portfolio?.totalValue || 0}
            icon={DollarSign}
            isLoading={portfolioLoading}
          />
          
          <StatCard
            title="Total P&L"
            value={portfolio?.totalPnl || 0}
            change={portfolio?.totalPnl}
            changePercent={portfolio?.totalPnlPercentage}
            icon={TrendingUp}
            isLoading={portfolioLoading}
          />
          
          <StatCard
            title="Total Investment"
            value={totalInvestment}
            icon={Briefcase}
            isLoading={portfolioLoading}
          />
          
          <StatCard
            title="Active Holdings"
            value={portfolio?.holdings.length || 0}
            icon={Briefcase}
            isLoading={portfolioLoading}
          />
        </div>

        {/* Category Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <StatCard
            title="Swing Trading"
            value={portfolio?.swingValue || 0}
            className="bg-blue-900/20 border border-blue-700"
            isLoading={portfolioLoading}
          />
          
          <StatCard
            title="Long Term"
            value={portfolio?.longTermValue || 0}
            className="bg-green-900/20 border border-green-700"
            isLoading={portfolioLoading}
          />
        </div>

        {/* Market Overview */}
        <div className="mb-8">
          <MarketOverview />
        </div>

        {/* Holdings Table */}
        <div className="mb-8">
          <HoldingsTable 
            holdings={portfolio?.holdings || []} 
            isLoading={portfolioLoading}
          />
        </div>

        {/* Quick Stats */}
        {portfolio && portfolio.holdings.length > 0 && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-gray-400 text-sm">Swing Holdings</p>
                <p className="text-white text-lg font-semibold">{swingHoldings.length}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Long Term Holdings</p>
                <p className="text-white text-lg font-semibold">{longTermHoldings.length}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Best Performer</p>
                <p className="text-green-400 text-lg font-semibold">
                  {portfolio.holdings.length > 0 
                    ? portfolio.holdings.reduce((best, current) => 
                        current.pnlPercentage > best.pnlPercentage ? current : best
                      ).ticker
                    : '-'
                  }
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Worst Performer</p>
                <p className="text-red-400 text-lg font-semibold">
                  {portfolio.holdings.length > 0 
                    ? portfolio.holdings.reduce((worst, current) => 
                        current.pnlPercentage < worst.pnlPercentage ? current : worst
                      ).ticker
                    : '-'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!portfolioLoading && portfolio && portfolio.holdings.length === 0 && (
          <div className="bg-gray-800 p-8 rounded-lg text-center">
            <Briefcase className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Start Building Your Portfolio</h3>
            <p className="text-gray-400 mb-6">
              Add your first holding to start tracking your investments and see real-time performance data.
            </p>
            <Button
              onClick={() => window.location.href = '/portfolio'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add First Holding
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
