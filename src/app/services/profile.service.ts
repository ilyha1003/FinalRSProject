import { Injectable } from '@angular/core';
// import { ApiService } from './api.service';
import {
  AddShortAddress,
  Customer,
  CustomerAddress,
  CustomerShortAddress,
} from '../utils/interfaces';
import { api_url, project_key } from './confidential-data';
import { LocalStorageService } from './local-storage.service';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  constructor() {}

  //
  // General Profile Field methods
  //
  public static async getCustomerDataById(
    customer_id: string,
  ): Promise<Customer | null> {
    const customer_access_token: string =
      LocalStorageService.getCustomerAccessToken();

    try {
      const response = await fetch(
        `${api_url}/${project_key}/customers/${customer_id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${customer_access_token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const customer_data = await response.json();

      return customer_data;
    } catch (error) {
      console.error('Error load custumer id:', error);
      return null;
    }
  }

  public static async changeCustomerEmail(
    customer_id: string,
    customer_new_email: string,
  ): Promise<void> {
    const actual_customer_version: number =
      await ApiService.getCustomerVersion(customer_id);
    const customer_access_token: string =
      LocalStorageService.getCustomerAccessToken();

    const fetch_body = {
      version: actual_customer_version,
      actions: [
        {
          action: 'changeEmail',
          email: `${customer_new_email}`,
        },
      ],
    };

    try {
      const response = await fetch(
        `${api_url}/${project_key}/customers/${customer_id}`,
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Changing customer email ERROR:', error);
    }
  }

  public static async changeCustomerFirstName(
    customer_id: string,
    customer_new_first_name: string,
  ): Promise<void> {
    const actual_customer_version: number =
      await ApiService.getCustomerVersion(customer_id);
    const customer_access_token: string =
      LocalStorageService.getCustomerAccessToken();

    const fetch_body = {
      version: actual_customer_version,
      actions: [
        {
          action: 'setFirstName',
          firstName: `${customer_new_first_name}`,
        },
      ],
    };

    try {
      const response = await fetch(
        `${api_url}/${project_key}/customers/${customer_id}`,
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Changing customer email ERROR:', error);
    }
  }

  public static async changeCustomerLastName(
    customer_id: string,
    customer_new_last_name: string,
  ): Promise<void> {
    const actual_customer_version: number =
      await ApiService.getCustomerVersion(customer_id);
    const customer_access_token: string =
      LocalStorageService.getCustomerAccessToken();

    const fetch_body = {
      version: actual_customer_version,
      actions: [
        {
          action: 'setLastName',
          lastName: `${customer_new_last_name}`,
        },
      ],
    };

    try {
      const response = await fetch(
        `${api_url}/${project_key}/customers/${customer_id}`,
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Changing customer email ERROR:', error);
    }
  }

  public static async changeCustomerBirthDate(
    customer_id: string,
    customer_new_birth_date: string,
  ): Promise<void> {
    const actual_customer_version: number =
      await ApiService.getCustomerVersion(customer_id);
    const customer_access_token: string =
      LocalStorageService.getCustomerAccessToken();

    const fetch_body = {
      version: actual_customer_version,
      actions: [
        {
          action: 'setDateOfBirth',
          dateOfBirth: `${customer_new_birth_date}`,
        },
      ],
    };

    try {
      const response = await fetch(
        `${api_url}/${project_key}/customers/${customer_id}`,
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Changing customer email ERROR:', error);
    }
  }

  //
  // Shipping and Billing Profile Forms Methods
  //
  public static async getCustomerShippingAddressIds(
    customer_id: string,
  ): Promise<string[]> {
    const customer_data = await ProfileService.getCustomerDataById(customer_id);
    let customer_shipping_addresses: string[] = [];
    if (customer_data) {
      customer_shipping_addresses = customer_data.shippingAddressIds;
    }
    return customer_shipping_addresses;
  }

  public static async getCustomerBillingAddressIds(
    customer_id: string,
  ): Promise<string[]> {
    const customer_data = await ProfileService.getCustomerDataById(customer_id);
    let customer_billing_addresses: string[] = [];
    if (customer_data) {
      customer_billing_addresses = customer_data.billingAddressIds;
    }
    return customer_billing_addresses;
  }

  public static async getAddressData(
    customer_id: string,
    address_id: string,
  ): Promise<CustomerAddress | undefined> {
    const customer_data = await ProfileService.getCustomerDataById(customer_id);
    const customer_addresses: CustomerAddress[] =
      customer_data?.addresses || [];

    return customer_addresses.find((address) => address.id === address_id);
  }

  public static async addNewAddress(
    customer_id: string,
    country: string,
    city: string,
    postal_code: string,
    address: string,
  ): Promise<string> {
    try {
      const [customer_access_token, actual_customer_version] =
        await Promise.all([
          LocalStorageService.getCustomerAccessToken(),
          ApiService.getCustomerVersion(customer_id),
        ]);

      const fetch_body = this.buildAddressBody(
        actual_customer_version,
        country,
        city,
        postal_code,
        address,
      );

      const response = await fetch(
        `${api_url}/${project_key}/customers/${customer_id}`,
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
        throw new Error(
          `Failed to update customer address. Status: ${response.status}`,
        );
      }

      const customerAddresses = await this.getCustomerAddresses(customer_id);
      return await this.getAddressIdByAddressValue(customerAddresses, address);
    } catch (error) {
      console.error('Error setting address to customer:', error);
      return '';
    }
  }

  public static buildAddressBody(
    version: number,
    country: string,
    city: string,
    postalCode: string,
    streetName: string,
  ): AddShortAddress {
    return {
      version: version,
      actions: [
        {
          action: 'addAddress',
          address: {
            streetName,
            postalCode,
            city,
            country,
          },
        },
      ],
    };
  }

  public static async getCustomerAddresses(
    customer_id: string,
  ): Promise<CustomerShortAddress[]> {
    const customer_access_token: string =
      LocalStorageService.getCustomerAccessToken();
    let user_addresses: CustomerShortAddress[] = [];

    try {
      const response = await fetch(
        `${api_url}/${project_key}/customers/${customer_id}`,
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
      user_addresses = data.addresses;
    } catch (error) {
      console.log(error);
    }

    return user_addresses;
  }

  public static async getAddressIdByAddressValue(
    addresses: CustomerShortAddress[],
    address_value: string,
  ): Promise<string> {
    let address_id: string = '';
    for (const element of addresses) {
      if (element.streetName === address_value) {
        return (address_id = element.id);
      }
    }

    return address_id;
  }

  public static async addAddressToShippingAddresses(
    customer_id: string,
    address_id: string,
  ): Promise<void> {
    try {
      const [customer_access_token, actual_customer_version] =
        await Promise.all([
          LocalStorageService.getCustomerAccessToken(),
          ApiService.getCustomerVersion(customer_id),
        ]);

      const fetch_body = {
        version: actual_customer_version,
        actions: [
          {
            action: 'addShippingAddressId',
            addressId: `${address_id}`,
          },
        ],
      };

      const response = await fetch(
        `${api_url}/${project_key}/customers/${customer_id}`,
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
        throw new Error(
          `Failed to add new shipping address. Status: ${response.status}`,
        );
      }
    } catch (error) {
      console.error('Something went wrong:', error);
    }
  }

  public static async removeShippingAddressId(
    customer_id: string,
    address_id: string,
  ): Promise<void> {
    try {
      const [customer_access_token, actual_customer_version] =
        await Promise.all([
          LocalStorageService.getCustomerAccessToken(),
          ApiService.getCustomerVersion(customer_id),
        ]);

      const fetch_body = {
        version: actual_customer_version,
        actions: [
          {
            action: 'removeShippingAddressId',
            addressId: `${address_id}`,
          },
        ],
      };

      const response = await fetch(
        `${api_url}/${project_key}/customers/${customer_id}`,
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
        throw new Error(
          `Failed to delete shipping address. Status: ${response.status}`,
        );
      }
    } catch (error) {
      console.error('Something went wrong:', error);
    }
  }

  public static async setDefaultShippingAddress(
    customer_id: string,
    address_id: string,
  ): Promise<void> {
    try {
      const [customer_access_token, actual_customer_version] =
        await Promise.all([
          LocalStorageService.getCustomerAccessToken(),
          ApiService.getCustomerVersion(customer_id),
        ]);

      const fetch_body = {
        version: actual_customer_version,
        actions: [
          {
            action: 'setDefaultShippingAddress',
            addressId: `${address_id}`,
          },
        ],
      };

      const response = await fetch(
        `${api_url}/${project_key}/customers/${customer_id}`,
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
        throw new Error(
          `Failed to delete shipping address. Status: ${response.status}`,
        );
      }
    } catch (error) {
      console.error('Something went wrong:', error);
    }
  }

  public static async removeDefaultShippingAddress(
    customer_id: string,
  ): Promise<void> {
    try {
      const [customer_access_token, actual_customer_version] =
        await Promise.all([
          LocalStorageService.getCustomerAccessToken(),
          ApiService.getCustomerVersion(customer_id),
        ]);

      const fetch_body = {
        version: actual_customer_version,
        actions: [
          {
            action: 'setDefaultShippingAddress',
          },
        ],
      };

      const response = await fetch(
        `${api_url}/${project_key}/customers/${customer_id}`,
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
        throw new Error(
          `Failed to delete default shipping address. Status: ${response.status}`,
        );
      }
    } catch (error) {
      console.error('Something went wrong:', error);
    }
  }

  public static async getDefaultShippingAddress(
    customer_id: string,
  ): Promise<string> {
    let defaultShippingAddressId: string = '';
    try {
      const customer_data =
        await ProfileService.getCustomerDataById(customer_id);
      if (customer_data) {
        defaultShippingAddressId = customer_data.defaultShippingAddressId;
      }
    } catch (error) {
      console.error('Error load custumer id:', error);
    }
    return defaultShippingAddressId;
  }

  public static async changeAddress(
    customer_id: string,
    address_id: string,
    street_name: string,
    postal_code: string,
    city: string,
    country: string,
  ): Promise<void> {
    try {
      const [customer_access_token, actual_customer_version] =
        await Promise.all([
          LocalStorageService.getCustomerAccessToken(),
          ApiService.getCustomerVersion(customer_id),
        ]);

      const fetch_body = {
        version: actual_customer_version,
        actions: [
          {
            action: 'changeAddress',
            addressId: address_id,
            address: {
              streetName: street_name,
              postalCode: postal_code,
              city: city,
              country: country,
            },
          },
        ],
      };
      const response = await fetch(
        `${api_url}/${project_key}/customers/${customer_id}`,
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
        throw new Error(
          `Failed to delete shipping address. Status: ${response.status}`,
        );
      }
    } catch (error) {
      console.error('Something went wrong:', error);
    }
  }
}
