import { Injectable } from '@angular/core';
import { api_url, project_key } from './confidential-data';
import { ApiService } from './api.service';
import { Cart } from '../utils/interfaces/interface-cart-page';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  constructor() {}

  public static async getCustomerCartByCustomerId(
    customer_id: string,
  ): Promise<Cart | null> {
    const actual_admin_access_token: string =
      await ApiService.getAdminAccessToken();

    try {
      const response = await fetch(
        `${api_url}/${project_key}/carts/customer-id=${customer_id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${actual_admin_access_token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const customer_data: Cart = await response.json();
      return customer_data;
    } catch (error) {
      console.error('Error load custumer id:', error);
      return null;
    }
  }

  public static async getCustomerCartIdByCustomerId(
    customer_id: string,
  ): Promise<string | null> {
    const cart = await CartService.getCustomerCartByCustomerId(customer_id);
    return cart === null ? null : cart.id;
  }

  public static async getCustomerCartLineItemsLength(
    customer_id: string,
  ): Promise<number> {
    const cart = await CartService.getCustomerCartByCustomerId(customer_id);
    return cart ? cart.lineItems.length : 0;
  }
}
