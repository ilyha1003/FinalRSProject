import { Component, Input, OnInit } from '@angular/core';
import { GetMinProduct } from '../../pages/catalog-page/catalog-page.component';
import { NgClass, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LocalStorageService } from '../../services/local-storage.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-card',
  imports: [NgIf, NgClass, RouterLink],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent implements OnInit {
  @Input() public product!: GetMinProduct;
  public onLoginState = false;
  public isLoading = false;

  constructor(private cartService: CartService) {}

  public async buttonAddHandler(
    event: Event,
    product: GetMinProduct,
  ): Promise<void> {
    const getIdCustomer = LocalStorageService.getCustomerId();
    event.stopPropagation();

    const getCartId = LocalStorageService.getCustomerCartID();
    if (getCartId.length > 0) {
      this.isLoading = true;
      try {
        await CartService.addLineItem(getCartId, product.id);
        product.isInCart = true;

        this.cartService.updateCartCount(getIdCustomer);
      } catch (error) {
        console.error(`Button addHandler: ${error}`);
      } finally {
        this.isLoading = false;
      }
    }
  }

  public ngOnInit(): void {
    const getLocalState = LocalStorageService.getLoginState();

    this.onLoginState = getLocalState.length === 0 ? false : true;
  }
}
