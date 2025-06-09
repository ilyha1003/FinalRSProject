import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { SignInService } from '../../services/sign-in.service';
import { Subscription } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { LocalStorageService } from '../../services/local-storage.service';

@Component({
  selector: 'app-basket-page',
  imports: [NgIf],
  templateUrl: './basket-page.component.html',
  styleUrl: './basket-page.component.scss',
})
export class BasketPageComponent {
  public isCartEmpty: boolean = true;
  public isLogin: boolean = false;

  private subscription!: Subscription;

  constructor(private signInService: SignInService) {}

  public static async isCartEmptyCheck(): Promise<boolean> {
    const customer_id = LocalStorageService.getCustomerId();
    const cartLineItemsLength =
      await CartService.getCustomerCartLineItemsLength(customer_id);
    return cartLineItemsLength > 0 ? false : true;
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
}
