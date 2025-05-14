import { Injectable } from '@angular/core';
import { api_url, auth_url, credentials, project_key} from './confidential-data';
import { LoginCustomer, NewCustomer } from '../utils/interfaces';


@Injectable({
  providedIn: 'root'
})

export class ApiService {
  constructor() {
    
  }
  //---------------------------------------------------Authorization methods---------------------------------------

  //
  // getting admin access token
  //
  public static async getAdminAccessToken(): Promise<string> {
    let actual_admin_access_token: string = '';

    try {
      const response = await fetch(`${auth_url}/oauth/token?grant_type=client_credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`,
        },
      });

      if(!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
  
      const data = await response.json();
      actual_admin_access_token = data.access_token;

    } catch (error) {
      console.log(`Getting data error: ${error}`);      
    }

    return actual_admin_access_token;
  }

  //
  // creation new customer
  //
  public static async createNewCustomer(userEmail: string , userFirstName: string, userLastName: string, userPassword: string): Promise<NewCustomer> {
    let new_customer_id: string = '';
    let request_error_message: string = '';
    const actual_admin_access_token: string = await ApiService.getAdminAccessToken();

    const userData: object = {
      "email" : userEmail,
      "firstName" : userFirstName,
      "lastName" : userLastName,
      "password" : userPassword
    }

    try {
      const response = await fetch(`${api_url}/${project_key}/customers`, {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${actual_admin_access_token}`,
        },
      });

      if(!response.ok) {
        const error_data = await response.json();
        request_error_message = error_data.message;
      }
  
      const data = await response.json();
      new_customer_id = data.customer.id;

    } catch (error) {
      console.log(error);      
    }

    return { new_customer_id, request_error_message };
  }

  //
  // add addresses to customer
  //
  public static async setAddressesToCustomer(user_id: string, user_first_name: string, user_last_name: string, country: string, city: string, postal_code: string, address: string): Promise<void> {
    const actual_admin_access_token: string = await ApiService.getAdminAccessToken();
    const actual_customer_version: number = await ApiService.getCustomerVersion(user_id);    

    const userAddresses = {
      "version": actual_customer_version,
      "actions": [
        {
          "action" : "addAddress",
          "address" : {
            "firstName" : `${user_first_name}`,
            "lastName" : `${user_last_name}`,
            "streetName" : `${address}`,
            "postalCode" : `${postal_code}`,
            "city" : `${city}`,
            "country" : `${country}`
          }
        }
      ]
    };  

    try {
      const response = await fetch(`${api_url}/${project_key}/customers/${user_id}`, {
        method: 'POST',
        body: JSON.stringify(userAddresses),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${actual_admin_access_token}`,
        },
      });

      if(!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

    } catch (error) {
      console.log(error);      
    }
  }

  //
  // add birth day to customer
  //
  public static async setBirthDayToCustomer(user_id: string, birth_day: string): Promise<void> {
    const actual_admin_access_token: string = await ApiService.getAdminAccessToken();
    const actual_customer_version: number = await ApiService.getCustomerVersion(user_id);

    const userAddresses = {
      "version": actual_customer_version,
      "actions": [
        {
          "action" : "setDateOfBirth",
          "dateOfBirth" : `${birth_day}`
        }
      ]
    }

    try {
      const response = await fetch(`${api_url}/${project_key}/customers/${user_id}`, {
        method: 'POST',
        body: JSON.stringify(userAddresses),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${actual_admin_access_token}`,
        },
      });

      if(!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

    } catch (error) {
      console.log(error);      
    }
  }

  //
  // get customer version
  //
  public static async getCustomerVersion(user_id: string): Promise<number> {
    const actual_admin_access_token: string = await ApiService.getAdminAccessToken();
    let user_version: number = 0;

    try {
      const response = await fetch(`${api_url}/${project_key}/customers/${user_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${actual_admin_access_token}`,
        },
      });

      if(!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      user_version = data.version;

    } catch (error) {
      console.log(error);      
    }

    return user_version;
  }

  //
  // create cart for new customer
  //
  public static async createNewCart(): Promise<string> {
    let new_cart_id: string = '';
    const actual_admin_access_token: string = await ApiService.getAdminAccessToken();

    const cart_currency = {
      "currency" : "EUR"
    }

    try {
      const response = await fetch(`${api_url}/${project_key}/carts`, {
        method: 'POST',
        body: JSON.stringify(cart_currency),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${actual_admin_access_token}`,
        },
      });

      if(!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
  
      const data = await response.json();
      new_cart_id = data.id;

    } catch (error) {
      console.log(error);      
    }

    return new_cart_id;
  }

  //
  // get cart version by ID
  //
  public static async getCartVersionById(cart_id: string): Promise<number> {
    let cart_version: number = 0;
    const actual_admin_access_token: string = await ApiService.getAdminAccessToken();

    try {
      const response = await fetch(`${api_url}/${project_key}/carts/${cart_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${actual_admin_access_token}`,
        },
      });

      if(!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
  
      const data = await response.json();
      cart_version = data.version;

    } catch (error) {
      console.log(error);      
    }

    return cart_version;
  }

  //
  // set user email to cart
  //
  public static async setUserEmailToCart(cart_id: string, user_email: string): Promise<void> {
    const actual_cart_version: number = await ApiService.getCartVersionById(cart_id);
    const actual_admin_access_token: string = await ApiService.getAdminAccessToken();

    const request_body: object = {
      "version": actual_cart_version,
      "actions": [
        {
            "action" : "setCustomerEmail",
            "email" : user_email
          }
      ]
    }

    try {
      const response = await fetch(`${api_url}/${project_key}/carts/${cart_id}`, {
        method: 'POST',
        body: JSON.stringify(request_body),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${actual_admin_access_token}`,
        },
      });

      if(!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

    } catch (error) {
      console.log(error);      
    }
  }

  //
  // set user ID to cart
  //
  public static async setUserIdToCart(cart_id: string, user_id: string): Promise<void> {
    const actual_cart_version: number = await ApiService.getCartVersionById(cart_id);
    const actual_admin_access_token: string = await ApiService.getAdminAccessToken();
    
    const request_body: object = {
      "version": actual_cart_version,
      "actions": [
        {
            "action" : "setCustomerId",
            "customerId" : user_id
          }
      ]
    }

    try {
      const response = await fetch(`${api_url}/${project_key}/carts/${cart_id}`, {
        method: 'POST',
        body: JSON.stringify(request_body),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${actual_admin_access_token}`,
        },
      });

      if(!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

    } catch (error) {
      console.log(error);      
    }
  }


  //---------------------------------------------------Login methods---------------------------------------
  //
  // login customer
  //
  public static async loginCustomer(user_login: string, user_password: string): Promise<LoginCustomer> {
    const actual_admin_access_token: string = await ApiService.getAdminAccessToken();
    let request_error_message: string = '';
    let customer_id: string = '';

    const request_body: object = {
      "email" : user_login,
      "password" : user_password,
    }

    try {
      const response = await fetch(`${api_url}/${project_key}/me/login`, {
        method: 'POST',
        body: JSON.stringify(request_body),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${actual_admin_access_token}`,
        },
      });

      if(!response.ok) {
        const error_data = await response.json();
        request_error_message = error_data.message;
      }

      const data = await response.json();
      customer_id = data.customer.id;

    } catch (error) {
      console.log(error);      
    }

    return { customer_id, request_error_message };
  }

  //
  // create token for customer who is signing in
  //
  public static async createUserAccessToken(user_name: string, user_password: string): Promise<string> {
    let user_access_token: string = '';

    try {
      const response = await fetch(`${auth_url}/oauth/${project_key}/customers/token?grant_type=password&username=${user_name}&password=${user_password}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`,
        },
      });

      if(!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      user_access_token = data.access_token;

    } catch (error) {
      console.log(error);      
    }

    return user_access_token;
  }

  //
  // get cart by customer ID
  //
  public static async getCartByCustomerId(): Promise<object> {
    const actual_admin_access_token: string = await ApiService.getAdminAccessToken();
    let cartObject: object = {};

    try {
      const response = await fetch(`${api_url}/${project_key}/me/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${actual_admin_access_token}`,
        },
      });

      if(!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      cartObject = structuredClone(data);

    } catch (error) {
      console.log(error);
    }

    return cartObject;
  }
}
