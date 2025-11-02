import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { DashboardLayout } from './layouts/dashboard-layout/dashboard-layout';
import { Products } from './pages/products/products';
import { Employees } from './pages/employees/employees';
import { Clients } from './pages/clients/clients';

export const routes: Routes = [
  {
    path: 'login',
    component: Login,
    // canActivate: [PublicGuard],
  },
  {
    path: '',
    component: DashboardLayout,
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'products', component: Products },
      { path: 'employees', component: Employees },
      { path: 'clients', component: Clients },
    ],
    // canActivate: [PublicGuard],
  },
  {
    path: '**',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
];
