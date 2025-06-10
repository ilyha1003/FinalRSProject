export interface Cart {
  id: string;
  lineItems: LineItem[];
}

interface LineItem {
  id: string;
  productId: string;
}
