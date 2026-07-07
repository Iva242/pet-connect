import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth/auth';
import { UserProfile } from './user-profile.model';

// Profil korisnika (ime, prezime, email) upisuje se JEDNOM, prilikom
// registracije (vidi AuthService.register). Ovde ga samo čitamo — koristi se
// da bismo vlasniku oglasa prikazali ko se konkretno prijavio kao čuvar.
@Injectable({ providedIn: 'root' })
export class UsersService {
  http: HttpClient = inject(HttpClient);
  authService: AuthService = inject(AuthService);

  constructor() {}

  getUser(uid: string) {
    return this.http.get<UserProfile | null>(
      `${environment.firebaseRDBUrl}/users/${uid}.json?auth=${this.authService.getToken()}`,
    );
  }
}
