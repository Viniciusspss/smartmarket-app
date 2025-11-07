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
import { Product } from '../../shared/models/product';
import { ProductService } from '../../service/product.service';
import { NotificationService } from '../../service/notification.service';

@Component({
  selector: 'app-products',
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
  templateUrl: './products.html',
})
export class Products implements OnInit, AfterViewInit {
  protected displayedColumns: string[] = [
    'name',
    'description',
    'type',
    'priceInCents',
    'promoActive',
    'stockQuantity',
    'expiresAt',
  ];
  protected dataSource = new MatTableDataSource<Product>([]);
  private productService = inject(ProductService);
  protected productForm!: FormGroup;
  protected showModal = signal<boolean>(false);
  private notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);

  protected readonly allowedTypes = [
    { value: 'FOOD', label: 'Alimentício (FOOD)' },
    { value: 'BEVERAGE', label: 'Bebida (BEVERAGE)' },
    { value: 'CLEANING', label: 'Limpeza (CLEANING)' },
    { value: 'HYGIENE', label: 'Higiene (HYGIENE)' },
    { value: 'OTHER', label: 'Outro (OTHER)' },
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  protected today = new Date().toISOString().split('T')[0];

  ngOnInit(): void {
    this.initForm();
    this.loadProducts();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  private initForm(): void {
    const defaultExpiresAt = new Date();
    defaultExpiresAt.setDate(defaultExpiresAt.getDate() + 30);

    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      type: ['', [Validators.required, this.typeValidator.bind(this)]],
      priceInCents: [0, [Validators.required, Validators.min(1)]],
      promoInCents: [null],
      promoActive: [false],
      promoStartsAt: [null],
      promoEndsAt: [null],
      stockQuantity: [0, [Validators.required, Validators.min(0)]],
      expiresAt: [defaultExpiresAt.toISOString().split('T')[0], [Validators.required]],
    });
  }

  private typeValidator(control: any): { [key: string]: any } | null {
    const value = control.value;
    if (!value) {
      return { required: true };
    }

    const allowedValues = this.allowedTypes.map((type) => type.value);
    if (!allowedValues.includes(value)) {
      return { invalidType: true };
    }

    return null;
  }

  private loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (response: any) => {
        const productList = Array.isArray(response) ? response : response.products ?? [];

        this.dataSource.data = productList;
        this.dataSource._updateChangeSubscription();
      },
      error: (err) => {
        console.error('Erro ao carregar produtos:', err);
        this.notificationService.showError('Erro ao carregar produtos', this.getErrorMessage(err));
      },
    });
  }

  onPriceInput(event: any): void {
    const value = parseFloat(event.target.value);
    if (!isNaN(value)) {
      const cents = Math.round(value * 100);
      this.productForm.patchValue({ priceInCents: cents }, { emitEvent: false });
    }
  }

  onPromoPriceInput(event: any): void {
    const value = parseFloat(event.target.value);
    if (!isNaN(value)) {
      const cents = Math.round(value * 100);
      this.productForm.patchValue({ promoInCents: cents }, { emitEvent: false });
    }
  }

  openModal(): void {
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    const defaultExpiresAt = new Date();
    defaultExpiresAt.setDate(defaultExpiresAt.getDate() + 30);

    this.productForm.reset({
      priceInCents: 0,
      promoActive: false,
      stockQuantity: 0,
      expiresAt: defaultExpiresAt.toISOString().split('T')[0],
    });
  }

  private addProduct(newProduct: Product): void {
    console.log('Adicionando produto à tabela:', newProduct);

    const currentData = this.dataSource.data;
    const newData = [...currentData, newProduct];

    this.dataSource.data = newData;
    this.dataSource._updateChangeSubscription();

    console.log('DataSource após adição:', this.dataSource.data);

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      const formValue = this.productForm.value;

      console.log('Form Values:', formValue);

      const formatDate = (dateString: string): Date => {
        return new Date(dateString + 'T00:00:00');
      };

      const formatDateTime = (dateTimeString: string): Date => {
        return new Date(dateTimeString);
      };

      const newProduct: Product = {
        name: formValue.name,
        description: formValue.description,
        type: formValue.type,
        priceInCents: formValue.priceInCents,
        promoActive: formValue.promoActive,
        stockQuantity: formValue.stockQuantity,
        expiresAt: formatDate(formValue.expiresAt),
        ...(formValue.promoInCents && { promoInCents: formValue.promoInCents }),
        ...(formValue.promoStartsAt && { promoStartsAt: formatDateTime(formValue.promoStartsAt) }),
        ...(formValue.promoEndsAt && { promoEndsAt: formatDateTime(formValue.promoEndsAt) }),
      };

      console.log('Enviando produto para API:', newProduct);

      this.productService.createProduct(newProduct).subscribe({
        next: (response) => {
          console.log('Resposta da API:', response);
          this.addProduct(response);
          this.closeModal();
          this.notificationService.showSuccess('Produto criado com sucesso!', '');
        },
        error: (err) => {
          console.error('Error creating product:', err);
          const errorMessage = this.getErrorMessage(err);
          this.notificationService.showError('Falha na criação do produto', errorMessage);
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
    Object.keys(this.productForm.controls).forEach((key) => {
      const control = this.productForm.get(key);
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
    this.loadProducts();
  }

  centsToReais(cents: number): number {
    return cents / 100;
  }

  reaisToCents(reais: number): number {
    return Math.round(reais * 100);
  }

  getTypeLabel(typeValue: string): string {
    const type = this.allowedTypes.find((t) => t.value === typeValue);
    return type ? type.label : typeValue;
  }
}
