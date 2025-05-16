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
