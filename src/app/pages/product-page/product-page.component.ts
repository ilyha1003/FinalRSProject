import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Product, ProductImage } from '../../utils/interfaces/interfaces';
import { LoaderService } from '../../services/loader.service';
import { getFormatPrice } from '../../utils/get-format-price';

@Component({
  selector: 'app-product-page',
  templateUrl: './product-page.component.html',
  styleUrl: './product-page.component.scss',
  standalone: true,
  imports: [CommonModule, RouterModule, NgIf],
})
export class ProductPageComponent implements OnInit {
  public productId: string | null = '';
  public product!: Product | undefined;

  public selectedImageIndex = 0;
  public isModalOpen = false;
  public images = this.product?.masterData?.current?.masterVariant?.images;
  private touchStartX = 0;
  private touchEndX = 0;

  constructor(
    private route: ActivatedRoute,
    private loaderService: LoaderService,
  ) {}

  public get isDiscountPrice(): boolean {
    if (this.product) {
      return 'disconted' in this.product;
    }
    return true;
  }

  public get productName(): string {
    const lang = 'en-US';
    return this.product?.masterData?.current?.name[lang] || '';
  }

  public get productDescription(): string {
    const lang = 'en-US';
    return this.product?.masterData?.current?.description[lang] || '';
  }

  public get productImages(): ProductImage[] {
    return this.product?.masterData?.current?.masterVariant?.images || [];
  }

  public get currentImageUrl(): string {
    return this.productImages[this.selectedImageIndex]?.url || '';
  }

  public get price(): string | null {
    let price = this.product?.masterData?.current?.masterVariant?.prices.find(
      (p) =>
        ProductPageComponent.isPriseContainsUSDCheck(p.key) &&
        p.key?.endsWith('_dist'),
    )?.value;

    if (!price) {
      price = this.product?.masterData?.current?.masterVariant?.prices.find(
        (p) => ProductPageComponent.isPriseContainsUSDCheck(p.key),
      )?.value;
    }

    return price ? getFormatPrice(price.centAmount / 100) : null;
  }

  public get discountedPrice(): string | null {
    const price = this.product?.masterData?.current?.masterVariant?.prices.find(
      (p) => ProductPageComponent.isPriseContainsUSDCheck(p.key),
    )?.discounted?.value;
    return price ? getFormatPrice(price.centAmount / 100) : null;
  }

  public get discount(): number | null {
    const priceDiscount =
      this.product?.masterData?.current?.masterVariant?.prices.find((p) =>
        ProductPageComponent.isPriseContainsUSDCheck(p.key),
      )?.discounted?.value;
    const price = this.product?.masterData?.current?.masterVariant?.prices.find(
      (p) => ProductPageComponent.isPriseContainsUSDCheck(p.key),
    )?.value;
    if (price && priceDiscount) {
      const percent =
        (+(priceDiscount.centAmount / 100) / +(price.centAmount / 100) - 1) *
        100;
      return Math.round(percent);
    }
    return null;
  }

  private static isPriseContainsUSDCheck(input: string): boolean {
    if (!input || typeof input !== 'string') {
      return false;
    }
    return input.includes('USD');
  }

  @HostListener('document:touchstart', ['$event'])
  public onTouchStart(event: TouchEvent): void {
    if (!this.isModalOpen) return;

    this.touchStartX = event.changedTouches[0].screenX;
  }

  @HostListener('document:touchend', ['$event'])
  public onTouchEnd(event: TouchEvent): void {
    if (!this.isModalOpen) return;

    this.touchEndX = event.changedTouches[0].screenX;
    this.handleSwipe();
  }

  @HostListener('document:keydown', ['$event'])
  public handleKeyboardEvent(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowUp': {
        this.prevImage();
        event.preventDefault();
        break;
      }
      case 'ArrowLeft': {
        this.prevImage();
        event.preventDefault();
        break;
      }
      case 'ArrowRight': {
        this.nextImage();
        event.preventDefault();
        break;
      }
      case 'ArrowDown': {
        this.nextImage();
        event.preventDefault();
        break;
      }
    }
    if (this.isModalOpen && event.key === 'Escape') {
      this.closeImageModal();
      event.preventDefault();
    }
  }

  public async ngOnInit(): Promise<void> {
    this.productId = this.route.snapshot.paramMap.get('id');

    this.route.paramMap.subscribe((parameters) => {
      this.productId = parameters.get('id');
    });

    this.loaderService.show();
    try {
      this.product = await ApiService.getProductById(this.productId);
    } finally {
      this.loaderService.hide();
    }
  }

  public nextMiniImage(index: number): void {
    this.selectedImageIndex = index;
  }

  public openImageModal(index: number): void {
    this.selectedImageIndex = index;
    this.isModalOpen = true;
  }

  public closeImageModal(): void {
    this.isModalOpen = false;
  }

  public nextImage(): void {
    this.selectedImageIndex =
      (this.selectedImageIndex + 1) % this.productImages.length;
  }

  public prevImage(): void {
    this.selectedImageIndex =
      (this.selectedImageIndex - 1 + this.productImages.length) %
      this.productImages.length;
  }

  private handleSwipe(): void {
    const swipeDistance = this.touchEndX - this.touchStartX;

    if (swipeDistance < -50) {
      this.nextImage();
    }

    if (swipeDistance > 50) {
      this.prevImage();
    }
  }
}
