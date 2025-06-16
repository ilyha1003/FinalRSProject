import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  constructor() {}

  public static setCustomerId(customer_id: string): void {
    localStorage.setItem('customerId', JSON.stringify(customer_id));
  }

  public static getCustomerId(): string {
    return JSON.parse(localStorage.getItem('customerId') || '[]');
  }

  public static removeCustomerId(): void {
    localStorage.removeItem('customerId');
  }

  public static setCustomerEmail(customer_email: string): void {
    localStorage.setItem('customerEmail', JSON.stringify(customer_email));
  }

  public static getCustomerEmail(): string {
    return JSON.parse(localStorage.getItem('customerEmail') || '[]');
  }

  public static removeCustomerEmail(): void {
    localStorage.removeItem('customerEmail');
  }

  public static setCustomerAccessToken(customer_access_token: string): void {
    localStorage.setItem(
      'customerAccessToken',
      JSON.stringify(customer_access_token),
    );
  }

  public static getCustomerAccessToken(): string {
    return JSON.parse(localStorage.getItem('customerAccessToken') || '[]');
  }

  public static removeCustomerAccessToken(): void {
    localStorage.removeItem('customerAccessToken');
  }

  public static setLoginState(state: string): void {
    localStorage.setItem('loginState', JSON.stringify(state));
  }

  public static getLoginState(): string {
    return JSON.parse(localStorage.getItem('loginState') || '[]');
  }

  public static removeLoginState(): void {
    localStorage.removeItem('loginState');
  }

  public static setCustomerCartID(cart_id: string): void {
    localStorage.setItem('customerCartId', JSON.stringify(cart_id));
  }

  public static getCustomerCartID(): string {
    return JSON.parse(localStorage.getItem('customerCartId') || '[]');
  }

  public static removeCustomerCartID(): void {
    localStorage.removeItem('customerCartId');
  }
}
