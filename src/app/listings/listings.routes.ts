import { Routes } from '@angular/router';
import { ListingsPage } from './listings.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: ListingsPage,
    children: [
      {
        path: 'explore',
        loadChildren: () => import('./explore/explore.routes').then((m) => m.routes),
      },
      {
        path: 'pets',
        loadComponent: () => import('../pets/pets.page').then((m) => m.PetsPage),
      },
      {
        path: 'my-listings',
        loadComponent: () => import('./my-listings/my-listings.page').then((m) => m.MyListingsPage),
      },
      {
        path: 'my-applications',
        loadComponent: () =>
          import('./my-applications/my-applications.page').then((m) => m.MyApplicationsPage),
      },
      {
        path: '',
        redirectTo: '/listings/tabs/explore',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/listings/tabs/explore',
    pathMatch: 'full',
  },
];
