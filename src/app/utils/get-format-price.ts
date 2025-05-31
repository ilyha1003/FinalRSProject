export const getFormatPrice = (lang: string, price: number): string => {
  return new Intl.NumberFormat(lang, {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};
