import React from 'react';
import { useMarketIndices, useMarketOverview } from '../hooks/useMarketData';
import { cn } from '../lib/utils';

export const MarketOverview: React.FC = () => {
  const { data: indices, isLoading: indicesLoading } = useMarketIndices();
  const { data: overview, isLoading: overviewLoading } = useMarketOverview();

  const formatPrice = (price: number) => {
    return price.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-white mb-4">Market Overview</h3>
      
      {/* Market Indices */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-300 mb-3">Indices</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {indicesLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-700 rounded p-3">
                  <div className="h-4 bg-gray-600 rounded w-20 mb-2"></div>
                  <div className="h-6 bg-gray-600 rounded w-24"></div>
                </div>
              </div>
            ))
          ) : (
            indices?.map((index) => (
              <div key={index.symbol} className="bg-gray-700 rounded p-3">
                <p className="text-gray-300 text-sm font-medium">{index.symbol}</p>
                <p className="text-white text-lg font-bold">
                  {formatPrice(index.price)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Popular Stocks */}
      <div>
        <h4 className="text-md font-medium text-gray-300 mb-3">Popular Stocks</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {overviewLoading ? (
            [...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-700 rounded p-3">
                  <div className="h-4 bg-gray-600 rounded w-16 mb-1"></div>
                  <div className="h-5 bg-gray-600 rounded w-20"></div>
                </div>
              </div>
            ))
          ) : (
            overview?.map((stock) => (
              <div key={stock.symbol} className="bg-gray-700 rounded p-3">
                <p className="text-gray-300 text-xs font-medium">{stock.symbol}</p>
                <p className="text-white text-sm font-semibold">
                  ₹{formatPrice(stock.price)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Last Updated */}
      <div className="mt-4 text-right">
        <p className="text-xs text-gray-500">
          Last updated: {new Date().toLocaleTimeString('en-IN')}
        </p>
      </div>
    </div>
  );
};