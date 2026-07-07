import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonInput,
  IonInputPasswordToggle,
  IonItem,
  IonLabel,
  IonList,
  IonRow,
  IonTitle,
  IonToolbar,
  LoadingController,
  AlertController,
} from '@ionic/angular/standalone';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.page.html',
  styleUrls: ['./log-in.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonList,
    IonItem,
    IonInput,
    IonButton,
    IonRow,
    IonCol,
    IonGrid,
    IonInputPasswordToggle,
    IonLabel,
    RouterLink,
  ],
})
export class LogInPage implements OnInit {
  router: Router = inject(Router);
  authService: AuthService = inject(AuthService);
  loadingCtrl: LoadingController = inject(LoadingController);
  alertCtrl: AlertController = inject(AlertController);

  constructor() {}

  ngOnInit() {}

  async onLogIn(logInForm: NgForm) {
    if (!logInForm.valid) return;

    const loadingEl = await this.loadingCtrl.create({
      message: 'Prijava u toku...',
    });
    await loadingEl.present();

    this.authService.logIn(logInForm.value).subscribe({
      next: () => {
        loadingEl.dismiss();
        this.router.navigateByUrl('/listings/tabs/explore');
      },
      error: async (errRes) => {
        loadingEl.dismiss();

        let message = 'Prijava nije uspela. Pokušajte ponovo.';
        const code = errRes?.error?.error?.message;
        if (code === 'EMAIL_NOT_FOUND' || code === 'INVALID_LOGIN_CREDENTIALS') {
          message = 'Ne postoji nalog sa unetim podacima.';
        } else if (code === 'INVALID_PASSWORD') {
          message = 'Pogrešna lozinka.';
        }

        const alert = await this.alertCtrl.create({
          header: 'Autentifikacija neuspela',
          message,
          buttons: ['OK'],
        });
        await alert.present();

        logInForm.reset();
      },
    });
  }
}
