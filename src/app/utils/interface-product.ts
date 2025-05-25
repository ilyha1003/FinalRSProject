export interface Product {
  id: string;
  productType: ProductType;
  masterData: MasterData;
}

interface ProductType {
  typeId: string;
  id: string;
}

interface MasterData {
  current: MasterCurrent;
}

interface MasterCurrent {
  name: {
    'en-US': string;
    'en-GB': string;
    'de-DE': string;
  };
  description: {
    'en-US': string;
    'de-DE': string;
    'en-GB': string;
  };
  categories: MasterCategory[];
  masterVariant: {
    id: number;
    sku: string;
    key: string;
    prices: MasterPrice[];
    images: [
      {
        url: string;
        dimensions: {
          w: number;
          h: number;
        };
      },
    ];
    attributes: MasterAttribute[];
  };
}

interface MasterCategory {
  typeId: string;
  id: string;
}

export interface MasterPrice {
  id: string;
  value: {
    type: string;
    currencyCode: string;
    centAmount: number;
    fractionDigits: number;
  };
  key: string;
  country: string;
  channel?: {
    typeId: string;
    id: string;
  };
  discounted?: {
    value: {
      type: string;
      currencyCode: string;
      centAmount: number;
      fractionDigits: number;
    };
    discount: {
      typeId: string;
      id: string;
    };
  };
}

interface MasterAttribute {
  name: string;
  value: {
    'en-GB': string;
    'en-US': string;
    'de-DE': string;
  };
}

export interface ProductDiscounts {
  id: string;
  value: {
    type: string;
    permyriad: number;
  };
  predicate: string;
  name: {
    'en-US': string;
    'en-GB': string;
  };
}
