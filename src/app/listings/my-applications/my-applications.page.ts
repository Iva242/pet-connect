import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenuButton,
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonToolbar,
  AlertController,
  RefresherCustomEvent,
  ViewWillEnter,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { mailUnreadOutline, trashOutline } from 'ionicons/icons';
import { Application } from '../application.model';
import { ApplicationsService } from '../applications';

@Component({
  selector: 'app-my-applications',
  templateUrl: './my-applications.page.html',
  styleUrls: ['./my-applications.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonButton,
    IonRefresher,
    IonRefresherContent,
  ],
})
export class MyApplicationsPage implements OnInit, ViewWillEnter {
  applicationsService: ApplicationsService = inject(ApplicationsService);
  alertCtrl: AlertController = inject(AlertController);

  applications: Application[] = [];
  isLoading = false;

  constructor() {
    addIcons({ mailUnreadOutline, trashOutline });
  }

  ngOnInit() {}

  ionViewWillEnter() {
    this.load();
  }

  load(event?: RefresherCustomEvent) {
    this.isLoading = true;
    this.applicationsService.getMyApplications().subscribe({
      next: (apps) => {
        this.applications = apps;
        this.isLoading = false;
        event?.target.complete();
      },
      error: () => {
        this.isLoading = false;
        event?.target.complete();
      },
    });
  }

  async onWithdraw(app: Application) {
    const alert = await this.alertCtrl.create({
      header: 'Povuci prijavu',
      message: 'Da li si sigurna da želiš da povučeš ovu prijavu?',
      buttons: [
        { text: 'Otkaži', role: 'cancel' },
        {
          text: 'Povuci',
          role: 'destructive',
          handler: () => {
            this.applicationsService.withdraw(app.id).subscribe(() => {
              this.applications = this.applications.filter((a) => a.id !== app.id);
            });
          },
        },
      ],
    });

    await alert.present();
  }

  statusClass(status: Application['status']): string {
    if (status === 'Prihvaćeno') return 'status-chip status-chip--confirmed';
    if (status === 'Odbijeno') return 'status-chip status-chip--cancelled';
    return 'status-chip status-chip--pending';
  }
}
