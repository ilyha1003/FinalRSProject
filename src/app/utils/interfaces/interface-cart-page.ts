export interface Cart {
  id: string;
  lineItems: LineItem[];
  totalPrice: TotalPrice;
  totalLineItemQuantity?: number;
}

export interface LineItem {
  id: string;
  productId: string;
  quantity: number;
  name: Record<string, string>;
  variant: ProductVariant;
  price: ProductPrice;
}

export interface ProductName {
  'en-US': string;
}

export interface TotalPrice {
  centAmount: number;
}

export interface ProductVariant {
  images: ProductImages[];
}

export interface ProductImages {
  url: string;
}

export interface ProductPrice {
  value: ProductValue;
}

export interface ProductValue {
  centAmount: number;
  usd: string;
  totalUsd: string;
}
