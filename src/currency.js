export const formatPrice = (priceInRupees) => {
  return `₹${Math.round(priceInRupees || 0).toLocaleString('en-IN')}`;
};