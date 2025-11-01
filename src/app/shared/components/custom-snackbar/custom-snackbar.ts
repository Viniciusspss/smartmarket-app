import { Component, computed, inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

export interface SnackbarData {
  titulo: string;
  mensagem: string;
  tipo: 'success' | 'warning' | 'error' | 'custom';
  icone?: string;
}

interface TipoConfig {
  icon: string;
  cssClass: string;
}

@Component({
  selector: 'app-custom-snackbar',
  imports: [],
  templateUrl: './custom-snackbar.html',
})
export class CustomSnackbar {
  private readonly tipoConfig: Record<SnackbarData['tipo'], TipoConfig> = {
    warning: { icon: 'assets/icons/warning.png', cssClass: 'snackbar-warning' },
    error: { icon: 'assets/icons/error-red.png', cssClass: 'snackbar-error' },
    success: { icon: 'assets/icons/check-green.png', cssClass: 'snackbar-success' },
    custom: { icon: 'assets/icons/check-white.png', cssClass: 'snackbar-custom' },
  };

  public sbRef = inject(MatSnackBarRef<CustomSnackbar>);
  public data = inject<SnackbarData>(MAT_SNACK_BAR_DATA);

  icon = computed(() => this.data.icone || this.tipoConfig[this.data.tipo].icon);

  cssClass = computed(() => this.tipoConfig[this.data.tipo].cssClass);

  fechar(): void {
    this.sbRef.dismiss();
  }
}
