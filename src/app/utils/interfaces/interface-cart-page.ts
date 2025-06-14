export interface Cart {
  id: string;
  lineItems: LineItem[];
  totalPrice: TotalPrice;
  totalLineItemQuantity?: number;
  discountCodes: [
    {
      discountCode: {
        typeId: string;
        id: string;
      };
      state: string;
    },
  ];
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

export interface DiscountCodesOld {
  limit: number;
  offset: number;
  count: number;
  total: number;
  results: DiscountCodeOld[];
}

export interface DiscountCodeOld {
  id: string;
  version: number;
  versionModifiedAt: string;
  lastMessageSequenceNumber: number;
  createdAt: string;
  lastModifiedAt: string;
  lastModifiedBy: {
    clientId: string;
    isPlatformClient: boolean;
  };
  createdBy: {
    clientId: string;
    isPlatformClient: boolean;
  };
  code: string;
  name: {
    en: string;
  };
  key: string;
  description: {
    en: string;
  };
  cartDiscounts: [
    {
      typeId: string;
      id: string;
    },
  ];
  isActive: boolean;
  maxApplications: number;
  maxApplicationsPerCustomer: number;
  references: [];
  groups: [];
}

export interface CardDiscountById {
  id: string;
  version: number;
  versionModifiedAt: string;
  lastMessageSequenceNumber: number;
  createdAt: string;
  lastModifiedAt: string;
  lastModifiedBy: {
    clientId: string;
    isPlatformClient: boolean;
  };
  createdBy: {
    clientId: string;
    isPlatformClient: false;
  };
  value: {
    type: string;
    money: [
      {
        type: string;
        currencyCode: string;
        centAmount: number;
        fractionDigits: number;
      },
    ];
  };
  cartPredicate: string;
  target: {
    type: string;
    predicate: string;
  };
  name: {
    en: string;
  };
  stackingMode: string;
  isActive: boolean;
  requiresDiscountCode: boolean;
  sortOrder: string;
  references: [];
  stores: [];
  key: string;
}
