export interface AddToCartRequest {
  id: string;
  colorCode: string;
  storageCode: string;
}

export interface AddToCartResponse {
  count: number;
}

