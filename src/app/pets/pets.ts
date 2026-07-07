import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, map, switchMap, take, tap } from 'rxjs';
import { AuthService } from '../auth/auth';
import { environment } from 'src/environments/environment';
import { Pet } from './pet.model';

interface PetData {
  ownerId: string;
  name: string;
  vrsta: string;
  rasa?: string;
  starost?: number;
  opis?: string;
  imageUrl: string;
}

// Komunikacija sa Firebase Realtime Databasepreko REST API-ja,
//
@Injectable({ providedIn: 'root' })
export class PetsService {
  // Ljubimci ulogovanog korisnika 
  private _myPets = new BehaviorSubject<Pet[]>([]);
  get myPets() {
    return this._myPets.asObservable();
  }

  http: HttpClient = inject(HttpClient);
  authService: AuthService = inject(AuthService);

  constructor() {}

  private mapPetData(id: string, data: PetData): Pet {
    return {
      id,
      ownerId: data.ownerId,
      name: data.name,
      vrsta: data.vrsta as Pet['vrsta'],
      rasa: data.rasa,
      starost: data.starost,
      opis: data.opis,
      imageUrl: data.imageUrl,
    };
  }

  getMyPets() {
    const userId = this.authService.getUserId();
    return this.http
      .get<{ [key: string]: PetData } | null>(
        `${environment.firebaseRDBUrl}/pets.json?auth=${this.authService.getToken()}&orderBy="ownerId"&equalTo="${userId}"`,
      )
      .pipe(
        map((data) => {
          const pets: Pet[] = [];
          for (const key in data) {
            if (data.hasOwnProperty(key)) pets.push(this.mapPetData(key, data[key]));
          }
          return pets.reverse();
        }),
        tap((pets) => this._myPets.next(pets)),
      );
  }


  getAllPetsMap() {
    return this.http
      .get<{ [key: string]: PetData } | null>(
        `${environment.firebaseRDBUrl}/pets.json?auth=${this.authService.getToken()}`,
      )
      .pipe(
        map((data) => {
          const map: { [id: string]: Pet } = {};
          for (const key in data) {
            if (data.hasOwnProperty(key)) map[key] = this.mapPetData(key, data[key]);
          }
          return map;
        }),
      );
  }

  addPet(petData: Omit<Pet, 'id' | 'ownerId'>) {
    const ownerId = this.authService.getUserId();
    const body: PetData = { ...petData, ownerId: ownerId! };

    return this.http
      .post<{ name: string }>(
        `${environment.firebaseRDBUrl}/pets.json?auth=${this.authService.getToken()}`,
        body,
      )
      .pipe(
        switchMap((resData) => {
          const newPet: Pet = { id: resData.name, ownerId, ...petData };
          return this._myPets.pipe(
            take(1),
            tap((pets) => this._myPets.next([newPet, ...pets])),
          );
        }),
      );
  }

  // Samo vlasnik moxe da ga izmeni i brise
  editPet(id: string, petData: Omit<Pet, 'id' | 'ownerId'>, ownerId: string) {
    const body: PetData = { ...petData, ownerId };

    return this.http
      .put(
        `${environment.firebaseRDBUrl}/pets/${id}.json?auth=${this.authService.getToken()}`,
        body,
      )
      .pipe(
        switchMap(() => this.myPets),
        take(1),
        tap((pets) => {
          const updated = pets.map((p) => (p.id === id ? { id, ownerId, ...petData } : p));
          this._myPets.next(updated);
        }),
      );
  }

  deletePet(id: string) {
    return this.http
      .delete(
        `${environment.firebaseRDBUrl}/pets/${id}.json?auth=${this.authService.getToken()}`,
      )
      .pipe(
        switchMap(() => this.myPets),
        take(1),
        tap((pets) => {
          this._myPets.next(pets.filter((p) => p.id !== id));
        }),
      );
  }
}
