/**
 * Formats a number as USD currency.
 * Safely handles non-numeric inputs by returning $0.00.
 */
export const formatUSD = (amount) => {
  const numericAmount = parseFloat(amount);
  return isNaN(numericAmount)
    ? "$0.00"
    : `$${numericAmount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
};

/**
 * Normalizes timestamps to human-readable strings for the 3D UI.
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
