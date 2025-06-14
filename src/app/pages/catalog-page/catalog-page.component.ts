import { Component, OnInit } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Category } from '../../utils/interfaces/interface-categories';
import { ActivatedRoute, Router } from '@angular/router';
import {
  GetSearchProduct,
  SearchProduct,
} from '../../utils/interfaces/interface-product-search';
import {
  MasterPrice,
  ProductDiscounts,
} from '../../utils/interfaces/interface-product';
import { isPositiveNumber } from '../../utils/is-positive-number';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { getShortDescription } from '../../utils/get-short-description';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { getFormatPrice } from '../../utils/get-format-price';
import {
  CategoriesIdSlug,
  Color,
  inputValueObject,
  PriceProduct,
  ProductColor,
} from '../../utils/interfaces/interface-catalog-page';
import { LocalStorageService } from '../../services/local-storage.service';
import { CartService } from '../../services/cart.service';

export interface GetMinProduct {
  id: string;
  name: string;
  description: string;
  price: PriceProduct | null;
  img: string;
  isInCart?: boolean;
}

@Component({
  selector: 'app-catalog-page',
  imports: [NgIf, NgClass, ReactiveFormsModule, ProductCardComponent],
  templateUrl: './catalog-page.component.html',
  styleUrl: './catalog-page.component.scss',
})
export class CatalogPageComponent implements OnInit {
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
  public isColor = false;

  private cartProducts: string[] = [];
  private CategoriesIdsNames: CategoriesIdSlug[] = [];
  private productsDiscount: ProductDiscounts[] = [];
  private offset = 0;
  private excludedId = '9ad4266a-0e46-4c4c-9ae4-cac3e1dd59ff';
  private isNewPage: boolean = true;
  private filterIdCategory = '';
  private prevNumberMin = 0;
  private prevNumberMax = 0;
  private sortChange: string | null = 'default';
  private isSaleOpen = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  private static applySortOption(
    parameters: { offset?: string; filter?: string | string[] },
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

  private static filterByColor(
    products: SearchProduct[],
    hexColor: string,
  ): SearchProduct[] {
    const hexToMatch = hexColor.toLowerCase();
    return products.filter((product) => {
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

  private static isPriseContainsUSDCheck(input: string): boolean {
    if (!input || typeof input !== 'string') {
      return false;
    }
    return input.includes('USD');
  }

  public async ngOnInit(): Promise<void> {
    await this.sortFormSubscribe();
    await this.searchFormSubcribe();
    if (LocalStorageService.getLoginState() === 'true') {
      await this.getCartProducts();
    }
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
        this.isSaleOpen = true;
        await this.onSaleButtonHandler();
      } else if (nameFromRoute.length === 0) {
        this.sortForm.get('selectedSort')?.setValue('price-asc');
        await this.patchMinMaxInputs({});
        await this.allProductsRange(this.offset);
      } else if (foundCategory) {
        this.filterIdCategory = foundCategory.id;

        this.activeFilters.push(foundCategory.slug);
        await this.patchMinMaxInputs({
          filter: [`categories.id:"${this.filterIdCategory}"`],
        });

        await this.categoryHandler(foundCategory.id);
      } else {
        this.isNoProducts = true;
      }
    });
  }

  public async onPriceBlur(): Promise<void> {
    const { numberMin, numberMax, isValueMin, isValueMax } =
      this.getParsedInputValues();

    const min = Math.round(numberMin * 100);
    const max = Math.round(numberMax * 100);

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
    this.isNewPage = true;
    this.isLoadingProducts = true;
    this.offset = 0;
    await this.loadProductsInRange(min, max, this.offset);
    this.isLoadingProducts = false;
    this.setPreviousValues(numberMin, numberMax);
  }

  public async allProductButtonHandler(): Promise<void> {
    this.router.navigate(['/catalog']);
    this.isNoProducts = false;
    this.isNewPage = true;
    this.products = [];
    this.filterIdCategory = '';
    this.sortChange = 'default';
    this.sortForm.get('selectedSort')?.setValue('default');
    this.offset = 0;
    await this.getProducts();
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
          for (const category of responseCategories) {
            if (category.id !== '40ef5f03-e5f7-4234-9a4a-71e5efa0b604') {
              this.categories.push(category);
            }
          }
        }
      }
    } catch (error) {
      console.error('categoriesButton error:', error);
    } finally {
      this.isLoadingCategories = false;
    }
  }

  public async onSaleButtonHandler(): Promise<void> {
    this.isSaleOpen = true;
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
        filter: [
          `variants.prices.discounted.discount.id:"${this.excludedId}"`,
          'variants.prices.discounted.value.centAmount:range(0 to *)',
        ],
      });
      if (response) {
        for (const product of response.results) {
          const mappedProduct = this.mapSearchProduct(product);
          mappedProduct.isInCart = this.isProductInCart(product.id);
          this.products.push(mappedProduct);
        }
      }
      await this.patchMinMaxInputs({
        filter: [
          'variants.prices.discounted.value.centAmount:range(0 to *)',
          `variants.prices.discounted.discount.id:"${this.excludedId}"`,
        ],
      });
    } catch (error) {
      console.error('get product error:', error);
    } finally {
      this.isLoadingProducts = false;
    }
  }

  public async categoryHandler(category: string): Promise<void> {
    this.isColor = false;
    this.activeFiltersColors = [];
    const getMinPriceRaw = this.filterForm.get('minPrice')?.value;
    const getMaxPriceRaw = this.filterForm.get('maxPrice')?.value;

    const getMinPrice = getMinPriceRaw == null ? 0 : Number(getMinPriceRaw);
    const getMaxPrice =
      getMaxPriceRaw == null ? Number.MAX_SAFE_INTEGER : Number(getMaxPriceRaw);
    this.isSaleOpen = false;

    if (this.isNewPage) {
      this.isLoadingProducts = true;
    }
    this.isLoading = true;
    const objectCategory: {
      offset: string;
      filter: string[] | string;
      sort?: string;
    } = {
      offset: this.offset.toString(),
      filter: [
        `categories.id:"${category}"`,
        `variants.price.centAmount:range(${getMinPrice * 100} to ${getMaxPrice * 100})`,
      ],
    };

    CatalogPageComponent.applySortOption(
      objectCategory,
      this.sortChange ?? 'default',
    );

    try {
      await (this.sortChange === 'price-asc'
        ? this.sortingAscCategory(objectCategory)
        : this.forAndPushSearchProducts(objectCategory));

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

  public async goToCategory(category: Category): Promise<void> {
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
    //         await  this.patchMinMaxInputs({
    //   filter: [`categories.id:"${this.filterIdCategory}"`],
    // });
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

    await (this.filterIdCategory
      ? this.categoryHandler(this.filterIdCategory)
      : this.allProductsRange(this.offset));
  }

  public async formColorHandler({
    colorName,
    colorCode,
  }: Color): Promise<void> {
    const isUnselecting = this.checkColor === colorCode;
    this.checkColor = isUnselecting ? null : colorCode;

    this.filterForm.get('selectedColor')?.setValue(this.checkColor || '');
    this.updateActiveFiltersColors(this.checkColor ? colorName : null);

    if (isUnselecting) {
      this.products = [];
      this.isColor = false;
      await this.categoryHandler(this.filterIdCategory);
      return;
    }

    await this.loadFilteredProducts();
  }

  public isProductInCart(productId: string): boolean {
    return this.cartProducts.includes(productId);
  }

  private async getCartProducts(): Promise<void> {
    const getIdCustomer = LocalStorageService.getCustomerId();

    if (getIdCustomer.length > 0) {
      try {
        const responsive =
          await CartService.getCustomerCartByCustomerId(getIdCustomer);

        if (responsive) {
          for (const cartProduct of responsive.lineItems) {
            this.cartProducts.push(cartProduct.productId);
          }
        }
      } catch (error) {
        console.error(`Get cart products: ${error}`);
      }
    }
  }

  private async loadFilteredProducts(): Promise<void> {
    this.isColor = true;
    const getFormMinPrice = this.filterForm.get('minPrice')?.value;
    const getFormMaxPrice = this.filterForm.get('maxPrice')?.value;
    const getFormSearchValue = this.filterForm.get('search')?.value;
    const getSortFormValue = this.sortForm.get('selectedSort')?.value;
    const min = Math.round(Number(getFormMinPrice) * 100);
    const max = Math.round(Number(getFormMaxPrice) * 100);
    const searchObject: Record<string, string | string[]> = {
      limit: '100',
      fuzzy: 'true',
      fuzzyLevel: '1',
      filter: [
        `categories.id:"${this.filterIdCategory}"`,
        `variants.price.centAmount:range(${min} to ${max})`,
      ],
    };
    if (getSortFormValue !== 'default') {
      CatalogPageComponent.applySortOption(
        searchObject,
        getSortFormValue ?? 'default',
      );
    }
    if (getFormSearchValue) {
      searchObject['text.en-US'] = getFormSearchValue;
    }
    this.isLoadingProducts = true;
    this.products = [];
    const response = await ApiService.getSearchProducts(searchObject);
    if (response) {
      let filteredResults = response.results;
      if (this.checkColor) {
        filteredResults = CatalogPageComponent.filterByColor(
          response.results,
          this.checkColor,
        );
      }
      for (const product of filteredResults) {
        const mappedProduct = this.mapSearchProduct(product);
        mappedProduct.isInCart = this.isProductInCart(product.id);
        this.products.push(mappedProduct);
      }
      this.totalProduct = this.products.length > 20;
      if (this.products.length >= response.total) {
        this.totalProduct = false;
      }
    }

    this.isLoadingProducts = false;
  }

  private async allProductsRange(offset: number): Promise<void> {
    const { numberMin, numberMax } = this.getParsedInputValues();

    const min = Math.round(numberMin * 100);
    const max = Math.round(numberMax * 100);

    this.loadProductsInRange(min, max, offset);
  }

  private async sortingAscCategory(objectCategory: {
    offset: string;
    filter: string | string[];
    sort?: string;
  }): Promise<void> {
    Object.assign(objectCategory, { limit: '50' });
    try {
      const response = await ApiService.getSearchProducts(objectCategory);

      if (response) {
        const responseSort = response.results.sort((a, b) => {
          const priceA =
            a.masterVariant.prices.find((p) =>
              CatalogPageComponent.isPriseContainsUSDCheck(p.key),
            )?.value.centAmount ?? Infinity;
          const priceB =
            b.masterVariant.prices.find((p) =>
              CatalogPageComponent.isPriseContainsUSDCheck(p.key),
            )?.value.centAmount ?? Infinity;
          return priceA - priceB;
        });
        for (const product of responseSort) {
          this.products.push(this.mapSearchProduct(product));
        }
      }
    } catch (error) {
      console.error('sort asc error', error);
    }
  }

  private updateActiveFiltersColors(colorName: string | null): void {
    this.activeFiltersColors = [];
    if (colorName) {
      this.activeFiltersColors.push(colorName.toLowerCase());
    }
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
        this.offset = 0;
        if (searchTerm === '') {
          await this.handleEmptySearch();
          return;
        }

        if (searchTerm.length < 3) {
          return;
        }

        await this.handleSearchByTerm(searchTerm);
      });
  }

  private async handleEmptySearch(): Promise<void> {
    this.products = [];
    this.isNoProducts = false;
    if (this.filterIdCategory) {
      await this.categoryHandler(this.filterIdCategory);
      await this.patchMinMaxInputs({
        filter: [`categories.id:"${this.filterIdCategory}"`],
      });
      await this.getAllColors(this.filterIdCategory);
    } else if (this.isSaleOpen) {
      await this.onSaleButtonHandler();
    } else {
      await this.getProducts();
      await this.patchMinMaxInputs({});
    }
  }

  private async handleSearchByTerm(searchTerm: string): Promise<void> {
    const searchObject: Record<string, string | string[]> = {
      'text.en-US': searchTerm,
      fuzzy: 'true',
      fuzzyLevel: '1',
    };

    if (this.filterIdCategory) {
      await this.searchInCategory(searchObject);
      return;
    }

    if (this.isSaleOpen) {
      await this.searchInDiscount(searchObject);
      return;
    }

    await this.searchGeneral(searchObject);
  }

  private async searchInCategory(
    searchObject: Record<string, string | string[]>,
  ): Promise<void> {
    const getSortFormValue = this.sortForm.get('selectedSort')?.value;

    const searchText = searchObject['text.en-US'];
    if (typeof searchText !== 'string') return;

    await this.patchMinMaxInputs({
      filter: [`categories.id:"${this.filterIdCategory}"`],
      name: searchText,
    });

    const { numberMin, numberMax } = this.getParsedInputValues();

    Object.assign(searchObject, {
      filter: `variants.price.centAmount:range(${numberMin * 100} to ${numberMax * 100})`,
    });

    Object.assign(searchObject, {
      filter: `categories.id:"${this.filterIdCategory}"`,
    });
    if (getSortFormValue !== 'default') {
      CatalogPageComponent.applySortOption(
        searchObject,
        getSortFormValue ?? 'default',
      );
    }
    this.isNewPage = true;
    await this.getAllColors(this.filterIdCategory);
    await this.forAndPushSearchProducts(searchObject);
  }

  private async searchInDiscount(
    searchObject: Record<string, string | string[]>,
  ): Promise<void> {
    const searchText = searchObject['text.en-US'];
    if (typeof searchText !== 'string') return;

    await this.patchMinMaxInputs({ name: searchText });

    const { numberMin, numberMax } = this.getParsedInputValues();

    Object.assign(searchObject, {
      filter: [
        `variants.prices.discounted.discount.id:"${this.excludedId}"`,
        'variants.prices.discounted.value.centAmount:range(0 to *)',
        `variants.price.centAmount:range(${numberMin * 100} to ${numberMax * 100})`,
      ],
    });

    await this.forAndPushSearchProducts(searchObject);
  }

  private async searchGeneral(
    searchObject: Record<string, string | string[]>,
  ): Promise<void> {
    const searchText = searchObject['text.en-US'];
    if (typeof searchText !== 'string') return;

    await this.patchMinMaxInputs({ name: searchText });

    const { numberMin, numberMax } = this.getParsedInputValues();

    Object.assign(searchObject, {
      filter: `variants.price.centAmount:range(${numberMin * 100} to ${numberMax * 100})`,
    });

    this.isNewPage = true;
    await this.forAndPushSearchProducts(searchObject);
    this.isNewPage = false;
  }

  private async forAndPushSearchProducts(
    object: Record<string, string | string[]>,
  ): Promise<void> {
    const searchProduct = await ApiService.searchProductsByName(object);

    if (searchProduct) {
      if (this.isNewPage) {
        this.products = [];
      }

      this.totalProduct = searchProduct.total > 20;

      for (const product of searchProduct.results) {
        const mappedProduct = this.mapSearchProduct(product);
        mappedProduct.isInCart = this.isProductInCart(product.id);
        this.products.push(mappedProduct);
      }

      this.totalProduct = this.products.length < searchProduct.total;
      this.isNoProducts = searchProduct.total === 0;
    }
  }

  private async getAllColors(category: string): Promise<void> {
    const getFormMinPrice = this.filterForm.get('minPrice')?.value;
    const getFormMaxPrice = this.filterForm.get('maxPrice')?.value;
    const getFormSearchValue = this.filterForm.get('search')?.value;
    const getSortFormValue = this.sortForm.get('selectedSort')?.value;

    const min = Math.round(Number(getFormMinPrice) * 100);
    const max = Math.round(Number(getFormMaxPrice) * 100);

    const searchObject: Record<string, string | string[]> = {
      offset: '0',
      limit: '100',
      fuzzy: 'true',
      fuzzyLevel: '1',
      filter: [
        `categories.id:"${category}"`,
        `variants.price.centAmount:range(${min} to ${max})`,
      ],
    };

    if (getSortFormValue !== 'default') {
      CatalogPageComponent.applySortOption(
        searchObject,
        getSortFormValue ?? 'default',
      );
    }
    if (getFormSearchValue) {
      searchObject['text.en-US'] = getFormSearchValue;
    }

    const responsePriceProduct =
      await ApiService.getSearchProducts(searchObject);

    if (!responsePriceProduct) return;

    this.productsSetColor.clear();
    this.productColors = [];

    for (const product of responsePriceProduct.results) {
      const productColor = product.masterVariant.attributes.find(
        (element) => element.name === 'color' || element.name === 'finish',
      );

      if (productColor) {
        this.productsSetColor.add(productColor.value['en-US']);
      }
    }

    this.getColorPalette();
  }

  private async getProducts(): Promise<void> {
    if (this.isNewPage) {
      this.isLoadingProducts = true;
    }
    this.isSaleOpen = false;
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
      name: getShortDescription(product.name['en-US'], 30),
      description: getShortDescription(product.description['en-US'], 60),
      price: this.calculatePrice(product.masterVariant.prices),
      img: product.masterVariant.images[0].url,
    };
  }

  private calculatePrice(product: MasterPrice[]): PriceProduct | null {
    let distributionPrice = product.find(
      (price) =>
        CatalogPageComponent.isPriseContainsUSDCheck(price.key) &&
        price.key?.endsWith('_dist'),
    );

    if (!distributionPrice) {
      distributionPrice = product.find(
        (price) =>
          CatalogPageComponent.isPriseContainsUSDCheck(price.key) &&
          !price.channel,
      );
    }

    if (!distributionPrice) {
      return null;
    }

    const currency = '';

    const price = getFormatPrice(distributionPrice.value.centAmount / 100);

    if (distributionPrice.discounted) {
      const discount = this.productsDiscount.find(
        (discount) => discount.id === distributionPrice.discounted?.discount.id,
      );

      const nameDiscount = `-${discount?.name['en-US'].slice(0, 3)}`;

      const discountedPrice = getFormatPrice(
        distributionPrice.discounted.value.centAmount / 100,
      );
      return { price, currency, discountedPrice, nameDiscount };
    }

    return { price, currency };
  }

  private async patchMinMaxInputs(
    filtersObject: inputValueObject,
  ): Promise<void> {
    const sortingMin = 'price asc';
    const sortingMax = 'price desc';

    const maxObjectPrice: Record<string, string | string[]> = {
      limit: '1',
    };

    const minObjectPrice: Record<string, string | string[]> = {
      limit: '1',
    };

    if (filtersObject.name) {
      Object.assign(maxObjectPrice, {
        fuzzy: 'true',
        fuzzyLevel: '1',
        ['text.en-US']: filtersObject.name,
      });
      Object.assign(minObjectPrice, {
        fuzzy: 'true',
        fuzzyLevel: '1',
        ['text.en-US']: filtersObject.name,
      });
    }

    Object.assign(minObjectPrice, { sort: sortingMin });
    Object.assign(maxObjectPrice, { sort: sortingMax });

    if (
      Array.isArray(filtersObject.filter) &&
      filtersObject.filter.length > 0
    ) {
      minObjectPrice['filter'] = filtersObject.filter;
      maxObjectPrice['filter'] = filtersObject.filter;
    }

    try {
      const getMin = await ApiService.getSearchProducts(minObjectPrice);
      const getMax = await ApiService.getSearchProducts(maxObjectPrice);

      if (getMin && getMax) {
        this.updateValueInput(getMin, getMax);
      }
    } catch (error) {
      console.error('getMinPrice error:', error);
    }
  }

  private updateValueInput(
    getMin: GetSearchProduct,
    getMax: GetSearchProduct,
  ): void {
    const minResult = getMin?.results?.[0];
    const maxResult = getMax?.results?.[0];

    if (!minResult || !maxResult) {
      this.filterForm.patchValue({
        minPrice: '',
        maxPrice: '',
      });
      return;
    }

    const minPriceUS = minResult.masterVariant.prices.find((price) =>
      CatalogPageComponent.isPriseContainsUSDCheck(price.key),
    );
    const maxPriceUS = maxResult.masterVariant.prices.find((price) =>
      CatalogPageComponent.isPriseContainsUSDCheck(price.key),
    );

    if (minPriceUS && maxPriceUS) {
      const actualMin =
        minPriceUS.discounted?.value.centAmount ?? minPriceUS.value.centAmount;
      const actualMax =
        maxPriceUS.discounted?.value.centAmount ?? maxPriceUS.value.centAmount;

      this.minValue = actualMin / 100;
      this.maxValue = actualMax / 100;

      this.prevNumberMin = this.minValue;
      this.prevNumberMax = this.maxValue;

      this.filterForm.patchValue({
        minPrice: this.minValue.toString(),
        maxPrice: this.maxValue.toString(),
      });
    } else {
      this.filterForm.patchValue({
        minPrice: '',
        maxPrice: '',
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
    offset: number,
  ): Promise<void> {
    const getSearchFormValue = this.filterForm.get('search')?.value?.trim();
    const getSortFormValue = this.sortForm.get('selectedSort')?.value;
    if (this.isNewPage) {
      this.products = [];
    }
    this.isNewPage = false;
    const filters = [
      `variants.price.centAmount:range(${minCent} to ${maxCent})`,
    ];
    if (this.filterIdCategory) {
      filters.push(`categories.id:"${this.filterIdCategory}"`);
      await this.getAllColors(this.filterIdCategory);
    }
    if (this.isSaleOpen) {
      filters.push(
        `variants.prices.discounted.discount.id:"${this.excludedId}"`,
      );
    }
    const searchObject: Record<string, string | string[]> = {
      offset: offset.toString(),
      limit: '20',
      filter: filters,
    };
    if (getSortFormValue !== 'default') {
      CatalogPageComponent.applySortOption(
        searchObject,
        getSortFormValue ?? 'default',
      );
    }
    if (getSearchFormValue && getSearchFormValue.length >= 3) {
      searchObject['text.en-US'] = getSearchFormValue;
    }

    const range = await ApiService.getSearchProducts(searchObject);
    if (range) {
      this.addLoadRange(range);
    }
  }

  private addLoadRange(range: GetSearchProduct): void {
    this.totalProduct = range.total > 20;
    for (const product of range.results) {
      const mappedProduct = this.mapSearchProduct(product);
      mappedProduct.isInCart = this.isProductInCart(product.id);
      this.products.push(mappedProduct);
    }
    if (this.products.length >= range.total) {
      this.totalProduct = false;
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
