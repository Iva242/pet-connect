import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonInput,
  IonItem,
  IonRow,
  IonTitle,
  IonToolbar,
  LoadingController,
  AlertController,
} from '@ionic/angular/standalone';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonGrid,
    IonRow,
    IonCol,
    IonItem,
    IonInput,
    IonButton,
    RouterLink,
  ],
})
export class RegisterPage implements OnInit {
  authService: AuthService = inject(AuthService);
  router: Router = inject(Router);
  loadingCtrl: LoadingController = inject(LoadingController);
  alertCtrl: AlertController = inject(AlertController);

  registerForm: FormGroup;

  constructor() {
    this.registerForm = new FormGroup({
      name: new FormControl(null, Validators.required),
      surname: new FormControl(null, Validators.required),
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [
        Validators.required,
        Validators.minLength(7),
      ]),
    });
  }

  ngOnInit() {}

  async onRegister() {
    if (this.registerForm.invalid) return;

    const loadingEl = await this.loadingCtrl.create({
      message: 'Registracija u toku...',
    });
    await loadingEl.present();

    this.authService.register(this.registerForm.value).subscribe({
      next: async () => {
        await loadingEl.dismiss();

        const alert = await this.alertCtrl.create({
          header: 'Registracija uspela',
          message: 'Nalog je kreiran. Sada se možeš prijaviti.',
          buttons: ['OK'],
        });
        await alert.present();
        await alert.onDidDismiss();

        this.router.navigateByUrl('/log-in');
      },
      error: async (errRes) => {
        await loadingEl.dismiss();

        let message = 'Registracija nije uspela. Pokušajte ponovo.';
        const code = errRes?.error?.error?.message;
        if (code === 'EMAIL_EXISTS') {
          message = 'Nalog sa ovom email adresom već postoji.';
        } else if (code === 'INVALID_EMAIL') {
          message = 'Email adresa nije ispravna.';
        }

        const alert = await this.alertCtrl.create({
          header: 'Registracija neuspela',
          message,
          buttons: ['OK'],
        });
        await alert.present();
      },
    });
  }
}
