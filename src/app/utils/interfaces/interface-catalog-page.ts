export interface GetMinProduct {
  id: string;
  name: string;
  description: string;
  price: PriceProduct | null;
  img: string;
}

export type PriceProduct = {
  price: string;
  currency: string;
  discountedPrice?: string;
  nameDiscount?: string;
};

export interface ProductColor {
  nameColor: string;
  codeColor: string;
}

export interface CategoriesIdSlug {
  id: string;
  slug: string;
}

export interface Color {
  colorName: string;
  colorCode: string;
}

export interface inputValueObject {
  name?: string;
  filter?: string[];
}
