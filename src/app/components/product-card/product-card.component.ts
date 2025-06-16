import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { GetMinProduct } from '../../pages/catalog-page/catalog-page.component';
import { NgClass, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LocalStorageService } from '../../services/local-storage.service';
import { CartService } from '../../services/cart.service';

export interface ModalEventEmitter {
  isModalShow: boolean;
  modalErrorMessage: string;
  modalHeader: string;
}

@Component({
  selector: 'app-product-card',
  imports: [NgIf, NgClass, RouterLink],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent implements OnInit {
  @Input() public product!: GetMinProduct;
  @Output() public onError = new EventEmitter<ModalEventEmitter>();
  public onLoginState = false;
  public isLoading = false;

  constructor(private cartService: CartService) {}

  public static lockScroll(): void {
    document.body.classList.add('scroll-lock');
  }

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
        const request_error_message = await CartService.addLineItem(
          getCartId,
          product.id,
        );

        console.log(request_error_message);
        if (request_error_message) {
          this.onError.emit({
            isModalShow: true,
            modalErrorMessage: 'Something went wrong. Try again later',
            modalHeader: '❗ Error ❗',
          });
        }
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
