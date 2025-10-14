import React, { useState } from 'react';

const PortfolioPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const mockHoldings = [
    { id: '1', symbol: 'RELIANCE', quantity: 100, avgPrice: 2400, currentPrice: 2456.75 },
    { id: '2', symbol: 'TCS', quantity: 50, avgPrice: 3400, currentPrice: 3421.80 },
    { id: '3', symbol: 'INFY', quantity: 75, avgPrice: 1500, currentPrice: 1523.45 }
  ];

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Portfolio</h1>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Holding
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Total Value</h3>
            <p className="text-2xl font-bold text-green-400">₹5,80,652</p>
            <p className="text-sm text-gray-400">+₹10,152 (1.78%)</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Total P&L</h3>
            <p className="text-2xl font-bold text-green-400">+₹10,152</p>
            <p className="text-sm text-gray-400">+1.78%</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Holdings</h3>
            <p className="text-2xl font-bold text-white">{mockHoldings.length}</p>
            <p className="text-sm text-gray-400">Active positions</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase">Symbol</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase">Quantity</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase">Avg Price</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase">Current Price</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase">Total Value</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase">P&L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {mockHoldings.map((holding) => {
                  const totalValue = holding.quantity * holding.currentPrice;
                  const pnl = holding.quantity * (holding.currentPrice - holding.avgPrice);
                  const pnlPercentage = ((holding.currentPrice - holding.avgPrice) / holding.avgPrice) * 100;
                  
                  return (
                    <tr key={holding.id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                            {holding.symbol[0]}
                          </div>
                          <div className="text-sm font-bold text-gray-100">{holding.symbol}</div>
                        </div>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-100">
                        ₹{totalValue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className={pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                          <div className="font-semibold">
                            {pnl >= 0 ? '+' : ''}₹{pnl.toLocaleString()}
                          </div>
                          <div className="text-xs">
                            {pnl >= 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPage;
