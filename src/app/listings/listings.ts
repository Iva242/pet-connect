import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, map, Observable, switchMap, take, tap } from 'rxjs';
import { AuthService } from '../auth/auth';
import { environment } from 'src/environments/environment';
import { Listing } from './listing.model';
import { PetsService } from '../pets/pets';
import { Pet } from '../pets/pet.model';

interface ListingData {
  ownerId: string;
  petIds: { [petId: string]: boolean };
  dateFrom: string;
  dateTo: string;
  price: number;
  note?: string;
  status: string;
}


@Injectable({ providedIn: 'root' })
export class ListingsService {
  private _listings = new BehaviorSubject<Listing[]>([]);
  get listings() {
    return this._listings.asObservable();
  }

  http: HttpClient = inject(HttpClient);
  authService: AuthService = inject(AuthService);
  petsService: PetsService = inject(PetsService);

  constructor() {}

  private mapListingData(id: string, data: ListingData): Listing {
    return {
      id,
      ownerId: data.ownerId,
      petIds: data.petIds || {},
      dateFrom: data.dateFrom,
      dateTo: data.dateTo,
      price: data.price,
      note: data.note,
      status: data.status as Listing['status'],
    };
  }

  private resolvePets(listing: Listing, petsMap: { [id: string]: Pet }): Listing {
    listing.pets = Object.keys(listing.petIds || {})
      .map((id) => petsMap[id])
      .filter((p): p is Pet => !!p);
    return listing;
  }


  getListings(): Observable<Listing[]> {
    return forkJoin({
      listingsData: this.http.get<{ [key: string]: ListingData } | null>(
        `${environment.firebaseRDBUrl}/listings.json?auth=${this.authService.getToken()}`,
      ),
      petsMap: this.petsService.getAllPetsMap(),
    }).pipe(
      map(({ listingsData, petsMap }) => {
        const listings: Listing[] = [];
        for (const key in listingsData) {
          if (listingsData.hasOwnProperty(key)) {
            const listing = this.mapListingData(key, listingsData[key]);
            listings.push(this.resolvePets(listing, petsMap));
          }
        }
        return listings.reverse();
      }),
      tap((listings) => this._listings.next(listings)),
    );
  }

 
  getMyListings(): Observable<Listing[]> {
    const userId = this.authService.getUserId();
    return forkJoin({
      listingsData: this.http.get<{ [key: string]: ListingData } | null>(
        `${environment.firebaseRDBUrl}/listings.json?auth=${this.authService.getToken()}&orderBy="ownerId"&equalTo="${userId}"`,
      ),
      petsMap: this.petsService.getAllPetsMap(),
    }).pipe(
      map(({ listingsData, petsMap }) => {
        const listings: Listing[] = [];
        for (const key in listingsData) {
          if (listingsData.hasOwnProperty(key)) {
            const listing = this.mapListingData(key, listingsData[key]);
            listings.push(this.resolvePets(listing, petsMap));
          }
        }
        return listings.reverse();
      }),
    );
  }

  getListing(id: string): Observable<Listing> {
    return this.http
      .get<ListingData>(
        `${environment.firebaseRDBUrl}/listings/${id}.json?auth=${this.authService.getToken()}`,
      )
      .pipe(
        switchMap((data) => {
          const listing = this.mapListingData(id, data);
          const petIds = Object.keys(listing.petIds || {});

          if (petIds.length === 0) {
            listing.pets = [];
            return [listing];
          }

       
          return forkJoin(
            petIds.map((petId) =>
              this.http.get<any>(
                `${environment.firebaseRDBUrl}/pets/${petId}.json?auth=${this.authService.getToken()}`,
              ),
            ),
          ).pipe(
            map((petsData) => {
              listing.pets = petsData
                .map((d, i) => (d ? { id: petIds[i], ...d } : null))
                .filter((p): p is Pet => !!p);
              return listing;
            }),
          );
        }),
      );
  }

  addListing(listingData: {
    petIds: { [petId: string]: boolean };
    dateFrom: string;
    dateTo: string;
    price: number;
    note?: string;
  }) {
    const ownerId = this.authService.getUserId();
    const body: ListingData = { ...listingData, ownerId: ownerId!, status: 'Otvoren' };

    return this.http.post<{ name: string }>(
      `${environment.firebaseRDBUrl}/listings.json?auth=${this.authService.getToken()}`,
      body,
    );
  }

  // Samo vlasnik 
  editListing(
    id: string,
    listingData: {
      petIds: { [petId: string]: boolean };
      dateFrom: string;
      dateTo: string;
      price: number;
      note?: string;
    },
    ownerId: string,
    status: Listing['status'],
  ) {
    const body: ListingData = { ...listingData, ownerId, status };

    return this.http.put(
      `${environment.firebaseRDBUrl}/listings/${id}.json?auth=${this.authService.getToken()}`,
      body,
    );
  }

  // Samo vlasnik oglasa briise
  deleteListing(id: string) {
    return this.http
      .delete(
        `${environment.firebaseRDBUrl}/listings/${id}.json?auth=${this.authService.getToken()}`,
      )
      .pipe(
        switchMap(() => this.listings),
        take(1),
        tap((listings) => {
          this._listings.next(listings.filter((l) => l.id !== id));
        }),
      );
  }

  
  closeListing(id: string) {
    return this.http.patch(
      `${environment.firebaseRDBUrl}/listings/${id}.json?auth=${this.authService.getToken()}`,
      { status: 'Zatvoren' },
    );
  }
}
