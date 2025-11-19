export interface Product {
  id: string;
  brand: string;
  model: string;
  price?: string;
  imgUrl: string;
}

export interface ProductDetail extends Product {
  cpu?: string;
  ram?: string;
  os?: string;
  displayResolution?: string;
  battery?: string;
  primaryCamera?: string | string[];
  secondaryCmera?: string | string[];
  internalMemory?: string | string[];
  colors?: string | string[];
  dimentions?: string;
  weight?: string;
  gprs?: string;
  networkTechnology?: string;
  networkSpeed?: string;
  [key: string]: unknown;
  options?: ProductOptions;
}

export interface ProductOptions {
  colors: ProductOption[];
  storages: ProductOption[];
}

export interface ProductOption {
  code: string;
  name: string;
}

