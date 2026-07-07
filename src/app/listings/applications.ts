import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { AuthService } from '../auth/auth';
import { environment } from 'src/environments/environment';
import { Application } from './application.model';

interface ApplicationData {
  listingId: string;
  listingOwnerId: string;
  listingDateFrom: string;
  listingDateTo: string;
  listingPrice: number;
  sitterId: string;
  message?: string;
  status: string;
}


@Injectable({ providedIn: 'root' })
export class ApplicationsService {
  http: HttpClient = inject(HttpClient);
  authService: AuthService = inject(AuthService);

  constructor() {}

  private mapData(id: string, data: ApplicationData): Application {
    return { id, ...data, status: data.status as Application['status'] };
  }


  getApplicationsForListing(listingId: string): Observable<Application[]> {
    return this.http
      .get<{ [key: string]: ApplicationData } | null>(
        `${environment.firebaseRDBUrl}/applications.json?auth=${this.authService.getToken()}&orderBy="listingId"&equalTo="${listingId}"`,
      )
      .pipe(
        map((data) => {
          const list: Application[] = [];
          for (const key in data) {
            if (data.hasOwnProperty(key)) list.push(this.mapData(key, data[key]));
          }
          return list;
        }),
      );
  }


  getMyApplications(): Observable<Application[]> {
    const userId = this.authService.getUserId();
    return this.http
      .get<{ [key: string]: ApplicationData } | null>(
        `${environment.firebaseRDBUrl}/applications.json?auth=${this.authService.getToken()}&orderBy="sitterId"&equalTo="${userId}"`,
      )
      .pipe(
        map((data) => {
          const list: Application[] = [];
          for (const key in data) {
            if (data.hasOwnProperty(key)) list.push(this.mapData(key, data[key]));
          }
          return list.reverse();
        }),
      );
  }

  apply(
    listing: { id: string; ownerId: string | null; dateFrom: string; dateTo: string; price: number },
    message: string,
  ) {
    const body: ApplicationData = {
      listingId: listing.id,
      listingOwnerId: listing.ownerId!,
      listingDateFrom: listing.dateFrom,
      listingDateTo: listing.dateTo,
      listingPrice: listing.price,
      sitterId: this.authService.getUserId()!,
      message: message || undefined,
      status: 'Na čekanju',
    };

    return this.http.post<{ name: string }>(
      `${environment.firebaseRDBUrl}/applications.json?auth=${this.authService.getToken()}`,
      body,
    );
  }


  accept(applicationId: string) {
    return this.http.patch(
      `${environment.firebaseRDBUrl}/applications/${applicationId}.json?auth=${this.authService.getToken()}`,
      { status: 'Prihvaćeno' },
    );
  }

  reject(applicationId: string) {
    return this.http.patch(
      `${environment.firebaseRDBUrl}/applications/${applicationId}.json?auth=${this.authService.getToken()}`,
      { status: 'Odbijeno' },
    );
  }


  withdraw(applicationId: string) {
    return this.http.delete(
      `${environment.firebaseRDBUrl}/applications/${applicationId}.json?auth=${this.authService.getToken()}`,
    );
  }
}
