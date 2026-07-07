import { Routes } from '@angular/router';
import { ExplorePage } from './explore.page';

export const routes: Routes = [
  {
    path: '',
    component: ExplorePage,
  },
  {
    path: ':listingId',
    loadComponent: () =>
      import('./listing-details/listing-details.page').then((m) => m.ListingDetailsPage),
  },
];
