import { Routes } from '@angular/router';
import { authGuard } from './auth/auth-guard';

export const routes: Routes = [
  {
    path: 'listings',
    loadChildren: () => import('./listings/listings.routes').then((m) => m.routes),
    canActivate: [authGuard],
  },
  {
    path: '',
    redirectTo: '/listings/tabs/explore',
    pathMatch: 'full',
  },
  {
    path: 'log-in',
    loadComponent: () => import('./auth/log-in/log-in.page').then((m) => m.LogInPage),
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/register.page').then((m) => m.RegisterPage),
  },
];
