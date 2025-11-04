import { Component, ViewChild, OnInit } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Employee } from '../../shared/models/employee';
import { employees } from '../../mocks/employees';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employees',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './employees.html',
})
export class Employees implements OnInit {
  displayedColumns: string[] = ['employee', 'cpf', 'phone', 'role', 'createdAt'];
  dataSource = new MatTableDataSource<Employee>(employees);
  employeeForm!: FormGroup;
  showModal = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  private initForm(): void {
    this.employeeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]],
      phone: ['', [Validators.required]],
      role: ['', [Validators.required]],
      createdAt: [new Date()],
    });
  }

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.employeeForm.reset();
    this.employeeForm.patchValue({ createdAt: new Date() });
  }

  addEmployee(newEmployee: Employee): void {
    employees.push({
      ...newEmployee,
      id: Number(this.generateId()),
    });

    this.dataSource.data = [...employees];

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onSubmit(): void {
    if (this.employeeForm.valid) {
      const newEmployee: Employee = this.employeeForm.value;
      this.addEmployee(newEmployee);
      this.closeModal();
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
