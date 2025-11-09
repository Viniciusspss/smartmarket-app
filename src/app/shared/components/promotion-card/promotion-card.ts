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

  get discountPercentage(): number {
    return Math.round(
      ((this.originalPrice() - this.promotionalPrice()) / this.originalPrice()) * 100
    );
  }
}
