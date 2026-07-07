import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonList,
  IonMenuButton,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonIcon,
  ViewWillEnter,
} from '@ionic/angular/standalone';
import { Listing } from '../listing.model';
import { ListingElementComponent } from '../listing-element/listing-element.component';
import { RouterLink } from '@angular/router';
import { ListingsService } from '../listings';
import { AuthService } from '../../auth/auth';
import { addIcons } from 'ionicons';
import { pawOutline } from 'ionicons/icons';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.page.html',
  styleUrls: ['./explore.page.scss'],
  standalone: true,
  imports: [
    IonIcon,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    IonButtons,
    IonMenuButton,
    IonList,
    ListingElementComponent,
    RouterLink,
  ],
})
export class ExplorePage implements OnInit, ViewWillEnter, OnDestroy {
  listingsService: ListingsService = inject(ListingsService);
  authService: AuthService = inject(AuthService);

  listings: Listing[] = [];
  listingSub: Subscription = new Subscription();

  constructor() {
    addIcons({ pawOutline });
  }

  // Prikazujemo samo TUĐE i OTVORENE oglase — ovde čuvar traži posao,
  // svoje oglase (kao vlasnik ljubimca) korisnik upravlja na tabu "Moji oglasi".
  get visibleListings(): Listing[] {
    const myId = this.authService.getUserId();
    return this.listings.filter((l) => l.ownerId !== myId && l.status === 'Otvoren');
  }

  ionViewWillEnter() {
    this.listingsService.getListings().subscribe();
  }

  ngOnInit() {
    this.listingSub = this.listingsService.listings.subscribe((listings) => {
      this.listings = listings;
    });
  }

  ngOnDestroy() {
    this.listingSub?.unsubscribe();
  }
}
