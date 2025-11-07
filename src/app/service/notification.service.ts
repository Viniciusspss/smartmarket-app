import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { CustomSnackbar, SnackbarData } from '../shared/components/custom-snackbar/custom-snackbar';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  showSnackbar(data: SnackbarData, duracaoMs: number = 5000): void {
    const cssClass = this.getSnackbarCssClass(data.tipo);

    const config: MatSnackBarConfig<SnackbarData> = {
      duration: duracaoMs,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [cssClass],
      data,
    };

    this.snackBar.openFromComponent(CustomSnackbar, config);
  }

  private getSnackbarCssClass(tipo: SnackbarData['tipo']): string {
    const classMap: Record<SnackbarData['tipo'], string> = {
      warning: 'snackbar-warning',
      error: 'snackbar-error',
      success: 'snackbar-success',
      custom: 'snackbar-custom',
    };

    return classMap[tipo] ?? 'snackbar-custom';
  }

  showError(titulo: string, mensagem: string): void {
    this.showSnackbar({ titulo, mensagem, tipo: 'error' });
  }

  showSuccess(titulo: string, mensagem: string): void {
    this.showSnackbar({ titulo, mensagem, tipo: 'success' });
  }

  showWarning(titulo: string, mensagem: string): void {
    this.showSnackbar({ titulo, mensagem, tipo: 'warning' });
  }
}
