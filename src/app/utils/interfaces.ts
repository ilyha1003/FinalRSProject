export interface NewCustomer {
    new_customer_id: string,
    request_error_message: string
}

export interface LoginCustomer {
    customer_id: string,
    request_error_message: string
}

export interface CustomerCart {
    customer_cart_id: string,
    request_error_message: string
}