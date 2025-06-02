export interface GetSearchProduct {
  count: number;
  limit: number;
  offset: number;
  results: SearchProduct[];
  total: number;
}

export interface SearchProduct {
  id: string;
  productType: {
    typeId: string;
    id: string;
  };
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
  categories: SearchProductCategories;
  slug: {
    'en-US': string;
    'en-GB': string;
    'de-DE': string;
  };
  variants: [];
  masterVariant: {
    attributes: SearchProductMasterAttribute[];
    availability: {
      isOnStock: true;
      availableQuantity: 100;
      version: 1;
      id: '69aa3c7c-ca81-4288-a4c2-bb7404c0a14a';
    };
    assets: [];
    images: [
      {
        url: string;
        dimensions: {
          w: number;
          h: number;
        };
      },
    ];
    prices: [SearchProductPrice];
    key: string;
    sku: string;
    id: number;
  };
  attributes: [];
  hasStagedChanges: false;
  published: true;
  key: string;
  taxCategory: {
    typeId: string;
    id: string;
  };
  //searchKeywords: {};
  createdAt: string;
  lastModifiedAt: string;
}

interface SearchProductCategories {
  typeId: string;
  id: string;
}

interface SearchProductMasterAttribute {
  name: string;
  value: {
    'en-GB': string;
    'en-US': string;
    'de-DE': string;
  };
}

interface SearchProductPrice {
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
