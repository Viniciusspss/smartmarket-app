import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../service/auth.service';

@Injectable({
  providedIn: 'root',
})
export class PublicGuard implements CanActivate {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  public canActivate(): boolean | Observable<boolean> {
    return this.checkAuthentication();
  }

  private checkAuthentication(): boolean {
    if (this.authService.isAuthenticated()) {
      this.redirectToHome();
      return false;
    }
    return true;
  }

  private redirectToHome(): void {
    this.router.navigateByUrl('home');
  }
}
