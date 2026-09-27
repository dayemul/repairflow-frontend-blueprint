import React from 'react';
import { formatDate, formatDateTime } from '@/lib/utils';

export const DateDisplay: React.FC<{
  value: string | undefined | null;
  showTime?: boolean;
  className?: string;
}> = ({ value, showTime = false, className }) => {
  return (
    <span className={className}>
      {showTime ? formatDateTime(value) : formatDate(value)}
    </span>
  );
};
