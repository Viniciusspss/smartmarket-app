import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CustomerService, UserData } from '../../service/customer/customer.service';
import { SideBar } from '../../shared/components/side-bar/side-bar';

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet, SideBar],
  templateUrl: './dashboard-layout.html',
})
export class DashboardLayout implements OnInit {
  private customerService = inject(CustomerService);
  public user = signal<UserData | null>(null);

  private errorMessage = signal<string>('');
  private loading = signal<boolean>(false);

  ngOnInit(): void {
    this.getUser();
  }

  getUser() {
    this.loading.set(true);
    this.errorMessage.set('');

    this.customerService
      .getAuthenticatedUser()
      .subscribe({
        next: (response) => {
          this.user.set(response);
        },
        error: (e) => {
          this.errorMessage.set(e);
        },
      })
      .add(() => this.loading.set(false));
  }
}
