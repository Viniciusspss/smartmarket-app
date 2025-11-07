import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { DashboardLayout } from './layouts/dashboard-layout/dashboard-layout';
import { Products } from './pages/products/products';
import { Employees } from './pages/employees/employees';
import { Promotion } from './pages/promotion/promotion';
import { PublicGuard } from './core/guard/public.guard';
import { authGuard } from './core/guard/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: Login,
    canActivate: [PublicGuard],
  },
  {
    path: '',
    component: DashboardLayout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: 'products', component: Products },
      { path: 'employees', component: Employees },
      { path: 'promotion', component: Promotion },
    ],
  },
  {
    path: '**',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
];
