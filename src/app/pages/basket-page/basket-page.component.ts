import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { SignInService } from '../../services/sign-in.service';
import { Subscription } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { LoaderService } from '../../services/loader.service';
import { FormModalComponent } from '../../components/form-modal/form-modal.component';
import { LineItem } from '../../utils/interfaces/interface-cart-page';
import { getFormatPrice } from '../../utils/get-format-price';

@Component({
  selector: 'app-basket-page',
  imports: [NgIf, FormModalComponent],
  templateUrl: './basket-page.component.html',
  styleUrl: './basket-page.component.scss',
})
export class BasketPageComponent {
  public isCartEmpty: boolean = true;
  public isLogin: boolean = false;
  public isModalShow: boolean = false;

  public modalErrorMessage: string = '';
  public modalHeader: string = '';
  public totalPrice: string = '$0';

  public totalProductsQuantity: number = 0;

  public lineItems: LineItem[] = [];

  private subscription!: Subscription;

  constructor(
    private signInService: SignInService,
    private loaderService: LoaderService,
  ) {}
  public static convertProductPrice(price: number): string {
    return getFormatPrice(price);
  }

  public static async isCartEmptyCheck(): Promise<boolean> {
    const customer_id = LocalStorageService.getCustomerId();
    const cartLineItemsLength =
      await CartService.getCustomerCartLineItemsLength(customer_id);
    return cartLineItemsLength > 0 ? false : true;
  }

  public async setCartState(): Promise<void> {
    this.isCartEmpty = await BasketPageComponent.isCartEmptyCheck();
  }

  public async updateLineItems(): Promise<void> {
    const customer_id = LocalStorageService.getCustomerId();
    const lineItems = await CartService.getCustomerCartLineItems(customer_id);
    this.lineItems = lineItems.length > 0 ? lineItems : [];
    await this.generateUsdLineItemsPrice();
    await this.generateTotalUsdLineItemsPrice();
  }

  public async updateTotalPrice(): Promise<void> {
    const customer_id = LocalStorageService.getCustomerId();
    const totalPrice = await CartService.getCustomerCartTotalPrice(customer_id);
    this.totalPrice = `$${totalPrice}`;
  }

  public async updateTotalQuantity(): Promise<void> {
    const customer_id = LocalStorageService.getCustomerId();
    this.totalProductsQuantity =
      await CartService.getTotalItemsQuantity(customer_id);
  }

  public async generateUsdLineItemsPrice(): Promise<void> {
    for (const lineItem of this.lineItems) {
      lineItem.price.value.usd = getFormatPrice(
        lineItem.price.value.centAmount,
      );
    }
  }

  public async generateTotalUsdLineItemsPrice(): Promise<void> {
    for (const lineItem of this.lineItems) {
      lineItem.price.value.totalUsd = getFormatPrice(
        lineItem.price.value.centAmount * lineItem.quantity,
      );
    }
  }

  public async addItemToCart(): Promise<void> {
    this.loaderService.show();
    const testProductID: string = 'a54b2394-0ba3-4b05-b4d0-1b4b04641d50'; // Cocktail Stirring Spoon
    const cart_id = LocalStorageService.getCustomerCartID();
    const request_error_message = await CartService.addLineItem(
      cart_id,
      testProductID,
    );
    if (request_error_message) {
      this.openModal('Something went wrong. Try again later', '❗ Error ❗');
    } else {
      this.openModal('Added to cart', 'Success ✅');
    }
    this.loaderService.hide();
  }

  public async increaseProductQuantity(product_id: string): Promise<void> {
    this.loaderService.show();
    const cart_id: string = LocalStorageService.getCustomerCartID();
    await CartService.addLineItem(cart_id, product_id);
    await this.updateLineItems();
    await this.updateTotalPrice();
    await this.updateTotalQuantity();
    this.loaderService.hide();
  }

  public async decreaseProductQuantity(line_item_id: string): Promise<void> {
    this.loaderService.show();
    const cart_id: string = LocalStorageService.getCustomerCartID();
    await CartService.removeLineItem(cart_id, line_item_id);
    await this.updateLineItems();
    await this.updateTotalPrice();
    await this.updateTotalQuantity();
    await this.setCartState();
    this.loaderService.hide();
  }

  public async deleteWholeProduct(
    quantity: number,
    line_item_id: string,
  ): Promise<void> {
    this.loaderService.show();
    const cart_id: string = LocalStorageService.getCustomerCartID();
    for (let index = 0; index < quantity; index++) {
      await CartService.removeLineItem(cart_id, line_item_id);
    }
    await this.updateLineItems();
    await this.updateTotalPrice();
    await this.updateTotalQuantity();
    await this.setCartState();
    this.loaderService.hide();
  }

  public async clearCart(): Promise<void> {
    for (const lineItem of this.lineItems) {
      await this.deleteWholeProduct(lineItem.quantity, lineItem.id);
    }
    await this.setCartState();
  }

  public async ngOnInit(): Promise<void> {
    this.loaderService.show();
    if (LocalStorageService.getLoginState()) {
      await this.updateLineItems();
      await this.updateTotalPrice();
      await this.updateTotalQuantity();
      console.log(this.lineItems);
    }
    this.isCartEmpty = (await BasketPageComponent.isCartEmptyCheck())
      ? true
      : false;
    this.subscription = this.signInService.isLogin$.subscribe(
      async (isLoggedIn) => {
        this.isLogin = isLoggedIn;
      },
    );
    this.loaderService.hide();
  }

  public openModal(message: string, header: string): void {
    this.modalErrorMessage = message;
    this.modalHeader = header;
    this.isModalShow = true;
  }

  public closeModal(): void {
    this.isModalShow = false;
  }
}
