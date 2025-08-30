import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import { addHolding } from '../store/slices/portfolioSlice';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { X } from 'lucide-react';

interface AddHoldingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddHoldingModal: React.FC<AddHoldingModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    symbol: '',
    quantity: '',
    avgPrice: '',
    exchange: 'NSE',
  });

  const dispatch = useDispatch<AppDispatch>();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const holdingData = {
      symbol: formData.symbol.toUpperCase(),
      quantity: parseInt(formData.quantity),
      avgPrice: parseFloat(formData.avgPrice),
      exchange: formData.exchange as 'NSE' | 'BSE',
      currentPrice: parseFloat(formData.avgPrice), // Will be updated by market data
    };

    dispatch(addHolding(holdingData));
    onClose();
    
    // Reset form
    setFormData({
      symbol: '',
      quantity: '',
      avgPrice: '',
      exchange: 'NSE',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add New Holding</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="symbol">Stock Symbol</Label>
            <Input
              id="symbol"
              name="symbol"
              type="text"
              required
              value={formData.symbol}
              onChange={handleChange}
              placeholder="e.g., RELIANCE"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              required
              min="1"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="Number of shares"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="avgPrice">Average Price</Label>
            <Input
              id="avgPrice"
              name="avgPrice"
              type="number"
              step="0.01"
              required
              min="0"
              value={formData.avgPrice}
              onChange={handleChange}
              placeholder="Price per share"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="exchange">Exchange</Label>
            <select
              id="exchange"
              name="exchange"
              value={formData.exchange}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="NSE">NSE</option>
              <option value="BSE">BSE</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add Holding
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHoldingModal;
