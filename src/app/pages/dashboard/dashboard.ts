import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { StatsCard } from '../../shared/components/stats-card/stats-card';
import { DonutChartComponent } from '../../shared/components/donut-chart/donut-chart';
import { Product } from '../../shared/models/product';
import { ProductService } from '../../service/product.service';
import { NotificationService } from '../../service/notification.service';
import { EmployeeService } from '../../service/employee.service';
import { Employee } from '../../shared/models/employee';

@Component({
  selector: 'app-dashboard',
  imports: [StatsCard, DonutChartComponent],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  chartData: number[] = [1245, 987, 856, 743];

  protected products = signal<Product[]>([]);
  protected employees = signal<Employee[]>([]);
  protected productService = inject(ProductService);
  protected employeeService = inject(EmployeeService);
  private notificationService = inject(NotificationService);

  protected qtdPromotions = computed(() =>
    this.products().reduce((count, product) => (product.promoActive ? count + 1 : count), 0)
  );

  protected getTopStockProducts = computed(() => {
    return this.products()
      .sort((a, b) => b.stockQuantity - a.stockQuantity)
      .slice(0, 4);
  });

  ngOnInit(): void {
    this.loadProducts();
    this.loadEmployees();
  }

  private loadProducts() {
    this.productService.getAllProducts().subscribe({
      next: (response: any) => {
        this.products.set(response.products);
      },
      error: (err) => {
        this.notificationService.showError('Erro', err);
      },
    });
  }

  private loadEmployees() {
    this.employeeService.getAllEmployees().subscribe({
      next: (response: any) => {
        this.employees.set(response.employees);
      },
      error: (err) => {
        this.notificationService.showError('Erro', err);
      },
    });
  }
}
