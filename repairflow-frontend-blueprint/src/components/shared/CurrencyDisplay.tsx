import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

export const CurrencyDisplay: React.FC<{
  amount: number | undefined | null;
  currency?: string;
  symbol?: string;
  className?: string;
}> = ({ amount, currency = 'BDT', symbol = '৳', className }) => {
  return <span className={cn('font-semibold font-mono tracking-tight', className)}>{formatCurrency(amount, currency, symbol)}</span>;
};
