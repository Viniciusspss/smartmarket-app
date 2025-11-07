import { Component, inject, input, signal } from '@angular/core';
import { AuthService } from '../../../service/auth.service';
import { Router } from '@angular/router';
import { AsideItems } from '../aside-items/aside-items';
import { MatDialogActions, MatDialogContent } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-side-bar',
  imports: [AsideItems, MatInputModule, MatDialogContent, MatDialogActions],
  templateUrl: './side-bar.html',
})
export class SideBar {
  private router = inject(Router);
  private authService = inject(AuthService);
  protected modalOpen = signal<boolean>(false);

  selectButton(buttonName: 'Dashboard' | 'Products' | 'Promotions' | 'Employees' | 'Clients') {
    if (buttonName == 'Dashboard') {
      this.router.navigateByUrl('dashboard');
    }
    if (buttonName == 'Products') {
      this.router.navigateByUrl('products');
    }
    if (buttonName == 'Promotions') {
      this.router.navigateByUrl('promotion');
    }
    if (buttonName == 'Employees') {
      this.router.navigateByUrl('employees');
    }
    if (buttonName == 'Clients') {
      this.router.navigateByUrl('clients');
    }
  }

  selectedButton(): string {
    return this.router.url;
  }

  protected getInitials(name: string): string {
    if (!name) return '';
    const parts = name.trim().split(' ');
    const first = parts[0]?.[0] || '';
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : '';
    return (first + last).toUpperCase();
  }

  changeModal() {
    this.modalOpen.set(!this.modalOpen());
  }

  logout(): void {
    this.authService.logout();
  }
}
