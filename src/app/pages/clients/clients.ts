import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { employees } from '../../mocks/employees';
import { CommonModule } from '@angular/common';
import { Client } from '../../shared/models/client';
import { clients } from '../../mocks/clients';

@Component({
  selector: 'app-clients',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    CommonModule,
  ],
  templateUrl: './clients.html',
})
export class Clients implements OnInit {
  displayedColumns: string[] = ['client', 'cpf', 'age', 'timeClient', 'totalAmount'];
  dataSource = new MatTableDataSource<Client>(clients);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit(): void {
    this.dataSource.data = clients.map((client) => ({
      ...client,
      timeClientMonths: this.getMonthsAsClient(client.timeClient),
    }));
  }

  getMonthsAsClient(dateString: string): number {
    const startDate = new Date(dateString);
    const now = new Date();

    const years = now.getFullYear() - startDate.getFullYear();
    const months = now.getMonth() - startDate.getMonth();

    return years * 12 + months;
  }
}
