import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { User } from "./user.model";
import { BehaviorSubject, switchMap, tap } from "rxjs";

export interface AuthResponseData {
  idToken: string;
  email: string;
  refreshToken: string;
  localId: string;
  expiresIn: string;
  registered?: boolean;
}

export interface UserData {
  name?: string;
  surname?: string;
  email: string;
  password: string;
}

// Autentifikacija se radi ISKLJUČIVO preko Firebase Auth REST API-ja
// (Identity Toolkit), bez Firebase SDK biblioteka — kako je traženo u
// napomeni profesora.
@Injectable({
  providedIn: "root",
})
export class AuthService {
  user?: User | null;

  private _isUserAuthenticated = false;
  // Obaveštava ostale delove aplikacije kada se status korisnika promeni
  userChanged = new BehaviorSubject<string | null>(null);

  http: HttpClient = inject(HttpClient);

  constructor() {
    // Čim se aplikacija upali, odmah proveravamo da li u memoriji imamo ulogovanog korisnika
    this.autoLogIn();
  }

  get isUserAuthenticated(): boolean {
    return this._isUserAuthenticated;
  }

  // Posle uspešne registracije u Firebase Auth-u, odmah upisujemo i profil
  // korisnika (ime, prezime, email) u Realtime Database, na /users/{uid}.
  // Ovo nam je potrebno kasnije da bismo vlasniku oglasa mogli da prikažemo
  // KO se prijavio kao čuvar (sam uid ne znači ništa u interfejsu).
  register(user: UserData) {
    return this.http
      .post<AuthResponseData>(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.firebaseAPIKey}`,
        { email: user.email, password: user.password, returnSecureToken: true },
      )
      .pipe(
        switchMap((authData) =>
          this.http.put(
            `${environment.firebaseRDBUrl}/users/${authData.localId}.json?auth=${authData.idToken}`,
            {
              name: user.name || "",
              surname: user.surname || "",
              email: user.email,
            },
          ),
        ),
      );
  }

  logIn(user: UserData) {
    return this.http
      .post<AuthResponseData>(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.firebaseAPIKey}`,
        { email: user.email, password: user.password, returnSecureToken: true },
      )
      .pipe(
        tap((userData) => {
          const expirationTime = new Date(
            new Date().getTime() + +userData.expiresIn * 1000,
          );
          const user = new User(
            userData.localId,
            userData.email,
            userData.idToken,
            expirationTime,
          );
          this.user = user;
          this._isUserAuthenticated = true;

          
          localStorage.setItem(
            "userData",
            JSON.stringify({
              id: userData.localId,
              email: userData.email,
              token: userData.idToken,
              expirationDate: expirationTime.toISOString(),
            }),
          );
          this.userChanged.next(
            JSON.stringify({
              id: userData.localId,
              email: userData.email,
              token: userData.idToken,
              expirationDate: expirationTime.toISOString(),
            }),
          );
        }),
      );
  }

  logOut() {
    this._isUserAuthenticated = false;
    this.user = null;
    localStorage.removeItem("userData");
    this.userChanged.next(null);
  }

  getToken() {
    if (this.user) return this.user.token;
    else return null;
  }

  getUserId() {
    if (this.user) return this.user.id;
    else return null;
  }

private autoLogIn() {
  const storedData = localStorage.getItem("userData");
  if (!storedData) {
    return;
  }

  const parsedData = JSON.parse(storedData);
  const expirationTime = new Date(parsedData.expirationDate);


  if (expirationTime <= new Date()) {
    this.logOut();
    return;
  }

  
  this.user = new User(
    parsedData.id,
    parsedData.email,
    parsedData.token,
    expirationTime,
  );
  this._isUserAuthenticated = true;


  this.userChanged.next(storedData); 
}
}
