import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stats-card',
  imports: [],
  templateUrl: './stats-card.html',
})
export class StatsCard {
  public title = input.required<string>();
  public number = input.required<string>();
  public description = input.required<string>();
  public image = input.required<string>();
}
