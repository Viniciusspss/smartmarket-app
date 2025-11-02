import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { DashboardLayout } from './layouts/dashboard-layout/dashboard-layout';
import { Products } from './pages/products/products';

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
    ],
    // canActivate: [PublicGuard],
  },
  {
    path: '**',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
];
