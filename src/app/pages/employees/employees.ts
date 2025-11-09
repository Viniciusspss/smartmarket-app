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
import { MatDialogContent, MatDialogActions } from '@angular/material/dialog';

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
    MatDialogContent,
    MatDialogActions,
  ],
  templateUrl: './employees.html',
})
export class Employees implements OnInit, AfterViewInit {
  protected displayedColumns: string[] = ['id', 'name', 'cpf', 'age', 'jobTitle', 'actions'];
  protected dataSource = new MatTableDataSource<Employee>([]);
  private employeeService = inject(EmployeeService);
  protected employeeForm!: FormGroup;
  protected showModal = signal<boolean>(false);
  private notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);

  protected isEditing = signal<boolean>(false);
  protected editingEmployeeId = signal<string | null>(null);

  protected deleteModalOpen = signal<boolean>(false);
  private employeeToDeleteId = signal<string | null>(null);

  protected readonly allowedRoles = [{ value: 'User', label: 'Funcionário' }];

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
      cpf: ['', [Validators.required, this.cpfValidator]],
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
        const employeeList = Array.isArray(response) ? response : response.employees ?? [];

        this.dataSource.data = employeeList;
        this.dataSource._updateChangeSubscription();
      },
      error: (err) => {
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
    this.isEditing.set(false);
    this.editingEmployeeId.set(null);
  }

  onSubmit(): void {
    if (this.employeeForm.valid) {
      const formValue = this.employeeForm.value;

      if (this.isEditing() && this.editingEmployeeId()) {
        const updateEmployeeData = {
          name: formValue.name,
          cpf: formValue.cpf,
          age: formValue.age,
          jobTitle: formValue.jobTitle,
        };

        this.employeeService
          .updateEmployee(this.editingEmployeeId()!, updateEmployeeData)
          .subscribe({
            next: () => {
              this.notificationService.showSuccess('Funcionário atualizado com sucesso!', '');
              this.loadEmployees();
              this.closeModal();
            },
            error: (err) => {
              this.notificationService.showError(
                'Erro ao atualizar funcionário',
                this.getErrorMessage(err)
              );
            },
          });
      } else {
        const newEmployeeData = {
          name: formValue.name,
          cpf: formValue.cpf,
          age: formValue.age,
          jobTitle: formValue.jobTitle,
          createdAt: new Date(),
        };

        this.employeeService.createEmployee(newEmployeeData).subscribe({
          next: () => {
            this.notificationService.showSuccess('Funcionário criado com sucesso!', '');
            this.loadEmployees();
            this.closeModal();
          },
          error: (err) => {
            this.notificationService.showError(
              'Erro ao criar funcionário',
              this.getErrorMessage(err)
            );
          },
        });
      }
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

  editEmployee(employee: Employee): void {
    this.isEditing.set(true);
    this.editingEmployeeId.set(employee.employeeId);

    this.employeeForm.patchValue({
      name: employee.name,
      cpf: employee.cpf,
      age: employee.age,
      jobTitle: employee.jobTitle,
    });

    this.showModal.set(true);
  }

  deleteEmployee(employeeId: string): void {
    if (confirm('Tem certeza que deseja excluir este funcionário?')) {
      this.employeeService.deleteEmployee(employeeId).subscribe({
        next: () => {
          this.notificationService.showSuccess('Funcionário removido com sucesso!', '');
          this.loadEmployees();
        },
        error: (err) => {
          this.notificationService.showError(
            'Erro ao excluir funcionário',
            this.getErrorMessage(err)
          );
        },
      });
    }
  }

  toggleDeleteModal(): void {
    this.deleteModalOpen.update((prev) => !prev);
    if (!this.deleteModalOpen()) {
      this.employeeToDeleteId.set(null);
    }
  }

  openDeleteModal(employeeId: string): void {
    this.employeeToDeleteId.set(employeeId);
    this.deleteModalOpen.set(true);
  }

  confirmDelete(): void {
    const employeeId = this.employeeToDeleteId();
    if (!employeeId) return;

    this.employeeService.deleteEmployee(employeeId).subscribe({
      next: () => {
        this.notificationService.showSuccess('Funcionário removido com sucesso!', '');
        this.loadEmployees();
        this.toggleDeleteModal();
      },
      error: (err) => {
        this.notificationService.showError(
          'Erro ao excluir funcionário',
          this.getErrorMessage(err)
        );
        this.toggleDeleteModal();
      },
    });
  }
}
