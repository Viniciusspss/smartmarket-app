export interface Product {
  productId?: string;
  name: string;
  description: string;
  type: string;
  priceInCents: number;
  promoInCents?: number;
  promoActive: boolean;
  promoStartsAt?: Date;
  promoEndsAt?: Date;
  stockQuantity: number;
  expiresAt?: Date;
}
