import React from 'react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changePercent?: number;
  icon?: React.ComponentType<{ className?: string }>;
  isLoading?: boolean;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changePercent,
  icon: Icon,
  isLoading = false,
  className,
}) => {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return val.toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    }
    return val;
  };

  const formatChange = (val: number) => {
    const formatted = Math.abs(val).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return val >= 0 ? `+${formatted}` : `-${formatted}`;
  };

  const getChangeColor = () => {
    if (change === undefined) return 'text-gray-400';
    return change >= 0 ? 'text-green-400' : 'text-red-400';
  };

  if (isLoading) {
    return (
      <div className={cn('bg-gray-800 p-6 rounded-lg', className)}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/2 mb-3"></div>
          <div className="h-8 bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-700 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-gray-800 p-6 rounded-lg', className)}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {Icon && <Icon className="h-6 w-6 text-gray-400" />}
      </div>
      <p className="text-2xl font-bold text-white mb-1">
        {formatValue(value)}
      </p>
      {change !== undefined && changePercent !== undefined && (
        <p className={cn('text-sm', getChangeColor())}>
          {formatChange(change)} ({changePercent >= 0 ? '+' : ''}
          {changePercent.toFixed(2)}%)
        </p>
      )}
    </div>
  );
};