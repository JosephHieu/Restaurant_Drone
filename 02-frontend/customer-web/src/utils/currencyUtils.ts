// Currency constants
export const USD_TO_VND = 25000;

// Format VND currency
export const formatVND = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

// Convert USD to VND
export const convertToVND = (usdAmount: number): number => {
  return usdAmount * USD_TO_VND;
};
