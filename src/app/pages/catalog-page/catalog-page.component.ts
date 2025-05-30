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
import { getShortDescription } from '../../utils/get-short-description';
import { debounceTime, distinctUntilChanged } from 'rxjs';

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

interface Color {
  colorName: string;
  colorCode: string;
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
    search: new FormControl(''),
  });

  public sortForm = new FormGroup({
    selectedSort: new FormControl('default'),
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
  public activeFilters: string[] = [];
  public activeFiltersColors: string[] = [];

  private CategoriesIdsNames: CategoriesIdSlug[] = [];
  private productsDiscount: ProductDiscounts[] = [];
  private offset = 0;
  private excludedId = '9ad4266a-0e46-4c4c-9ae4-cac3e1dd59ff';
  private isNewPage: boolean = true;
  private filterIdCategory = '';
  private prevNumberMin = 0;
  private prevNumberMax = 0;
  private sortChange: string | null = 'default';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  private static applySortOption(
    parameters: { offset: string; filter: string },
    sortChange: string,
  ): void {
    if (sortChange !== 'default') {
      switch (sortChange) {
        case 'price-asc': {
          Object.assign(parameters, { sort: 'price asc' });
          break;
        }
        case 'price-desc': {
          Object.assign(parameters, { sort: 'price desc' });
          break;
        }
        case 'name-asc': {
          Object.assign(parameters, { sort: 'name.en-US asc' });
          break;
        }
        case 'name-desc': {
          Object.assign(parameters, { sort: 'name.en-US desc' });
          break;
        }
      }
    }
  }

  public async onPriceBlur(): Promise<void> {
    const { numberMin, numberMax, isValueMin, isValueMax } =
      this.getParsedInputValues();

    if (this.isFirstBlur(numberMin, numberMax)) return;

    if (this.isSameAsPrevious(numberMin, numberMax)) return;

    if (!isValueMin || !isValueMax) {
      this.patchValidPriceValues();
      return;
    }

    if (!this.isInValidRange(numberMin, numberMax)) {
      this.patchValidPriceValues({ min: numberMin, max: numberMax });
      return;
    }

    await this.loadProductsInRange(
      numberMin * 100,
      numberMax * 100,
      this.offset,
    );
    this.setPreviousValues(numberMin, numberMax);
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
    if (this.isNewPage) {
      this.isLoadingProducts = true;
    }
    this.isLoading = true;

    const objectTest: { offset: string; filter: string; sort?: string } = {
      offset: this.offset.toString(),
      filter: `categories.id:"${category}"`,
    };

    CatalogPageComponent.applySortOption(
      objectTest,
      this.sortChange ?? 'default',
    );

    try {
      const response = await ApiService.getSearchProducts(objectTest);
      console.log(response, 'response');
      if (response) {
        this.totalProduct = response.total > 20;

        for (const product of response.results) {
          this.products.push(this.mapSearchProduct(product));
        }

        if (this.products.length >= response.total) {
          this.totalProduct = false;
        }
      }

      if (this.isNewPage) {
        this.getAllColors(category);
      }
    } catch (error) {
      console.error('get categories error:', error);
    } finally {
      this.isLoadingProducts = false;
      this.isLoading = false;
      this.isNewPage = false;
    }
  }

  public goToCategory(category: Category): void {
    this.filterForm.patchValue({
      isCatalogOpen: false,
    });

    if (category.id === this.filterIdCategory) {
      return;
    }

    this.isNewPage = true;
    this.products = [];
    this.isNoProducts = false;
    this.productsSetColor.clear();
    this.productColors = [];
    this.offset = 0;

    const categorySlug = category.slug['en-US'].toLowerCase();

    this.activeFilters = this.activeFilters.filter(
      (filter) =>
        !this.CategoriesIdsNames.some(
          (cat) => cat.slug.toLowerCase() === filter.toLowerCase(),
        ),
    );

    this.router.navigate(['/catalog/category', categorySlug]);
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
    if (this.filterIdCategory) {
      this.offset += 20;

      await this.categoryHandler(this.filterIdCategory);
    } else {
      this.offset += 20;
      await this.getProducts();
    }
  }

  public async formColorHandler({
    colorName,
    colorCode,
  }: Color): Promise<void> {
    this.checkColor = this.checkColor === colorCode ? null : colorCode;

    this.filterForm.get('selectedColor')?.setValue(this.checkColor || '');
    this.isLoadingProducts = true;

    this.products = [];
    this.updateActiveFiltersColors(this.checkColor ? colorName : null);
    const response = await ApiService.getSearchProducts({
      filter: `categories.id:"${this.filterIdCategory}"`,
      limit: '50',
    });
    if (response) {
      let filteredResults = response.results;
      if (this.checkColor) {
        const hexToMatch = this.checkColor.toLowerCase();
        console.log(colorCode);
        filteredResults = response.results.filter((product) => {
          const variants = [product.masterVariant];
          return variants.some((variant) => {
            const colorAttribute = variant.attributes.find(
              (atr) => atr.name === 'color',
            );
            const finishAttribute = variant.attributes.find(
              (atr) => atr.name === 'finish',
            );
            const matchesColor = colorAttribute?.value?.['en-US']
              .toLowerCase()
              .includes(hexToMatch);
            const matchesFinish = finishAttribute?.value?.['en-US']
              .toLowerCase()
              .includes(hexToMatch);

            return matchesColor || matchesFinish;
          });
        });
      }
      for (const product of filteredResults) {
        this.products.push(this.mapSearchProduct(product));
      }
      this.totalProduct = this.products.length > 20;
      if (this.products.length >= response.total) {
        this.totalProduct = false;
      }
    }
    this.isLoadingProducts = false;
  }

  private updateActiveFiltersColors(colorName: string | null): void {
    this.activeFiltersColors = [];
    if (colorName) {
      this.activeFiltersColors.push(colorName.toLowerCase());
    }
  }

  private async ngOnInit(): Promise<void> {
    this.isNewPage = true;

    await this.sortFormSubscribe();
    await this.searchFormSubcribe();
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
        this.activeFilters.push(nameFromRoute);
        await this.onSaleButtonHandler();
      } else if (nameFromRoute.length === 0) {
        await this.getProducts();
        this.patchMinMaxInputs();
      } else if (foundCategory) {
        this.filterIdCategory = foundCategory.id;

        this.activeFilters.push(foundCategory.slug);

        await this.categoryHandler(foundCategory.id);
        this.patchMinMaxInputs(`categories.id:"${foundCategory.id}"`);
      } else {
        this.isNoProducts = true;
      }
    });
  }

  private async sortFormSubscribe(): Promise<void> {
    this.sortForm.get('selectedSort')?.valueChanges.subscribe(async (value) => {
      this.sortChange = value;

      if (this.filterIdCategory) {
        this.products = [];
        await this.categoryHandler(this.filterIdCategory);
      }
    });
  }

  private async searchFormSubcribe(): Promise<void> {
    this.filterForm
      .get('search')!
      .valueChanges.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(async (rawSearchTerm: string | null) => {
        const searchTerm = rawSearchTerm?.trim() ?? '';

        if (searchTerm === '') {
          if (this.filterIdCategory) {
            this.products = [];
            await this.categoryHandler(this.filterIdCategory);
          } else {
            this.products = [];
            await this.getProducts();
          }
          return;
        }

        if (searchTerm.length < 2) {
          return;
        }

        const searchObject = {
          'text.en-US': searchTerm,
          fuzzy: 'true',
          fuzzyLevel: '1',
        };

        if (this.filterIdCategory) {
          this.products = [];
          Object.assign(searchObject, {
            filter: `categories.id:"${this.filterIdCategory}"`,
          });
          await this.testing(searchObject);
        } else {
          const searchProduct =
            await ApiService.getSearchProducts(searchObject);

          if (searchProduct) {
            this.products = [];
            for (const product of searchProduct.results) {
              this.products.push(this.mapSearchProduct(product));
            }
          }
        }
      });
  }

  private async testing(object: {
    'text.en-US': string;
    fuzzy: string;
    fuzzyLevel: string;
  }): Promise<void> {
    const searchProduct = await ApiService.getSearchProducts(object);

    if (searchProduct) {
      this.products = [];
      for (const product of searchProduct.results) {
        this.products.push(this.mapSearchProduct(product));
      }
    }
  }

  private async getAllColors(category: string): Promise<void> {
    const responseAllSearch = await ApiService.getSearchProducts({
      offset: this.offset.toString(),
      limit: '50',
      filter: `categories.id:"${category}"`,
    });

    if (responseAllSearch) {
      for (const product of responseAllSearch.results) {
        const productColor = product.masterVariant.attributes.find(
          (element) => element.name === 'color' || element.name === 'finish',
        );

        if (productColor) {
          this.productsSetColor.add(productColor?.value['en-US']);
        }
      }

      this.getColorPalette();
    }
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
            description: getShortDescription(
              product.masterData.current.description['en-US'],
              60,
            ),
            price: this.calculatePrice(
              product.masterData.current.masterVariant.prices,
            ),
            img: product.masterData.current.masterVariant.images[0].url,
          });
        }

        if (this.products.length >= responseProducts.total) {
          this.totalProduct = false;
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
      description: getShortDescription(product.description['en-US'], 60),
      price: this.calculatePrice(product.masterVariant.prices),
      img: product.masterVariant.images[0].url,
    };
  }

  private calculatePrice(product: MasterPrice[]): PriceProduct | null {
    const country = 'US';

    let distributionPrice = product.find(
      (price) => price.country === country && price.key?.endsWith('_dist'),
    );

    if (!distributionPrice) {
      distributionPrice = product.find(
        (price) => price.country === country && !price.channel,
      );
    }

    if (!distributionPrice) {
      return null;
    }

    const currency =
      distributionPrice.value.currencyCode === 'USD'
        ? '$'
        : distributionPrice.value.currencyCode;

    const price = distributionPrice.value.centAmount / 100;

    if (distributionPrice.discounted) {
      const discount = this.productsDiscount.find(
        (discount) => discount.id === distributionPrice.discounted?.discount.id,
      );

      const nameDiscount = `-${discount?.name['en-US'].slice(0, 3)}`;

      const discountedPrice =
        distributionPrice.discounted.value.centAmount / 100;
      return { price, currency, discountedPrice, nameDiscount };
    }

    return { price, currency };
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

          this.prevNumberMin = minPriceUS?.value.centAmount / 100;
          this.prevNumberMax = maxPriceUS?.value.centAmount / 100;
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

  private getParsedInputValues(): {
    numberMin: number;
    numberMax: number;
    isValueMin: boolean;
    isValueMax: boolean;
  } {
    const minValueFilter =
      this.filterForm.get('minPrice')?.value?.trim().replace(',', '.') ?? '';
    const maxValueFilter =
      this.filterForm.get('maxPrice')?.value?.trim().replace(',', '.') ?? '';

    const isValueMin = isPositiveNumber(minValueFilter);
    const isValueMax = isPositiveNumber(maxValueFilter);

    return {
      numberMin: Number(minValueFilter),
      numberMax: Number(maxValueFilter),
      isValueMin,
      isValueMax,
    };
  }

  private isFirstBlur(numberMin: number, numberMax: number): boolean {
    if (this.prevNumberMin === undefined && this.prevNumberMax === undefined) {
      this.setPreviousValues(numberMin, numberMax);
      return true;
    }
    return false;
  }

  private isSameAsPrevious(numberMin: number, numberMax: number): boolean {
    return numberMin === this.prevNumberMin && numberMax === this.prevNumberMax;
  }

  private isInValidRange(numberMin: number, numberMax: number): boolean {
    return (
      numberMin >= this.minValue &&
      numberMax <= this.maxValue &&
      numberMin <= numberMax
    );
  }

  private setPreviousValues(min: number, max: number): void {
    this.prevNumberMin = min;
    this.prevNumberMax = max;
  }
}
