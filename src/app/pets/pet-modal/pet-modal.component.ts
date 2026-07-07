import { Component, Input, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import {
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
import { close, cameraOutline } from 'ionicons/icons';
import { PET_VRSTE } from '../pet.model';

const DEFAULT_IMAGE = 'https://placehold.co/400x400/F5E6D8/2b2118?text=%F0%9F%90%BE';

@Component({
  selector: 'app-pet-modal',
  templateUrl: './pet-modal.component.html',
  styleUrls: ['./pet-modal.component.scss'],
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
export class PetModalComponent implements OnInit {
  modalCtrl: ModalController = inject(ModalController);

  @ViewChild('f', { static: true }) form!: NgForm;

  @Input() title = 'Dodaj ljubimca';
  @Input() petName?: string;
  @Input() vrsta?: string;
  @Input() rasa?: string;
  @Input() starost?: number;
  @Input() opis?: string;
  @Input() imageUrl?: string;

  vrste = PET_VRSTE;


  godine?: number;
  meseci?: number;

  constructor() {}

  ngOnInit() {
    addIcons({ close, cameraOutline });


    if (this.starost !== undefined && this.starost !== null) {
      this.godine = Math.floor(this.starost);
      this.meseci = Math.round((this.starost - this.godine) * 12);
    }
  }

  onCancel() {
    this.modalCtrl.dismiss();
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = () => {
      this.imageUrl = reader.result as string;
    };

    reader.readAsDataURL(file);
  }

  onSave() {
    const value = this.form.value;

   
    const g = value['godine'] ? +value['godine'] : 0;
    const m = value['meseci'] ? +value['meseci'] : 0;
    
    
    const izracunataStarost = g + (m / 12);

    this.modalCtrl.dismiss(
      {
        petData: {
          name: value['name'],
          vrsta: value['vrsta'],
          rasa: value['rasa'] || undefined,
          
          starost: izracunataStarost > 0 ? +izracunataStarost.toFixed(2) : undefined,
          opis: value['opis'] || undefined,
          imageUrl: (value['imageUrl'] || '').trim() || DEFAULT_IMAGE,
        },
      },
      'confirm',
    );
  }
}