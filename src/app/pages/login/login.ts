import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth/auth.service';
import { NotificationService } from '../../service/notification/notification.service';
import { finalize } from 'rxjs';
import { CustomInputComponent } from '../../shared/components/custom-input/custom-input';
import { CustomButtonComponent } from '../../shared/components/custom-button/custom-button';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CustomInputComponent, CustomButtonComponent],
  templateUrl: './login.html',
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  isLoading = signal(false);
  errorMessage = signal('');

  ngOnInit(): void {
    this.authService.logout();
  }

  private loadingEffect = effect(() => {
    if (this.isLoading()) {
      this.loginForm.disable();
    } else {
      this.loginForm.enable();
    }
  });

  onSubmit(): void {
    this.errorMessage.set('');

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.notificationService.showError(
        'Atenção!',
        'Por favor, preencha o formulário corretamente.'
      );
      return;
    }

    const { email, password } = this.loginForm.getRawValue();
    this.isLoading.set(true);

    this.authService
      .login({ email, password })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => this.handleLoginSuccess(),
        error: (error) => this.handleLoginError(error),
      });
  }

  private handleLoginSuccess(): void {
    this.notificationService.showSuccess('Bem-vindo(a)!', 'Login realizado com sucesso.');
    this.router.navigate(['/dashboard']);
  }

  private handleLoginError(error: any): void {
    const errorMsg = error.message || 'Credenciais inválidas. Tente novamente.';

    this.notificationService.showError('Falha no Login', errorMsg);
    this.errorMessage.set(errorMsg);

    console.error('Erro no login:', error);
  }
}
