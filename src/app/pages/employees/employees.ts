import { Component, ViewChild, OnInit, AfterViewInit, signal, inject } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Employee } from '../../shared/models/employee';
import { EmployeeService } from '../../service/employee.service';
import { NotificationService } from '../../service/notification.service';

@Component({
  selector: 'app-employees',
  standalone: true,
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
export class Employees implements OnInit, AfterViewInit {
  protected displayedColumns: string[] = ['id', 'name', 'cpf', 'age', 'jobTitle'];
  protected dataSource = new MatTableDataSource<Employee>([]);
  private employeeService = inject(EmployeeService);
  protected employeeForm!: FormGroup;
  protected showModal = signal<boolean>(false);
  private notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);

  protected readonly allowedRoles = [
    { value: 'Admin', label: 'Administrador' },
    { value: 'User', label: 'Funcionário' },
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.initForm();
    this.loadEmployees();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  private initForm(): void {
    this.employeeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      cpf: ['', [Validators.required, this.cpfValidator]],
      phone: ['', [Validators.required]],
      role: ['', [Validators.required]],
      age: [null, [Validators.min(18), Validators.max(100)]],
      jobTitle: [''],
    });
  }

  private cpfValidator(control: any): { [key: string]: any } | null {
    const cpf = control.value;
    if (!cpf) {
      return { required: true };
    }

    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    if (!cpfRegex.test(cpf)) {
      return { invalidCpf: true };
    }

    return null;
  }

  private loadEmployees(): void {
    this.employeeService.getAllEmployees().subscribe({
      next: (response: any) => {
        console.log(response);
        const employeeList = Array.isArray(response) ? response : response.employees ?? [];

        this.dataSource.data = employeeList;
        this.dataSource._updateChangeSubscription();
      },
      error: (err) => {
        console.error('Erro ao carregar funcionários:', err);
        this.notificationService.showError(
          'Erro ao carregar funcionários',
          this.getErrorMessage(err)
        );
      },
    });
  }

  formatCpf(event: any): void {
    let value = event.target.value.replace(/\D/g, '');

    if (value.length > 11) {
      value = value.substring(0, 11);
    }

    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }

    this.employeeForm.patchValue({ cpf: value }, { emitEvent: false });
  }

  formatPhone(event: any): void {
    let value = event.target.value.replace(/\D/g, '');

    if (value.length > 11) {
      value = value.substring(0, 11);
    }

    if (value.length === 11) {
      value = value.replace(/(\d{2})(\d)/, '($1) $2');
      value = value.replace(/(\d{5})(\d)/, '$1-$2');
    } else if (value.length === 10) {
      value = value.replace(/(\d{2})(\d)/, '($1) $2');
      value = value.replace(/(\d{4})(\d)/, '$1-$2');
    }

    this.employeeForm.patchValue({ phone: value }, { emitEvent: false });
  }

  openModal(): void {
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.employeeForm.reset();
  }

  private addEmployee(newEmployee: Employee): void {
    console.log('Adicionando funcionário à tabela:', newEmployee);

    const currentData = this.dataSource.data;
    const newData = [...currentData, newEmployee];

    this.dataSource.data = newData;
    this.dataSource._updateChangeSubscription();

    console.log('DataSource após adição:', this.dataSource.data);

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onSubmit(): void {
    if (this.employeeForm.valid) {
      const formValue = this.employeeForm.value;

      console.log('Form Values:', formValue);

      const newEmployeeData = {
        name: formValue.name,
        email: formValue.email,
        cpf: formValue.cpf,
        phone: formValue.phone,
        role: formValue.role,
        ...(formValue.age && { age: formValue.age }),
        ...(formValue.jobTitle && { jobTitle: formValue.jobTitle }),
        createdAt: new Date(),
      };

      console.log('Enviando funcionário para API:', newEmployeeData);

      this.employeeService.createEmployee(newEmployeeData).subscribe({
        next: (response) => {
          console.log('Resposta da API:', response);
          this.addEmployee(response);
          this.closeModal();
          this.notificationService.showSuccess('Funcionário criado com sucesso!', '');
        },
        error: (err) => {
          console.error('Error creating employee:', err);
          const errorMessage = this.getErrorMessage(err);
          this.notificationService.showError('Falha na criação do funcionário', errorMessage);
        },
      });
    } else {
      this.markFormGroupTouched();
      this.notificationService.showError(
        'Formulário inválido',
        'Por favor, preencha todos os campos obrigatórios corretamente.'
      );
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.employeeForm.controls).forEach((key) => {
      const control = this.employeeForm.get(key);
      control?.markAsTouched();
    });
  }

  private getErrorMessage(error: any): string {
    if (error.error?.message) {
      return error.error.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'Erro desconhecido';
  }

  refreshTable(): void {
    this.loadEmployees();
  }

  getRoleLabel(roleValue: string): string {
    const role = this.allowedRoles.find((r) => r.value === roleValue);
    return role ? role.label : roleValue;
  }
}
