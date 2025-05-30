export interface NewCustomer {
  new_customer_id: string;
  request_error_message: string;
}

export interface LoginCustomer {
  customer_id: string;
  request_error_message: string;
}

export interface CustomerCart {
  customer_cart_id: string;
  request_error_message: string;
}

export interface CustomerAddress {
  id: string;
  firstname: string;
  lastName: string;
  streetName: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface RegistrationFormValues {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  birthDate: string;
  country: string;
  city: string;
  postalCode: string;
  address: string;
  shippingAddress: string;
  isDefaultAddress: boolean;
  billingAddress: string;
  isSameAddress: boolean;
}

export interface Customer {
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  password: string;
  addresses: CustomerAddress[];
  defaultShippingAddressId: string;
  defaultBillingAddressId: string;
  shippingAddressIds: string[];
  billingAddressIds: string[];
}

export interface AddAddressPayload {
  version: number;
  actions: {
    action: 'addAddress';
    address: {
      firstName: string;
      lastName: string;
      streetName: string;
      postalCode: string;
      city: string;
      country: string;
    };
  }[];
}

// interface for ProductPageComponent
export interface ProductImage {
  url: string;
  dimensions: { w: number; h: number };
}

export interface ProductPrice {
  country: string;
  value: {
    currencyCode: string;
    centAmount: number;
    fractionDigits: number;
  };
  discounted?: {
    value: {
      currencyCode: string;
      centAmount: number;
      fractionDigits: number;
    };
  };
}

export interface ProductAttribute {
  name: string;
  value: Record<string, string>;
}

export interface ProductVariant {
  id: number;
  sku: string;
  key: string;
  prices: ProductPrice[];
  images: ProductImage[];
  attributes: ProductAttribute[];
  availability: {
    isOnStock: boolean;
    availableQuantity: number;
  };
}

export interface ProductDataCurrent {
  name: Record<string, string>;
  description: Record<string, string>;
  slug: Record<string, string>;
  masterVariant: ProductVariant;
  categories: Array<{
    typeId: string;
    id: string;
  }>;
}

export interface Product {
  id: string;
  version: number;
  createdAt: string;
  lastModifiedAt: string;
  masterData: {
    current: ProductDataCurrent;
    staged: ProductDataCurrent;
  };
}
