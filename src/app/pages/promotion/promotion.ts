import { Component } from '@angular/core';
import { PromotionCard } from '../../shared/components/promotion-card/promotion-card';

@Component({
  selector: 'app-promotion',
  imports: [PromotionCard],
  templateUrl: './promotion.html',
})
export class Promotion {}
