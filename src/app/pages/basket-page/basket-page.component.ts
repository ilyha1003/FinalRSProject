import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { SignInService } from '../../services/sign-in.service';
import { Subscription } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { LoaderService } from '../../services/loader.service';
import { FormModalComponent } from '../../components/form-modal/form-modal.component';

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

  private subscription!: Subscription;

  constructor(
    private signInService: SignInService,
    private loaderService: LoaderService,
  ) {}

  public static async isCartEmptyCheck(): Promise<boolean> {
    const customer_id = LocalStorageService.getCustomerId();
    const cartLineItemsLength =
      await CartService.getCustomerCartLineItemsLength(customer_id);
    return cartLineItemsLength > 0 ? false : true;
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

  public async ngOnInit(): Promise<void> {
    this.isCartEmpty = (await BasketPageComponent.isCartEmptyCheck())
      ? true
      : false;
    this.subscription = this.signInService.isLogin$.subscribe(
      async (isLoggedIn) => {
        this.isLogin = isLoggedIn;
      },
    );
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
