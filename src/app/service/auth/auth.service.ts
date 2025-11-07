import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, tap, throwError } from 'rxjs';

interface LoginSuccessResponse {
  accessToken: string;
  expiresIn: number;
}

interface UserData {
  email: string;
  fullName: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8080/accounts';
  private readonly TOKEN_KEY = 'accessToken';

  private http = inject(HttpClient);
  private router = inject(Router);

  public isLoggedIn = signal<boolean>(this.hasValidToken());
  public currentUser = signal<UserData | null>(this.getUserFromToken());
  public isAuthenticated = computed(() => this.isLoggedIn());

  constructor() {
    this.startTokenExpirationCheck();

    this.cleanupExpiredToken();
  }

  get loggedIn(): boolean {
    return this.hasValidToken();
  }

  login(credenciais: { email: string; password: string }): Observable<LoginSuccessResponse> {
    return this.http.post<LoginSuccessResponse>(`${this.API_URL}/login`, credenciais).pipe(
      tap((response) => {
        if (response?.accessToken) {
          this.setAuthData(response);
        }
      }),
      catchError(this.handleError)
    );
  }

  logout(): void {
    this.clearAuth();
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  refreshAuthState(): void {
    this.isLoggedIn.set(this.hasValidToken());
    this.currentUser.set(this.getUserFromToken());
  }

  private setAuthData(response: LoginSuccessResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.accessToken);

    this.isLoggedIn.set(true);
    this.currentUser.set(this.getUserFromToken());
  }

  private clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.isLoggedIn.set(false);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  private hasValidToken(): boolean {
    if (!this.hasToken()) return false;

    return true;
  }

  private getUserFromToken(): UserData | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('Token JWT inválido: formato incorreto');
        return null;
      }

      const payload = JSON.parse(atob(parts[1]));

      if (payload.exp && Date.now() >= payload.exp * 1000) {
        console.warn('Token expirado detectado ao decodificar');
        this.clearAuth();
        return null;
      }

      return {
        email: payload.email || '',
        fullName: payload.sub || '',
      };
    } catch (error) {
      console.error('Erro ao decodificar token JWT:', error);
      this.clearAuth();
      return null;
    }
  }

  private startTokenExpirationCheck(): void {
    setInterval(() => {
      if (this.hasToken() && !this.hasValidToken()) {
        console.warn('Token expirado detectado. Realizando logout automático...');
        this.clearAuth();
      }
    }, 60000);
  }

  private cleanupExpiredToken(): void {
    if (this.hasToken() && !this.hasValidToken()) {
      console.info('Limpando token expirado do localStorage...');
      this.clearAuth();
    }
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Erro ao realizar login';

    if (error.status === 401 || error.status === 403) {
      errorMessage = 'Usuário ou senha incorretos';
    } else if (error.status === 0) {
      errorMessage = 'Erro de conexão com o servidor';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }

    console.error('Erro na autenticação:', {
      status: error.status,
      message: errorMessage,
      error: error.error,
    });

    return throwError(() => new Error(errorMessage));
  }
}
