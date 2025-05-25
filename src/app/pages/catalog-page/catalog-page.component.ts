import { Component } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { MasterPrice, ProductDiscounts } from '../../utils/interface-product';
import { isPositiveNumber } from '../../utils/is-positive-number';
import { Category } from '../../utils/interface-categories';

export interface GetMinProduct {
  id: string;
  name: string;
  description: string;
  price: PriceProduct | null;
  img: string;
}

interface PriceProduct {
  price: number;
  currency: string;
  discountedPrice?: number;
  nameDiscount?: string;
}

@Component({
  selector: 'app-catalog-page',
  imports: [NgIf, NgClass, ReactiveFormsModule],
  templateUrl: './catalog-page.component.html',
  styleUrl: './catalog-page.component.scss',
})
export class CatalogPageComponent {
  public filterForm = new FormGroup({
    minPrice: new FormControl(''),
    maxPrice: new FormControl(''),
    isCatalogOpen: new FormControl(false),
  });

  public isLoading = true;
  public isLoadingNewPage = true;
  public skeletonArray = Array.from({ length: 8 });
  public products: GetMinProduct[] = [];
  public categories: Category[] = [];
  public minValue = 0;
  public maxValue = 0;

  private productDiscounts: ProductDiscounts[] = [];
  private offset = 0;
  private filterOffset = 0;
  private isFiltering = false;

  constructor() {}

  public async onPriceBlur(): Promise<void> {
    const minValueFilter = this.filterForm.get('minPrice')?.value?.trim();
    const maxValueFilter = this.filterForm.get('maxPrice')?.value?.trim();

    this.isFiltering = false;

    const isValueMin = isPositiveNumber(minValueFilter ?? '');
    const isValueMax = isPositiveNumber(maxValueFilter ?? '');

    if (!isValueMin || !isValueMax) {
      this.patchValidPriceValues();
      return;
    }

    if (
      Number(minValueFilter) < this.minValue ||
      Number(maxValueFilter) > this.maxValue ||
      Number(minValueFilter) > Number(maxValueFilter)
    ) {
      this.patchValidPriceValues({
        min: Number(minValueFilter),
        max: Number(maxValueFilter),
      });
      return;
    }

    await this.loadProductsInRange(
      Number(minValueFilter) * 100,
      Number(maxValueFilter) * 100,
      this.filterOffset,
    );
  }

  public async getDiscountProductsHandler(): Promise<void> {
    this.products = [];

    this.isLoading = true;
    this.isLoadingNewPage = true;

    try {
      const responseProducts = await ApiService.getProductsDiscount();

      if (responseProducts) {
        const excludedId = '9ad4266a-0e46-4c4c-9ae4-cac3e1dd59ff';

        const products = responseProducts.filter((product) => {
          return product.masterVariant.prices.every((price) => {
            const id = price.discounted?.discount?.id;
            return id?.trim() === excludedId;
          });
        });

        for (const product of products) {
          this.products.push({
            ...this.products,
            ...product,
            id: product.id,
            name: product.name['en-US'],
            description: this.getShortDescription(
              product.description['en-US'],
              60,
            ),
            price: this.calculatePrice(product.masterVariant.prices),
            img: product.masterVariant.images[0].url,
          });
        }
      }
    } catch (error) {
      console.error('get product error:', error);
    } finally {
      this.isLoading = false;
      this.isLoadingNewPage = false;
    }
  }

  public async getMoreProductsHandler(): Promise<void> {
    if (this.isFiltering) {
      this.filterOffset += 20;
      await this.onPriceBlur();
    } else {
      this.offset += 20;
      await this.getProducts();
    }
  }

  public async getCategoriesHandler(): Promise<void> {
    const isOpenValue = !this.filterForm.get('isCatalogOpen')?.value;

    this.filterForm.patchValue({
      isCatalogOpen: isOpenValue,
    });

    if (isOpenValue) {
      this.categories = [];
      const responseCategories = await ApiService.getCategories();

      if (responseCategories) {
        this.categories.push(...responseCategories);
      }
    }
  }

  public async categoryHandler(category: Category): Promise<void> {
    this.products = [];

    const isOpenValue = !this.filterForm.get('isCatalogOpen')?.value;

    this.filterForm.patchValue({
      isCatalogOpen: isOpenValue,
    });

    const response = await ApiService.getSearchProducts({
      filter: `categories.id:"${category.id}"`,
    });

    console.log(response);

    if (response) {
      for (const product of response) {
        this.products.push({
          ...this.products,
          ...product,
          id: product.id,
          name: product.name['en-US'],
          description: this.getShortDescription(
            product.description['en-US'],
            60,
          ),
          price: this.calculatePrice(product.masterVariant.prices),
          img: product.masterVariant.images[0].url,
        });
      }
    }
  }

  private async ngOnInit(): Promise<void> {
    const getDiscount = await ApiService.getProductDiscounts();

    if (getDiscount) {
      this.productDiscounts.push(...getDiscount);
    }

    await this.getMinMaxPrice();
    await this.getProducts();
  }

  private async getProducts(): Promise<void> {
    this.isLoading = true;

    try {
      const responseProducts = await ApiService.getProducts(this.offset);

      if (responseProducts) {
        for (const product of responseProducts) {
          this.products.push({
            ...this.products,
            ...product,
            id: product.id,
            name: product.masterData.current.name['en-US'],
            description: this.getShortDescription(
              product.masterData.current.description['en-US'],
              60,
            ),
            price: this.calculatePrice(
              product.masterData.current.masterVariant.prices,
            ),
            img: product.masterData.current.masterVariant.images[0].url,
          });
        }
      }
    } catch (error) {
      console.error('get product error:', error);
    } finally {
      this.isLoading = false;
      this.isLoadingNewPage = false;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private getShortDescription(product: string, maxLength: number): string {
    return product.length > maxLength
      ? product.slice(0, maxLength) + '...'
      : product;
  }

  private calculatePrice(product: MasterPrice[]): PriceProduct | null {
    const country = 'US';

    const basePrice = product.find(
      (price) => price.country === country && !price.channel,
    );

    if (!basePrice) {
      return null;
    }

    const currency =
      basePrice.value.currencyCode === 'USD'
        ? '$'
        : basePrice.value.currencyCode;

    const price = basePrice.value.centAmount / 100;

    if (basePrice.discounted) {
      const discount = this.productDiscounts.find(
        (discount) => discount.id === basePrice.discounted?.discount.id,
      );

      const nameDiscount = `-${discount?.name['en-US'].slice(0, 3)}`;

      const discountedPrice = basePrice.discounted.value.centAmount / 100;
      return { price, currency, discountedPrice, nameDiscount };
    }

    return { price, currency };
  }

  private async getMinMaxPrice(): Promise<void> {
    const getMin = await ApiService.getSearchProducts({
      limit: '1',
      sort: 'price asc',
    });
    const getMax = await ApiService.getSearchProducts({
      limit: '1',
      sort: 'price desc',
    });

    if (getMin && getMax) {
      this.minValue =
        (getMin?.[0]?.masterVariant?.prices?.at(-1)?.value?.centAmount ?? 0) /
        100;
      this.maxValue =
        (getMax?.[0]?.masterVariant?.prices?.at(-1)?.value?.centAmount ?? 0) /
        100;

      this.filterForm.patchValue({
        minPrice: this.minValue?.toString() ?? '',
        maxPrice: this.maxValue?.toString() ?? '',
      });
    }
  }

  private patchValidPriceValues(input?: { min: number; max: number }): void {
    const patch: Partial<{ minPrice: string; maxPrice: string }> = {};

    if (!input || input.min < this.minValue) {
      patch.minPrice = this.minValue?.toString().trim() ?? '';
    }

    if (!input || input.max > this.maxValue) {
      patch.maxPrice = this.maxValue?.toString().trim() ?? '';
    }

    this.filterForm.patchValue(patch);
  }

  private async loadProductsInRange(
    minCent: number,
    maxCent: number,
    filterOffset: number,
  ): Promise<void> {
    if (!this.isFiltering) {
      this.products = [];
      this.isLoadingNewPage = true;
      this.isFiltering = true;
    }

    const range = await ApiService.getSearchProducts({
      offset: filterOffset.toString(),
      limit: '20',
      filter: [`variants.price.centAmount:range(${minCent} to ${maxCent})`],
    });

    if (range) {
      for (const product of range) {
        console.log(product);
        this.products.push({
          ...product,
          id: product.id,
          name: product.name['en-US'],
          description: this.getShortDescription(
            product.description['en-US'],
            60,
          ),
          price: this.calculatePrice(product.masterVariant.prices),
          img: product.masterVariant.images[0].url,
        });
      }
    }

    this.isLoadingNewPage = false;
  }
}
