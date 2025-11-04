import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-promotion-card',
  imports: [CommonModule, MatSlideToggleModule, FormsModule],
  templateUrl: './promotion-card.html',
})
export class PromotionCard {
  public name = input.required<string>();
  public originalPrice = input.required<number>();
  public promotionalPrice = input.required<number>();
  public active = input<boolean>(true);

  public isActive = signal(this.active());

  get discountPercentage(): number {
    return Math.round(
      ((this.originalPrice() - this.promotionalPrice()) / this.originalPrice()) * 100
    );
  }

  togglePromotion() {
    this.isActive.update((value) => !value);
  }
}
