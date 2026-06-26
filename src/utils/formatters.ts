/**
 * Formats a number to Indian Rupee (INR) currency string.
 * @param value - The number to format.
 * @param maximumFractionDigits - The maximum number of fraction digits to use (defaults to 0).
 * @returns The formatted currency string.
 */
export const formatINR = (value: number, maximumFractionDigits: number = 0): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits
  }).format(value);
};
