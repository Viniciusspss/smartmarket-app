import { Component } from '@angular/core';
import { StatsCard } from '../../shared/components/stats-card/stats-card';
import { DonutChartComponent } from '../../shared/components/donut-chart/donut-chart';

@Component({
  selector: 'app-dashboard',
  imports: [StatsCard, DonutChartComponent],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  chartData: number[] = [1245, 987, 856, 743];
}
