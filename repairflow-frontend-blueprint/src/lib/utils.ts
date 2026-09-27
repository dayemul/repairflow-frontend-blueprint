export function cn(...classes: (string | boolean | undefined | null | { [key: string]: boolean })[]): string {
  const result: string[] = [];

  for (const item of classes) {
    if (!item) continue;
    if (typeof item === 'string') {
      result.push(item);
    } else if (typeof item === 'object') {
      for (const [key, value] of Object.entries(item)) {
        if (value) result.push(key);
      }
    }
  }

  return result.join(' ');
}

export function formatCurrency(
  amount: number | undefined | null,
  currency: string = 'BDT',
  symbol: string = '৳'
): string {
  const value = amount || 0;
  try {
    const formatted = new Intl.NumberFormat('en-BD', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
    return `${symbol} ${formatted}`;
  } catch {
    return `${symbol} ${value.toFixed(2)}`;
  }
}

export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string | undefined | null): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function generateCode(prefix: string, length = 6): string {
  const num = Math.floor(Math.random() * Math.pow(10, length))
    .toString()
    .padStart(length, '0');
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${num}`;
}
