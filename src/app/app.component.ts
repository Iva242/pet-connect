import { Component, inject, OnInit } from "@angular/core";
import {
  IonApp,
  IonContent,
  IonHeader,
  IonFooter, 
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuToggle,
  IonRouterOutlet,
  IonTitle,
  IonToolbar,
} from "@ionic/angular/standalone";
import { addIcons } from "ionicons";
import {
  paw,
  search,
  listCircle,
  mailUnread,
  logOut,
  personCircleOutline,
} from "ionicons/icons"; 
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "./auth/auth";

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"],
  imports: [
    IonApp,
    IonRouterOutlet,
    IonMenu,
    IonContent,
    IonHeader,
    IonFooter, 
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonMenuToggle,
    RouterLink,
  ],
})
export class AppComponent implements OnInit {
  authService: AuthService = inject(AuthService);
  router: Router = inject(Router);

  // Promenljive koje će HTML prikazati na dnu menija
  korisnikIme: string = "";
  korisnikPrezime: string = "";

  constructor() {
    // 2. Registrujemo sve ikonice uključujući i profilnu
    addIcons({
      paw,
      search,
      listCircle,
      mailUnread,
      logOut,
      personCircleOutline,
    });
  }

  // ngOnInit() {
  //   const userDataString = localStorage.getItem("userData");

  //   if (userDataString) {
  //     try {
  //       const userData = JSON.parse(userDataString);

  //       // Koristimo email kao glavni identifikator
  //       this.korisnikIme = userData.email || "Gost";
  //       this.korisnikPrezime = ""; // Ovde nam prezime ne treba
  //     } catch (e) {
  //       console.error("Greška pri čitanju userData:", e);
  //       this.korisnikIme = "Gost";
  //     }
  //   }
  // }

  ngOnInit() {
    this.authService.userChanged.subscribe((userDataString) => {
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        this.korisnikIme = userData.email || "Gost";
      } else {
        this.korisnikIme = "Gost";
      }
    });
  }

  onLogOut() {
    this.authService.logOut();
    this.router.navigateByUrl("/log-in");
  }
}
