import { Component } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Category } from '../../utils/interface-categories';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchProduct } from '../../utils/interface-product-search';
import { MasterPrice, ProductDiscounts } from '../../utils/interface-product';
import { isPositiveNumber } from '../../utils/is-positive-number';
import { ProductCardComponent } from '../../components/product-card/product-card.component';

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

interface ProductColor {
  nameColor: string;
  codeColor: string;
}

interface CategoriesIdSlug {
  id: string;
  slug: string;
}

@Component({
  selector: 'app-catalog-page',
  imports: [NgIf, NgClass, ReactiveFormsModule, ProductCardComponent],
  templateUrl: './catalog-page.component.html',
  styleUrl: './catalog-page.component.scss',
})
export class CatalogPageComponent {
  public filterForm = new FormGroup({
    minPrice: new FormControl(''),
    maxPrice: new FormControl(''),
    isCatalogOpen: new FormControl(false),
    selectedColor: new FormControl(''),
    isSaleOpen: new FormControl(false),
  });

  public products: GetMinProduct[] = [];
  public categories: Category[] = [];
  public isLoadingCategories: boolean = false;
  public isLoadingProducts: boolean = false;
  public skeletonArray = Array.from({ length: 4 });
  public skeletonArrayCategory = Array.from({ length: 31 });
  public totalProduct: boolean = false;
  public isLoading: boolean = false;
  public isNoProducts = false;
  public minValue = 0;
  public maxValue = 0;
  public productColors: ProductColor[] = [];
  public checkColor: string | null = '';
  public productsSetColor: Set<string> = new Set();

  private CategoriesIdsNames: CategoriesIdSlug[] = [];
  private productsDiscount: ProductDiscounts[] = [];
  private offset = 0;
  private excludedId = '9ad4266a-0e46-4c4c-9ae4-cac3e1dd59ff';
  private isNewPage: boolean = true;
  private filterIdCategory = '';

  // public isLoading = true;
  // public isLoadingNewPage = true;
  // public isEmptyCatalog = false;
  // public skeletonArray = Array.from({ length: 8 });
  // public products: GetMinProduct[] = [];
  // public categories: Category[] = [];
  // public productsColorArray: ProductColor[] = [];
  // public minValue = 0;
  // public maxValue = 0;
  // public checkColor: string | null = '';
  // public isFiltering = false;
  // public isColor = false;

  // private productDiscounts: ProductDiscounts[] = [];
  // private catTest: { id: string; name: string }[] = [];
  // private offset = 0;
  // private filterOffset = 0;
  // private filterIdCategory = '';
  // private productsSetColor: Set<string> = new Set();
  // private excludedId = '9ad4266a-0e46-4c4c-9ae4-cac3e1dd59ff';
  // private categoryName: string | null | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  public async onPriceBlur(): Promise<void> {
    const minValueFilter = this.filterForm
      .get('minPrice')
      ?.value?.trim()
      .replace(',', '.');
    const maxValueFilter = this.filterForm
      .get('maxPrice')
      ?.value?.trim()
      .replace(',', '.');

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
      this.offset,
    );
  }

  public async allProductButtonHandler(): Promise<void> {
    this.router.navigate(['/catalog']);
    this.isNoProducts = false;
  }

  public async categoriesButtonHandler(): Promise<void> {
    const isOpenValue = !this.filterForm.get('isCatalogOpen')?.value;

    this.filterForm.patchValue({
      isCatalogOpen: isOpenValue,
    });

    this.isLoadingCategories = true;

    try {
      if (isOpenValue) {
        this.categories = [];
        const responseCategories = await ApiService.getCategories();

        if (responseCategories) {
          this.categories.push(...responseCategories);
        }
      }
    } catch (error) {
      console.error('categoriesButton error:', error);
    } finally {
      this.isLoadingCategories = false;
    }
  }

  public async onSaleButtonHandler(): Promise<void> {
    const isOpenValue = this.filterForm.get('isCatalogOpen')?.value;
    if (isOpenValue) {
      this.filterForm.patchValue({
        isCatalogOpen: false,
      });
    }
    this.products = [];
    this.isLoadingProducts = true;

    try {
      const response = await ApiService.getSearchProducts({
        limit: '20',
        filter: 'variants.prices.discounted.value.centAmount:range(0 to *)',
      });
      if (response) {
        const products = response.results.filter((product) => {
          return product.masterVariant.prices.every((price) => {
            const id = price.discounted?.discount?.id;
            return id?.trim() === this.excludedId;
          });
        });

        for (const product of products) {
          this.products.push(this.mapSearchProduct(product));
        }
      }
    } catch (error) {
      console.error('get product error:', error);
    } finally {
      this.isLoadingProducts = false;
    }
  }

  public async categoryHandler(category: string): Promise<void> {
    this.isLoadingProducts = true;
    this.products = [];
    this.offset = 0;

    try {
      const response = await ApiService.getSearchProducts({
        filter: `categories.id:"${category}"`,
      });

      if (response) {
        this.totalProduct = response.total > 20 ? true : false;
        for (const product of response.results) {
          this.products.push(this.mapSearchProduct(product));

          const productColor = product.masterVariant.attributes.find(
            (element) => element.name === 'color',
          );

          if (productColor) {
            this.productsSetColor.add(productColor?.value['en-US']);
          }
        }
      }

      this.getColorPalette();
    } catch (error) {
      console.error('get categories error:', error);
    } finally {
      this.isLoadingProducts = false;
    }
  }

  public goToCategory(category: Category): void {
    this.isNewPage = true;
    this.products = [];
    this.isNoProducts = false;
    this.productsSetColor.clear();
    this.productColors = [];

    this.filterForm.patchValue({
      isCatalogOpen: false,
    });

    const categorySlug = category.slug['en-US'];

    this.router.navigate(['/catalog/category', categorySlug.toLowerCase()]);
    this.patchMinMaxInputs(`categories.id:"${category.id}"`);
    this.filterIdCategory = category.id;
  }

  public goToOnSale(): void {
    this.isNoProducts = false;
    this.isNewPage = true;
    this.filterForm.patchValue({
      isCatalogOpen: false,
    });

    this.router.navigate(['/catalog/on-sale']);
  }

  public async getMoreProductsHandler(): Promise<void> {
    this.offset += 20;

    await this.getProducts();
  }

  public async formColorHandler(colorCode: string): Promise<void> {
    this.checkColor = this.checkColor === colorCode ? null : colorCode;

    this.filterForm.get('selectedColor')?.setValue(this.checkColor || '');
    this.isLoadingProducts = true;

    if (this.checkColor) {
      this.products = [];

      const response = await ApiService.getSearchProducts({
        'text.en-US': this.checkColor,
        filter: `categories.id:"${this.filterIdCategory}"`,
      });

      if (response) {
        for (const product of response.results) {
          this.products.push(this.mapSearchProduct(product));
        }
      }
    } else {
      this.products = [];

      const response = await ApiService.getSearchProducts({
        filter: `categories.id:"${this.filterIdCategory}"`,
      });
      if (response) {
        for (const product of response.results) {
          this.products.push(this.mapSearchProduct(product));
        }
      }
    }

    this.isLoadingProducts = false;
  }

  private async ngOnInit(): Promise<void> {
    this.isNewPage = true;

    this.route.paramMap.subscribe(async (parameters) => {
      const nameFromRoute = parameters.get('name') ?? '';

      const isNameMoreLength =
        nameFromRoute?.split(' ').length > 1
          ? nameFromRoute?.split(' ').join('-')
          : nameFromRoute;

      const responseCategories = await ApiService.getCategories();

      if (responseCategories) {
        this.CategoriesIdsNames = responseCategories.map((element) => ({
          id: element.id,
          slug: element.slug['en-US'],
        }));
      }

      const foundCategory = this.CategoriesIdsNames.find(
        (object) => object.slug === isNameMoreLength,
      );

      const getDiscount = await ApiService.getProductDiscounts();
      if (getDiscount) {
        this.productsDiscount.push(...getDiscount);
      }

      if (nameFromRoute === 'on-sale') {
        await this.onSaleButtonHandler();
      } else if (nameFromRoute.length === 0) {
        await this.getProducts();
        this.patchMinMaxInputs();
      } else if (foundCategory) {
        this.filterIdCategory = foundCategory.id;
        await this.categoryHandler(foundCategory.id);
        this.patchMinMaxInputs(`categories.id:"${foundCategory.id}"`);
      } else {
        this.isNoProducts = true;
      }
    });
  }

  private async getProducts(): Promise<void> {
    if (this.isNewPage) {
      this.isLoadingProducts = true;
    }
    this.isNewPage = false;
    this.isLoading = true;
    try {
      const responseProducts = await ApiService.getProducts(this.offset);

      if (responseProducts) {
        this.totalProduct = responseProducts.total > 20 ? true : false;
        for (const product of responseProducts.results) {
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
      this.isLoadingProducts = false;
      this.isLoading = false;
    }
  }

  private mapSearchProduct(product: SearchProduct): GetMinProduct {
    return {
      id: product.id,
      name: product.name['en-US'],
      description: this.getShortDescription(product.description['en-US'], 60),
      price: this.calculatePrice(product.masterVariant.prices),
      img: product.masterVariant.images[0].url,
    };
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
      const discount = this.productsDiscount.find(
        (discount) => discount.id === basePrice.discounted?.discount.id,
      );

      const nameDiscount = `-${discount?.name['en-US'].slice(0, 3)}`;

      const discountedPrice = basePrice.discounted.value.centAmount / 100;
      return { price, currency, discountedPrice, nameDiscount };
    }

    return { price, currency };
  }

  // eslint-disable-next-line class-methods-use-this
  private getShortDescription(product: string, maxLength: number): string {
    return product.length > maxLength
      ? product.slice(0, maxLength) + '...'
      : product;
  }

  private async patchMinMaxInputs(filter = ''): Promise<void> {
    if (filter) {
      this.getMinMaxPrice(filter);
    } else {
      this.getMinMaxPrice('');
    }
  }

  private async getMinMaxPrice(filterString: string): Promise<void> {
    const objectSearchMin = {
      sort: 'price asc',
      limit: '1',
    };

    const objectSearchMax = {
      sort: 'price desc',
      limit: '1',
    };

    if (filterString) {
      Object.assign(objectSearchMin, { filter: filterString });
      Object.assign(objectSearchMax, { filter: filterString });
    }

    try {
      const getMin = await ApiService.getSearchProducts(objectSearchMin);
      const getMax = await ApiService.getSearchProducts(objectSearchMax);

      if (getMin && getMax) {
        const minPriceUS = getMin?.results?.[0].masterVariant.prices.find(
          (price) => price.country === 'US',
        );
        const maxPriceUS = getMax?.results?.[0].masterVariant.prices.find(
          (price) => price.country === 'US',
        );

        if (minPriceUS && maxPriceUS) {
          this.minValue = minPriceUS?.value.centAmount / 100;
          this.maxValue = maxPriceUS?.value.centAmount / 100;
        }
      }

      this.filterForm.patchValue({
        minPrice: this.minValue?.toString() ?? '',
        maxPrice: this.maxValue?.toString() ?? '',
      });
    } catch (error) {
      console.error('Error get price max and min:', error);
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
    offset: number,
  ): Promise<void> {
    this.products = [];

    const filters = [
      `variants.price.centAmount:range(${minCent} to ${maxCent})`,
    ];

    if (this.filterIdCategory) {
      filters.push(`categories.id:"${this.filterIdCategory}"`);
    }

    console.log(filters);

    const range = await ApiService.getSearchProducts({
      offset: offset.toString(),
      limit: '20',
      filter: filters,
    });

    if (range) {
      for (const product of range.results) {
        this.products.push(this.mapSearchProduct(product));
      }
    }
  }

  private getColorPalette(): void {
    for (const color of this.productsSetColor) {
      this.productColors.push({
        nameColor: color.split(':')[0],
        codeColor: color.split(':')[1],
      });
    }
  }

  // public async onPriceBlur(): Promise<void> {
  //   const minValueFilter = this.filterForm
  //     .get('minPrice')
  //     ?.value?.trim()
  //     .replace(',', '.');
  //   const maxValueFilter = this.filterForm
  //     .get('maxPrice')
  //     ?.value?.trim()
  //     .replace(',', '.');

  //   const isValueMin = isPositiveNumber(minValueFilter ?? '');
  //   const isValueMax = isPositiveNumber(maxValueFilter ?? '');

  //   if (!isValueMin || !isValueMax) {
  //     this.patchValidPriceValues();
  //     return;
  //   }

  //   if (
  //     Number(minValueFilter) < this.minValue ||
  //     Number(maxValueFilter) > this.maxValue ||
  //     Number(minValueFilter) > Number(maxValueFilter)
  //   ) {
  //     this.patchValidPriceValues({
  //       min: Number(minValueFilter),
  //       max: Number(maxValueFilter),
  //     });
  //     return;
  //   }

  //   await this.loadProductsInRange(
  //     Number(minValueFilter) * 100,
  //     Number(maxValueFilter) * 100,
  //     this.filterOffset,
  //   );
  // }

  // public async onSaleButtonHandler(): Promise<void> {
  //   const isOpenValue = this.filterForm.get('isCatalogOpen')?.value;
  //   if (isOpenValue) {
  //     this.filterForm.patchValue({
  //       isCatalogOpen: false,
  //     });
  //   }
  //   this.isColor = true;
  //   this.isLoading = true;
  //   this.isLoadingNewPage = true;
  //   this.isFiltering = true;
  //   try {
  //     const response = await ApiService.getSearchProducts({
  //       limit: '20',
  //       filter: 'variants.prices.discounted.value.centAmount:range(0 to *)',
  //     });
  //     if (response) {
  //       const products = response.filter((product) => {
  //         return product.masterVariant.prices.every((price) => {
  //           const id = price.discounted?.discount?.id;
  //           return id?.trim() === this.excludedId;
  //         });
  //       });

  //       for (const product of products) {
  //         this.products.push(this.mapSearchProduct(product));

  //         const productColor = product.masterVariant.attributes.find(
  //           (element) => element.name === 'color',
  //         );

  //         if (productColor) {
  //           this.productsSetColor.add(productColor?.value['en-US']);
  //         }
  //       }
  //       this.getColorPalette();
  //     }
  //   } catch (error) {
  //     console.error('get product error:', error);
  //   } finally {
  //     this.isLoading = false;
  //     this.isLoadingNewPage = false;
  //     this.isEmpty(this.products);
  //   }
  // }

  // public async getMoreProductsHandler(): Promise<void> {
  //   if (this.isFiltering) {
  //     this.filterOffset += 20;
  //     await this.onPriceBlur();
  //   } else {
  //     this.offset += 20;
  //     await this.getProducts();
  //   }
  // }

  // public async categoriesButtonHandler(): Promise<void> {
  //   const isOpenValue = !this.filterForm.get('isCatalogOpen')?.value;

  //   this.filterForm.patchValue({
  //     isCatalogOpen: isOpenValue,
  //   });

  //   if (isOpenValue) {
  //     this.categories = [];
  //     const responseCategories = await ApiService.getCategories();

  //     if (responseCategories) {
  //       this.categories.push(...responseCategories);
  //     }
  //   }
  // }

  // public async categoryHandler(category: string): Promise<void> {
  //   this.resetAllPositions();

  //   const isOpenValue = !this.filterForm.get('isCatalogOpen')?.value;

  //   this.filterForm.patchValue({
  //     isCatalogOpen: isOpenValue,
  //   });

  //   const response = await ApiService.getSearchProducts({
  //     filter: `categories.id:"${category}"`,
  //   });

  //   if (response) {
  //     for (const product of response) {
  //       this.products.push(this.mapSearchProduct(product));

  //       const productColor = product.masterVariant.attributes.find(
  //         (element) => element.name === 'color',
  //       );

  //       if (productColor) {
  //         this.productsSetColor.add(productColor?.value['en-US']);
  //       }
  //     }
  //     this.isColor = true;
  //     this.getColorPalette();
  //   }

  //   this.isFiltering = true;
  //   this.isEmpty(this.products);
  //   this.filterIdCategory = category;
  //   await this.patchMinMaxInputs(`categories.id:"${category}"`);
  // }

  // public goToCategory(category: Category): void {
  //   const categoryName = category.name['en-US'];
  //   this.router.navigate(['/catalog/category', categoryName.toLowerCase()]);
  // }

  // public async formColorHandler(colorCode: string): Promise<void> {
  //   this.checkColor = this.checkColor === colorCode ? null : colorCode;

  //   this.filterForm.get('selectedColor')?.setValue(this.checkColor || '');

  //   if (this.checkColor) {
  //     this.products = [];

  //     const response = await ApiService.getSearchProducts({
  //       'text.en-US': this.checkColor,
  //       filter: `categories.id:"${this.filterIdCategory}"`,
  //     });

  //     if (response) {
  //       for (const product of response) {
  //         this.products.push(this.mapSearchProduct(product));
  //       }
  //     }
  //   } else {
  //     this.products = [];

  //     const response = await ApiService.getSearchProducts({
  //       filter: `categories.id:"${this.filterIdCategory}"`,
  //     });
  //     if (response) {
  //       for (const product of response) {
  //         this.products.push(this.mapSearchProduct(product));
  //       }
  //     }
  //   }
  // }

  // public async allProductButtonHandler(): Promise<void> {
  //   this.resetAllPositions();

  //   const isOpenValue = this.filterForm.get('isCatalogOpen')?.value;

  //   if (isOpenValue) {
  //     this.filterForm.patchValue({
  //       isCatalogOpen: false,
  //     });
  //   }
  //   this.isColor = false;
  //   await this.patchMinMaxInputs();
  //   await this.getProducts();
  // }

  // private mapSearchProduct(product: SearchProduct): GetMinProduct {
  //   return {
  //     id: product.id,
  //     name: product.name['en-US'],
  //     description: this.getShortDescription(product.description['en-US'], 60),
  //     price: this.calculatePrice(product.masterVariant.prices),
  //     img: product.masterVariant.images[0].url,
  //   };
  // }

  // private resetAllPositions(): void {
  //   this.products = [];
  //   this.productsSetColor.clear();
  //   this.productsColorArray = [];
  //   this.filterForm.get('selectedColor')?.reset();
  // }

  // private getColorPalette(): void {
  //   for (const color of this.productsSetColor) {
  //     this.productsColorArray.push({
  //       nameColor: color.split(':')[0],
  //       codeColor: color.split(':')[1],
  //     });
  //   }
  // }

  // private async ngOnInit(): Promise<void> {
  //   this.route.paramMap.subscribe(async (parameters) => {
  //     this.categoryName = parameters.get('name');

  //     const nameToUpperCase = this.categoryName
  //       ? this.categoryName.charAt(0).toUpperCase() + this.categoryName.slice(1)
  //       : '';

  //     const responseCategories = await ApiService.getCategories();

  //     if (responseCategories) {
  //       this.catTest = responseCategories.map((element) => ({
  //         id: element.id,
  //         name: element.name['en-US'],
  //       }));
  //     }

  //     const foundCategory = this.catTest.find(
  //       (object) => object.name === nameToUpperCase,
  //     );

  //     await (foundCategory
  //       ? this.categoryHandler(foundCategory.id)
  //       : this.getProducts());

  //     const getDiscount = await ApiService.getProductDiscounts();
  //     if (getDiscount) {
  //       this.productDiscounts.push(...getDiscount);
  //     }

  //     await this.patchMinMaxInputs();
  //   });
  // }

  // private async getProducts(): Promise<void> {
  //   this.isLoading = true;

  //   try {
  //     const responseProducts = await ApiService.getProducts(this.offset);

  //     if (responseProducts) {
  //       for (const product of responseProducts) {
  //         this.products.push({
  //           ...this.products,
  //           ...product,
  //           id: product.id,
  //           name: product.masterData.current.name['en-US'],
  //           description: this.getShortDescription(
  //             product.masterData.current.description['en-US'],
  //             60,
  //           ),
  //           price: this.calculatePrice(
  //             product.masterData.current.masterVariant.prices,
  //           ),
  //           img: product.masterData.current.masterVariant.images[0].url,
  //         });
  //       }
  //     }
  //   } catch (error) {
  //     console.error('get product error:', error);
  //   } finally {
  //     this.isLoading = false;
  //     this.isLoadingNewPage = false;
  //     this.isEmpty(this.products);
  //   }
  // }

  // // eslint-disable-next-line class-methods-use-this
  // private getShortDescription(product: string, maxLength: number): string {
  //   return product.length > maxLength
  //     ? product.slice(0, maxLength) + '...'
  //     : product;
  // }

  // private calculatePrice(product: MasterPrice[]): PriceProduct | null {
  //   const country = 'US';

  //   const basePrice = product.find(
  //     (price) => price.country === country && !price.channel,
  //   );

  //   if (!basePrice) {
  //     return null;
  //   }

  //   const currency =
  //     basePrice.value.currencyCode === 'USD'
  //       ? '$'
  //       : basePrice.value.currencyCode;

  //   const price = basePrice.value.centAmount / 100;

  //   if (basePrice.discounted) {
  //     const discount = this.productDiscounts.find(
  //       (discount) => discount.id === basePrice.discounted?.discount.id,
  //     );

  //     const nameDiscount = `-${discount?.name['en-US'].slice(0, 3)}`;

  //     const discountedPrice = basePrice.discounted.value.centAmount / 100;
  //     return { price, currency, discountedPrice, nameDiscount };
  //   }

  //   return { price, currency };
  // }

  // private async patchMinMaxInputs(filter = ''): Promise<void> {
  //   if (this.isFiltering) {
  //     this.getMinMaxPrice(filter);
  //   } else {
  //     this.getMinMaxPrice('');
  //   }
  // }

  // private async getMinMaxPrice(filterString: string): Promise<void> {
  //   const objectSearchMin = {
  //     sort: 'price asc',
  //     limit: '1',
  //   };

  //   const objectSearchMax = {
  //     sort: 'price desc',
  //     limit: '1',
  //   };

  //   if (filterString) {
  //     Object.assign(objectSearchMin, { filter: filterString });
  //     Object.assign(objectSearchMax, { filter: filterString });
  //   }

  //   try {
  //     const getMin = await ApiService.getSearchProducts(objectSearchMin);
  //     const getMax = await ApiService.getSearchProducts(objectSearchMax);

  //     if (getMin && getMax) {
  //       const minPriceUS = getMin?.[0].masterVariant.prices.find(
  //         (price) => price.country === 'US',
  //       );
  //       const maxPriceUS = getMax?.[0].masterVariant.prices.find(
  //         (price) => price.country === 'US',
  //       );

  //       if (minPriceUS && maxPriceUS) {
  //         this.minValue = minPriceUS?.value.centAmount / 100;
  //         this.maxValue = maxPriceUS?.value.centAmount / 100;
  //       }
  //     }

  //     this.filterForm.patchValue({
  //       minPrice: this.minValue?.toString() ?? '',
  //       maxPrice: this.maxValue?.toString() ?? '',
  //     });
  //   } catch (error) {
  //     console.error('Error get price max and min:', error);
  //   }
  // }

  // private patchValidPriceValues(input?: { min: number; max: number }): void {
  //   const patch: Partial<{ minPrice: string; maxPrice: string }> = {};

  //   if (!input || input.min < this.minValue) {
  //     patch.minPrice = this.minValue?.toString().trim() ?? '';
  //   }

  //   if (!input || input.max > this.maxValue) {
  //     patch.maxPrice = this.maxValue?.toString().trim() ?? '';
  //   }

  //   this.filterForm.patchValue(patch);
  // }

  // private async loadProductsInRange(
  //   minCent: number,
  //   maxCent: number,
  //   filterOffset: number,
  // ): Promise<void> {
  //   if (!this.isFiltering) {
  //     this.products = [];
  //     this.isLoadingNewPage = true;
  //     this.isFiltering = true;
  //   }

  //   const filters = [
  //     `variants.price.centAmount:range(${minCent} to ${maxCent})`,
  //   ];

  //   if (this.filterIdCategory.length > 0) {
  //     filters.push(`categories.id:"${this.filterIdCategory}"`);
  //   }

  //   const range = await ApiService.getSearchProducts({
  //     offset: filterOffset.toString(),
  //     limit: '20',
  //     filter: filters,
  //   });

  //   if (range) {
  //     for (const product of range) {
  //       this.products.push(this.mapSearchProduct(product));
  //     }
  //   }
  //   this.isEmpty(this.products);
  //   this.isLoadingNewPage = false;
  // }

  // private isEmpty(product: GetMinProduct[] | SearchProduct[]): void {
  //   this.isEmptyCatalog = product.length === 0 ? true : false;
  // }
}
