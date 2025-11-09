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
import { MatDialogContent, MatDialogActions } from '@angular/material/dialog';

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
    MatDialogContent,
    MatDialogActions,
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
    'actions',
  ];

  protected dataSource = new MatTableDataSource<Product>([]);
  private productService = inject(ProductService);
  private notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);

  protected productForm!: FormGroup;
  protected showModal = signal<boolean>(false);

  protected isEditing = signal<boolean>(false);
  protected editingProductId = signal<string | null>(null);

  protected deleteModalOpen = signal<boolean>(false);
  private productToDeleteId = signal<string | null>(null);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  protected today = new Date().toISOString().split('T')[0];

  protected readonly allowedTypes = [
    { value: 'FOOD', label: 'Alimentício (FOOD)' },
    { value: 'BEVERAGE', label: 'Bebida (BEVERAGE)' },
    { value: 'CLEANING', label: 'Limpeza (CLEANING)' },
    { value: 'HYGIENE', label: 'Higiene (HYGIENE)' },
    { value: 'OTHER', label: 'Outro (OTHER)' },
  ];

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
      priceInCents: [0, [Validators.required, Validators.min(0.01)]],
      promoInCents: [null],
      promoActive: [false],
      promoStartsAt: [null],
      promoEndsAt: [null],
      stockQuantity: [0, [Validators.required, Validators.min(0)]],
      expiresAt: [defaultExpiresAt.toISOString().split('T')[0], [Validators.required]],
    });
  }

  private typeValidator(control: any): { [key: string]: any } | null {
    const allowed = this.allowedTypes.map((t) => t.value);
    return !allowed.includes(control.value) ? { invalidType: true } : null;
  }

  private loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (response: any) => {
        const products = Array.isArray(response) ? response : response.products ?? [];
        this.dataSource.data = products;
        this.dataSource._updateChangeSubscription();
      },
      error: (err) => {
        this.notificationService.showError('Erro ao carregar produtos', this.getErrorMessage(err));
      },
    });
  }

  onPriceInput(event: any): void {
    const value = parseFloat(event.target.value);
    if (!isNaN(value)) {
      const cents = Math.round(value * 100);
      this.productForm.patchValue(
        {
          priceInCents: value,
        },
        { emitEvent: false, onlySelf: true }
      );
    }
  }

  onPromoPriceInput(event: any): void {
    const value = parseFloat(event.target.value);
    if (!isNaN(value)) {
      const cents = Math.round(value * 100);
      this.productForm.patchValue(
        {
          promoInCents: value,
        },
        { emitEvent: false, onlySelf: true }
      );
    }
  }

  openModal(): void {
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.isEditing.set(false);
    this.editingProductId.set(null);

    const defaultExpiresAt = new Date();
    defaultExpiresAt.setDate(defaultExpiresAt.getDate() + 30);

    this.productForm.reset({
      priceInCents: 0,
      promoInCents: null,
      promoActive: false,
      stockQuantity: 0,
      expiresAt: defaultExpiresAt.toISOString().split('T')[0],
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.notificationService.showError(
        'Formulário inválido',
        'Verifique os campos obrigatórios.'
      );
      return;
    }

    const formValue = this.productForm.value;

    const formatDate = (dateString: string): Date => new Date(dateString + 'T00:00:00');
    const formatDateTime = (dateTimeString: string): Date => new Date(dateTimeString);

    const productData: Product = {
      name: formValue.name,
      description: formValue.description,
      type: formValue.type,
      priceInCents: Math.round(formValue.priceInCents * 100),
      promoActive: formValue.promoActive,
      stockQuantity: formValue.stockQuantity,
      expiresAt: formatDate(formValue.expiresAt),
      ...(formValue.promoInCents && { promoInCents: Math.round(formValue.promoInCents * 100) }),
      ...(formValue.promoStartsAt && { promoStartsAt: formatDateTime(formValue.promoStartsAt) }),
      ...(formValue.promoEndsAt && { promoEndsAt: formatDateTime(formValue.promoEndsAt) }),
    };

    if (this.isEditing() && this.editingProductId()) {
      this.productService.updateProduct(this.editingProductId()!, productData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Produto atualizado com sucesso!', '');
          this.loadProducts();
          this.closeModal();
        },
        error: (err) => {
          this.notificationService.showError(
            'Erro ao atualizar produto',
            this.getErrorMessage(err)
          );
        },
      });
    } else {
      this.productService.createProduct(productData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Produto criado com sucesso!', '');
          this.loadProducts();
          this.closeModal();
        },
        error: (err) => {
          this.notificationService.showError('Erro ao criar produto', this.getErrorMessage(err));
        },
      });
    }
  }

  editProduct(product: Product): void {
    this.isEditing.set(true);
    this.editingProductId.set(product.productId!);

    this.productForm.patchValue({
      name: product.name,
      description: product.description,
      type: product.type,
      priceInCents: product.priceInCents / 100,
      promoActive: product.promoActive,
      promoInCents: product.promoInCents ? product.promoInCents / 100 : null,
      promoStartsAt: product.promoStartsAt
        ? new Date(product.promoStartsAt).toISOString().slice(0, 16)
        : null,
      promoEndsAt: product.promoEndsAt
        ? new Date(product.promoEndsAt).toISOString().slice(0, 16)
        : null,
      stockQuantity: product.stockQuantity,
      expiresAt: product.expiresAt ? new Date(product.expiresAt).toISOString().split('T')[0] : '',
    });

    this.showModal.set(true);
  }

  openDeleteModal(productId: string): void {
    this.productToDeleteId.set(productId);
    this.deleteModalOpen.set(true);
  }

  toggleDeleteModal(): void {
    this.deleteModalOpen.update((prev) => !prev);
    if (!this.deleteModalOpen()) {
      this.productToDeleteId.set(null);
    }
  }

  confirmDelete(): void {
    const productId = this.productToDeleteId();
    if (!productId) return;

    this.productService.deleteProduct(productId).subscribe({
      next: () => {
        this.notificationService.showSuccess('Produto removido com sucesso!', '');
        this.loadProducts();
        this.toggleDeleteModal();
      },
      error: (err) => {
        this.notificationService.showError('Erro ao excluir produto', this.getErrorMessage(err));
        this.toggleDeleteModal();
      },
    });
  }

  private getErrorMessage(error: any): string {
    if (error.error?.message) return error.error.message;
    if (error.message) return error.message;
    return 'Erro desconhecido';
  }
}
