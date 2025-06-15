import { Component } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { SignInService } from '../../services/sign-in.service';
import { Subscription } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { LoaderService } from '../../services/loader.service';
import { FormModalComponent } from '../../components/form-modal/form-modal.component';
import {
  Cart,
  DiscountCodesOld,
  LineItem,
} from '../../utils/interfaces/interface-cart-page';
import { getFormatPrice } from '../../utils/get-format-price';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-basket-page',
  imports: [NgIf, FormModalComponent, ReactiveFormsModule, NgClass],
  templateUrl: './basket-page.component.html',
  styleUrl: './basket-page.component.scss',
})
export class BasketPageComponent {
  public isCartEmpty: boolean = true;
  public isLogin: boolean = false;
  public isModalShow: boolean = false;
  public codeActivatedMessage = '';

  public modalErrorMessage: string = '';
  public modalHeader: string = '';
  public totalPrice: string = '$0';
  public codeDiscountError = false;
  public codeDiscountUsed = false;
  public totalProductsQuantity: number = 0;

  public lineItems: LineItem[] = [];

  public cartProducts: { name: string; price: number }[] = [];
  public isValid = true;
  public codes: { id: string; name: string }[] = [];

  public codeDiscountForm = new FormGroup({
    codeDiscount: new FormControl(''),
  });

  private subscription!: Subscription;

  constructor(
    private signInService: SignInService,
    private loaderService: LoaderService,
    private cartService: CartService,
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

  public async addCodeDiscountHandler(): Promise<void> {
    const codeControl = this.codeDiscountForm.get('codeDiscount');
    const discountCode = codeControl?.value?.trim() ?? '';

    if (!discountCode) return;

    try {
      const responseCode = await CartService.getDiscountCode(discountCode);

      if (responseCode.total === 0) {
        console.log('Код не найден');
        this.isValid = false;
        return;
      }

      const codeValue = responseCode.results[0].code;

      const alreadyExists = this.codes.some(
        (element) => element.name === codeValue,
      );

      if (alreadyExists) {
        this.showSomeInvalid();
        return;
      }

      await this.addCodeDiscount(responseCode);

      this.codeDiscountForm.reset();
      this.isValid = true;
    } catch (error) {
      console.error('Add code Error', error);
      this.isValid = false;
    }
  }

  public async addCodeDiscount(responseCode: DiscountCodesOld): Promise<void> {
    const codeControl = this.codeDiscountForm.get('codeDiscount');
    const discountCode = codeControl?.value ?? '';
    const getIdCart = LocalStorageService.getCustomerCartID();
    const idDiscountCode = responseCode.results[0].id;

    try {
      const responseCart = await CartService.postDiscountCode(
        getIdCart,
        discountCode,
      );

      const targetCode = responseCart.discountCodes.find(
        (element) => element.discountCode.id === idDiscountCode,
      );

      if (targetCode?.state === 'DoesNotMatchCart') {
        await this.showDiscountInvalidAndRemoveCode(responseCart);
        return;
      } else if (targetCode?.state === 'MatchesCart') {
        this.showActiveMessage();
        await this.createActiveDiscountCodes(responseCart);
        await this.updateTotalPrice();
        codeControl?.setValue('');
      }
    } catch (error) {
      console.error('add code discount', error);
    }
  }

  public async deleteCodeDiscountHandler(objectCode: {
    name: string;
    id: string;
  }): Promise<void> {
    const getIdCart = LocalStorageService.getCustomerCartID();
    try {
      await CartService.removeDiscountCode(getIdCart, objectCode.id);
      console.log(objectCode.id);
      const index = this.codes.findIndex(
        (object) => object.name === objectCode.name,
      );

      if (index !== -1) {
        this.codes.splice(index, 1);
      }
      await this.updateTotalPrice();
    } catch (error) {
      console.error('deleteCodeDiscountHandler error', error);
    }
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

  public async updateCart(): Promise<void> {
    await this.updateLineItems();
    await this.updateTotalPrice();
    await this.updateTotalQuantity();
    await this.updateActiveDiscountCode();
    await this.cartService.updateCartCount(LocalStorageService.getCustomerId());
  }

  public async increaseProductQuantity(product_id: string): Promise<void> {
    this.loaderService.show();
    const cart_id: string = LocalStorageService.getCustomerCartID();
    await CartService.addLineItem(cart_id, product_id);
    await this.updateCart();
    this.loaderService.hide();
  }

  public async decreaseProductQuantity(line_item_id: string): Promise<void> {
    this.loaderService.show();
    const cart_id: string = LocalStorageService.getCustomerCartID();
    await CartService.removeLineItem(cart_id, line_item_id);
    await this.updateCart();
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
    await this.updateCart();
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
    if (LocalStorageService.getLoginState() === 'true') {
      await this.updateCart();
      this.codeDiscountForm.get('codeDiscount')?.valueChanges.subscribe(() => {
        this.isValid = true;
      });
      this.isCartEmpty = (await BasketPageComponent.isCartEmptyCheck())
        ? true
        : false;
    }

    this.subscription = this.signInService.isLogin$.subscribe(
      async (isLoggedIn) => {
        this.isLogin = isLoggedIn;
      },
    );
    this.loaderService.hide();
  }

  public async updateActiveDiscountCode(): Promise<void> {
    const getIdCustomer = LocalStorageService.getCustomerId();

    if (getIdCustomer.length > 0) {
      try {
        const responsive =
          await CartService.getCustomerCartByCustomerId(getIdCustomer);
        if (responsive) {
          await this.deleteNotMatchDiscountCodes(responsive);
          await this.createActiveDiscountCodes(responsive);
        }
      } catch (error) {
        console.error(`updateActiveDiscountCode error: ${error}`);
      }
    }
  }

  public openModal(message: string, header: string): void {
    this.modalErrorMessage = message;
    this.modalHeader = header;
    this.isModalShow = true;
  }

  public closeModal(): void {
    this.isModalShow = false;
  }

  private async deleteNotMatchDiscountCodes(cart: Cart): Promise<void> {
    const appliedCodes = cart.discountCodes?.filter(
      (dc) => dc.state === 'DoesNotMatchCart',
    );
    console.log('deleteWork');
    try {
      for (const code of appliedCodes) {
        const getDiscountCode = await CartService.getDiscountCodeById(
          code.discountCode.id,
        );

        await CartService.removeDiscountCode(cart.id, code.discountCode.id);

        const index = this.codes.findIndex(
          (object) => object.name === getDiscountCode.code,
        );

        if (index !== -1) {
          this.codes.splice(index, 1);
        }
        await this.updateTotalPrice();
      }
    } catch (error) {
      console.error('deleteDiscountCodes error', error);
    }
  }

  private async createActiveDiscountCodes(cart: Cart): Promise<void> {
    const appliedCodes = cart.discountCodes?.filter(
      (dc) => dc.state === 'MatchesCart',
    );

    for (const code of appliedCodes) {
      const respDiscountCode = await CartService.getDiscountCodeById(
        code.discountCode.id,
      );

      const codeAlreadyAdded = this.codes.some(
        (element) => element.name === respDiscountCode.code,
      );

      if (codeAlreadyAdded) {
        continue;
      }

      this.codes.push({
        id: code.discountCode.id,
        name: respDiscountCode.code,
      });
    }
  }

  private async showDiscountInvalidAndRemoveCode(
    responseCart: Cart,
  ): Promise<void> {
    const getIdCart = LocalStorageService.getCustomerCartID();

    const targetCode = responseCart.discountCodes.find(
      (element) =>
        element.discountCode.id === 'c81ae308-80bb-4b6a-a00d-afe32c43b298',
    );

    if (targetCode) {
      this.showDiscountError();
      await CartService.removeDiscountCode(
        getIdCart,
        'c81ae308-80bb-4b6a-a00d-afe32c43b298',
      );
    }
  }

  private showActiveMessage(): void {
    this.codeActivatedMessage = `Code successfully applied`;
    setTimeout(() => (this.codeActivatedMessage = ''), 2000);
  }

  private showSomeInvalid(): void {
    this.codeDiscountUsed = true;
    setTimeout(() => (this.codeDiscountUsed = false), 2000);
  }

  private showDiscountError(): void {
    this.codeDiscountError = true;
    setTimeout(() => (this.codeDiscountError = false), 2000);
  }
}
