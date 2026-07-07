import { Component, Input, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import {
  AlertController,
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonTitle,
  IonToolbar,
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close } from 'ionicons/icons';
import { Pet } from '../../pets/pet.model';

@Component({
  selector: 'app-listing-modal',
  templateUrl: './listing-modal.component.html',
  styleUrls: ['./listing-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonTextarea,
    IonInput,
    IonItem,
    IonRow,
    IonCol,
    IonGrid,
    IonContent,
    IonButton,
    IonIcon,
    IonButtons,
    IonToolbar,
    IonHeader,
    IonTitle,
    IonSelect,
    IonSelectOption,
  ],
})
export class ListingModalComponent implements OnInit {
  modalCtrl: ModalController = inject(ModalController);
  alertCtrl: AlertController = inject(AlertController);

  @ViewChild('f', { static: true }) form!: NgForm;

  @Input() title = 'Dodaj oglas';
  @Input() myPets: Pet[] = [];
  // Za izmenu: postojece vrednosti
  @Input() selectedPetIds: string[] = [];
  @Input() dateFrom?: string;
  @Input() dateTo?: string;
  @Input() price?: number;
  @Input() note?: string;

  constructor() {}

  ngOnInit() {
    addIcons({ close });
  }

  onCancel() {
    this.modalCtrl.dismiss();
  }

  async onSave() {
    const value = this.form.value;
    const petIdsArray: string[] = value['petIds'] || [];

    if (petIdsArray.length === 0) {
      const alert = await this.alertCtrl.create({
        header: 'Nedostaje ljubimac',
        message: 'Izaberi bar jednog ljubimca za koga je potreban čuvar.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    if (value['dateTo'] < value['dateFrom']) {
      const alert = await this.alertCtrl.create({
        header: 'Neispravan period',
        message: 'Datum "do" ne može biti pre datuma "od".',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    const petIds: { [id: string]: boolean } = {};
    petIdsArray.forEach((id) => (petIds[id] = true));

    this.modalCtrl.dismiss(
      {
        listingData: {
          petIds,
          dateFrom: value['dateFrom'],
          dateTo: value['dateTo'],
          price: +value['price'],
          note: value['note'] || undefined,
        },
      },
      'confirm',
    );
  }
}
