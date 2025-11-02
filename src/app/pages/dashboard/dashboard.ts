import { Component } from '@angular/core';
import { StatsCard } from '../../shared/components/stats-card/stats-card';

@Component({
  selector: 'app-dashboard',
  imports: [StatsCard],
  templateUrl: './dashboard.html',
})
export class Dashboard {}
