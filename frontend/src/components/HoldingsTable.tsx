import React from 'react';
import { Holding } from '../hooks/usePortfolio';
import { cn } from '../lib/utils';

interface HoldingsTableProps {
  holdings: Holding[];
  isLoading?: boolean;
}

export const HoldingsTable: React.FC<HoldingsTableProps> = ({
  holdings,
  isLoading = false,
}) => {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getPnlColor = (pnl: number) => {
    return pnl >= 0 ? 'text-green-400' : 'text-red-400';
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-4">Holdings</h3>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex justify-between items-center py-3 border-b border-gray-700">
                <div className="flex-1">
                  <div className="h-4 bg-gray-700 rounded w-20 mb-1"></div>
                  <div className="h-3 bg-gray-700 rounded w-16"></div>
                </div>
                <div className="flex-1 text-center">
                  <div className="h-4 bg-gray-700 rounded w-16 mx-auto"></div>
                </div>
                <div className="flex-1 text-center">
                  <div className="h-4 bg-gray-700 rounded w-20 mx-auto"></div>
                </div>
                <div className="flex-1 text-right">
                  <div className="h-4 bg-gray-700 rounded w-16 ml-auto mb-1"></div>
                  <div className="h-3 bg-gray-700 rounded w-12 ml-auto"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (holdings.length === 0) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-4">Holdings</h3>
        <div className="text-center py-8">
          <p className="text-gray-400 text-lg">No holdings found</p>
          <p className="text-gray-500 text-sm mt-2">
            Add your first holding to start tracking your portfolio
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-white mb-4">
        Holdings ({holdings.length})
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-2 text-gray-300 font-medium">Symbol</th>
              <th className="text-center py-3 px-2 text-gray-300 font-medium">Qty</th>
              <th className="text-center py-3 px-2 text-gray-300 font-medium">Avg Price</th>
              <th className="text-center py-3 px-2 text-gray-300 font-medium">Current Price</th>
              <th className="text-center py-3 px-2 text-gray-300 font-medium">Investment</th>
              <th className="text-center py-3 px-2 text-gray-300 font-medium">Current Value</th>
              <th className="text-right py-3 px-2 text-gray-300 font-medium">P&L</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((holding) => (
              <tr key={holding.id} className="border-b border-gray-700 hover:bg-gray-750">
                <td className="py-3 px-2">
                  <div>
                    <p className="text-white font-medium">{holding.ticker}</p>
                    <p className="text-xs text-gray-400 uppercase">
                      {holding.category}
                    </p>
                  </div>
                </td>
                <td className="text-center py-3 px-2 text-gray-300">
                  {holding.quantity}
                </td>
                <td className="text-center py-3 px-2 text-gray-300">
                  {formatCurrency(holding.buyPrice)}
                </td>
                <td className="text-center py-3 px-2 text-gray-300">
                  {formatCurrency(holding.currentPrice)}
                </td>
                <td className="text-center py-3 px-2 text-gray-300">
                  {formatCurrency(holding.investment)}
                </td>
                <td className="text-center py-3 px-2 text-gray-300">
                  {formatCurrency(holding.currentValue)}
                </td>
                <td className="text-right py-3 px-2">
                  <div>
                    <p className={cn('font-medium', getPnlColor(holding.pnl))}>
                      {formatCurrency(holding.pnl)}
                    </p>
                    <p className={cn('text-xs', getPnlColor(holding.pnl))}>
                      {formatPercentage(holding.pnlPercentage)}
                    </p>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};