import { Component, input, Input, OnInit } from '@angular/core';
import {
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart,
  ApexPlotOptions,
  ApexLegend,
  ApexDataLabels,
  ChartComponent,
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: string[];
  colors: string[];
  plotOptions: ApexPlotOptions;
  legend: ApexLegend;
  dataLabels: ApexDataLabels;
};

@Component({
  selector: 'app-donut-chart',
  templateUrl: './donut-chart.html',
  imports: [ChartComponent],
})
export class DonutChartComponent implements OnInit {
  data = input.required<number[]>();
  labels: string[] = [
    'Arroz Integral 5kg',
    'Feijão Preto 1kg',
    'Leite Integral 1L',
    'Óleo de Soja 900ml',
  ];
  colors: string[] = ['#9A7A41', '#2E8B57', '#4682B4', '#DAA520'];

  public chartOptions!: Partial<ChartOptions>;

  ngOnInit() {
    this.initChart();
  }

  private initChart() {
    this.chartOptions = {
      series: this.data(),
      chart: {
        type: 'donut',
        height: 350,
      },
      labels: this.labels,
      colors: this.colors,
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
              value: {
                show: true,
              },
              total: {
                show: true,
                label: 'Total',
              },
            },
          },
        },
      },
      dataLabels: {
        enabled: true,
      },
      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        fontSize: '14px',
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              height: 300,
            },
            legend: {
              position: 'bottom',
            },
          },
        },
      ],
    };
  }
}
