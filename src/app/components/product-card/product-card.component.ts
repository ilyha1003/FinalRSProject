import { Component, Input } from '@angular/core';
import { GetMinProduct } from '../../pages/catalog-page/catalog-page.component';
import { NgClass, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-product-card',
  imports: [NgIf, NgClass, RouterLink],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  @Input() public product!: GetMinProduct;
}
