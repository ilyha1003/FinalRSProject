import { Injectable } from '@angular/core';
import { api_url, project_key } from './confidential-data';
import { ApiService } from './api.service';
import {
  CardDiscountById,
  Cart,
  DiscountCodeOld,
  DiscountCodesOld,
  LineItem,
} from '../utils/interfaces/interface-cart-page';
import { LocalStorageService } from './local-storage.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  public cartCountSubject = new BehaviorSubject<number>(0);
  public cartCount$ = this.cartCountSubject.asObservable();

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

  public static async getCustomerCartLineItems(
    customer_id: string,
  ): Promise<LineItem[]> {
    const cart = await CartService.getCustomerCartByCustomerId(customer_id);
    return cart ? cart.lineItems : [];
  }

  public static async getCustomerCartTotalPrice(
    customer_id: string,
  ): Promise<number> {
    const cart = await CartService.getCustomerCartByCustomerId(customer_id);
    return cart ? cart.totalPrice.centAmount : 0;
  }

  public static async getTotalItemsQuantity(
    customer_id: string,
  ): Promise<number> {
    const cart = await CartService.getCustomerCartByCustomerId(customer_id);
    let totalQuantity: number = 0;
    if (cart) {
      for (const item of cart.lineItems) {
        totalQuantity += item.quantity;
      }
    }
    return totalQuantity;
  }

  public static async getTotalLineItemsPriceBeforeDiscount(
    customer_id: string,
  ): Promise<number> {
    const cart = await CartService.getCustomerCartByCustomerId(customer_id);
    let resultPrise: number = 0;
    if (cart) {
      for (const item of cart.lineItems) {
        resultPrise += item.price.discounted
          ? item.price.discounted.value.centAmount * item.quantity
          : item.price.value.centAmount * item.quantity;
      }
    }
    return resultPrise;
  }

  public static async getCartVersionByCartId(cart_id: string): Promise<number> {
    let cart_version: number = 0;
    const customer_access_token: string =
      LocalStorageService.getCustomerAccessToken();

    try {
      const response = await fetch(
        `${api_url}/${project_key}/carts/${cart_id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${customer_access_token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      cart_version = data.version;
    } catch (error) {
      console.log(error);
    }

    return cart_version;
  }

  public static async addLineItem(
    cart_id: string,
    product_id: string,
  ): Promise<string> {
    const actual_cart_version: number =
      await CartService.getCartVersionByCartId(cart_id);
    const customer_access_token: string =
      LocalStorageService.getCustomerAccessToken();
    let request_error_message: string = '';

    const fetch_body = {
      version: actual_cart_version,
      actions: [
        {
          action: 'addLineItem',
          productId: product_id,
          variantId: 1,
          quantity: 1,
        },
      ],
    };

    try {
      const response = await fetch(
        `${api_url}/${project_key}/carts/${cart_id}`,
        {
          method: 'POST',
          body: JSON.stringify(fetch_body),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${customer_access_token}`,
          },
        },
      );

      if (!response.ok) {
        request_error_message = 'error';
        throw new Error(`HTTP Error: ${response.status}`);
      }
    } catch (error) {
      console.log(error);
      return 'error';
    }

    return request_error_message;
  }

  public static async removeLineItem(
    cart_id: string,
    line_item_id: string,
  ): Promise<string> {
    const actual_cart_version: number =
      await CartService.getCartVersionByCartId(cart_id);
    const customer_access_token: string =
      LocalStorageService.getCustomerAccessToken();
    let request_error_message: string = '';

    const fetch_body = {
      version: actual_cart_version,
      actions: [
        {
          action: 'removeLineItem',
          lineItemId: line_item_id,
          quantity: 1,
        },
      ],
    };

    try {
      const response = await fetch(
        `${api_url}/${project_key}/carts/${cart_id}`,
        {
          method: 'POST',
          body: JSON.stringify(fetch_body),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${customer_access_token}`,
          },
        },
      );

      if (!response.ok) {
        request_error_message = 'error';
        throw new Error(`HTTP Error: ${response.status}`);
      }
    } catch (error) {
      console.log(error);
      return 'error';
    }

    return request_error_message;
  }

  public static async getDiscountCode(
    discountCode: string,
  ): Promise<DiscountCodesOld> {
    const customer_access_token: string =
      LocalStorageService.getCustomerAccessToken();

    try {
      const encodedCode = encodeURIComponent(`code="${discountCode}"`);
      const url = `${api_url}/${project_key}/discount-codes?where=${encodedCode}`;

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customer_access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Discount code error ${error}`);
      throw error;
    }
  }

  public static async postDiscountCode(
    cartId: string,
    discountCodeName: string,
  ): Promise<Cart> {
    const customer_access_token: string =
      LocalStorageService.getCustomerAccessToken();

    try {
      const url = `${api_url}/${project_key}/carts/${cartId}`;
      const getCartVersion = await CartService.getCartVersionByCartId(cartId);
      const bodyResponse = {
        version: getCartVersion,
        actions: [
          {
            action: 'addDiscountCode',
            code: discountCodeName,
          },
        ],
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customer_access_token}`,
        },

        body: JSON.stringify(bodyResponse),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`post Discount Code error ${error}`);
      throw error;
    }
  }

  public static async getDiscountCodeById(
    codeId: string,
  ): Promise<DiscountCodeOld> {
    const customer_access_token: string =
      LocalStorageService.getCustomerAccessToken();
    try {
      const url = `${api_url}/${project_key}/discount-codes/${codeId}`;

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customer_access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Discount code error ${error}`);
      throw error;
    }
  }

  public static async removeDiscountCode(
    cartId: string,
    discountCodeId: string,
  ): Promise<Cart> {
    const customer_access_token: string =
      LocalStorageService.getCustomerAccessToken();
    try {
      const url = `${api_url}/${project_key}/carts/${cartId}`;
      const getCartVersion = await CartService.getCartVersionByCartId(cartId);

      const bodyResponse = {
        version: getCartVersion,
        actions: [
          {
            action: 'removeDiscountCode',
            discountCode: {
              typeId: 'discount-code',
              id: discountCodeId,
            },
          },
        ],
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customer_access_token}`,
        },

        body: JSON.stringify(bodyResponse),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`post Discount Code error ${error}`);
      throw error;
    }
  }

  public static async getCartDiscountById(
    codeId: string,
  ): Promise<CardDiscountById> {
    const customer_access_token: string =
      LocalStorageService.getCustomerAccessToken();
    try {
      const url = `${api_url}/${project_key}/cart-discounts/${codeId}`;

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customer_access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Discount code error ${error}`);
      throw error;
    }
  }

  public static async getTotalQuantity(customer_id: string): Promise<number> {
    const cart = await CartService.getCustomerCartByCustomerId(customer_id);
    let result = 0;

    if (cart?.totalLineItemQuantity) {
      result = cart?.totalLineItemQuantity;
    }

    return result;
  }

  public async updateCartCount(customer_id: string): Promise<void> {
    const count = await CartService.getTotalQuantity(customer_id);
    this.cartCountSubject.next(count);
  }
}
