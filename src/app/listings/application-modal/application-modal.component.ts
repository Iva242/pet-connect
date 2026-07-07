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
  IonItem,
  IonRow,
  IonTextarea,
  IonTitle,
  IonToolbar,
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close } from 'ionicons/icons';

@Component({
  selector: 'app-application-modal',
  templateUrl: './application-modal.component.html',
  styleUrls: ['./application-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonTextarea,
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
  ],
})
export class ApplicationModalComponent implements OnInit {
  modalCtrl: ModalController = inject(ModalController);

  @ViewChild('f', { static: true }) form!: NgForm;

  constructor() {}

  ngOnInit() {
    addIcons({ close });
  }

  onCancel() {
    this.modalCtrl.dismiss();
  }

  onSave() {
    this.modalCtrl.dismiss({ message: this.form.value['message'] || '' }, 'confirm');
  }
}
