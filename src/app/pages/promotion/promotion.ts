import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { PromotionCard } from '../../shared/components/promotion-card/promotion-card';
import { ProductService } from '../../service/product.service';
import { NotificationService } from '../../service/notification.service';
import { Product } from '../../shared/models/product';

@Component({
  selector: 'app-promotion',
  imports: [PromotionCard],
  templateUrl: './promotion.html',
})
export class Promotion implements OnInit {
  private productService = inject(ProductService);
  private notificationService = inject(NotificationService);
  protected products = signal<Product[]>([]);
  protected promotionProducts = computed(() => this.products().filter((p) => p.promoActive));

  ngOnInit(): void {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (response: any) => {
        const productList = Array.isArray(response) ? response : response.products ?? [];
        this.products.set(productList);
      },
      error: (err) => {
        this.notificationService.showError('Erro ao carregar produtos', err);
      },
    });
  }
}
