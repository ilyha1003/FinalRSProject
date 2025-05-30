export const getShortDescription = (
  product: string,
  maxLength: number,
): string => {
  return product.length > maxLength
    ? product.slice(0, maxLength) + '...'
    : product;
};
