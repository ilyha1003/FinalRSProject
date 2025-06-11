export interface Cart {
  id: string;
  lineItems: LineItem[];
  totalPrice: TotalPrice;
}

export interface LineItem {
  id: string;
  productId: string;
  quantity: number;
  name: Record<string, string>;
  variant: ProductVariant;
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
