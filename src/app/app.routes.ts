import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { DashboardLayout } from './layouts/dashboard-layout/dashboard-layout';

export const routes: Routes = [
  {
    path: 'login',
    component: Login,
    // canActivate: [PublicGuard],
  },
  {
    path: '',
    component: DashboardLayout,
    children: [{ path: 'dashboard', component: Dashboard }],
    // canActivate: [PublicGuard],
  },
  {
    path: '**',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
];
