import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AlertController,
  IonButtons,
  IonContent,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonList,
  IonItem,
  IonMenuButton,
  IonTitle,
  IonToolbar,
  ModalController,
  ViewWillEnter,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, pawOutline, pencil, trash } from 'ionicons/icons';
import { Pet } from './pet.model';
import { PetsService } from './pets';
import { PetElementComponent } from './pet-element/pet-element.component';
import { PetModalComponent } from './pet-modal/pet-modal.component';

@Component({
  selector: 'app-pets',
  templateUrl: './pets.page.html',
  styleUrls: ['./pets.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonFabButton,
    IonIcon,
    IonList,
    IonItem,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    PetElementComponent,
  ],
})
export class PetsPage implements OnInit, ViewWillEnter {
  petsService: PetsService = inject(PetsService);
  modalCtrl: ModalController = inject(ModalController);
  alertCtrl: AlertController = inject(AlertController);

  pets: Pet[] = [];

  constructor() {
    addIcons({ add, pawOutline, pencil, trash });
  }

  ngOnInit() {}

  ionViewWillEnter() {
    this.fetchPets(); // Pozivamo zajedničku metodu pri ulasku na ekran
  }

  // Pomoćna metoda koja osvežava listu ljubimaca sa Firebase-a
  private fetchPets() {
    this.petsService.getMyPets().subscribe((pets) => {
      this.pets = pets;
    });
  }

  async openAddModal() {
    const modal = await this.modalCtrl.create({
      component: PetModalComponent,
      componentProps: { title: 'Dodaj ljubimca' },
    });

    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {

      this.petsService.addPet(data.petData).subscribe(() => {
        this.fetchPets();
      });
    }
  }

  async onEdit(pet: Pet, slidingItem: IonItemSliding) {
    await slidingItem.close();

    const modal = await this.modalCtrl.create({
      component: PetModalComponent,
      componentProps: {
        title: 'Izmeni ljubimca',
        petName: pet.name,
        vrsta: pet.vrsta,
        rasa: pet.rasa,
        starost: pet.starost,
        opis: pet.opis,
        imageUrl: pet.imageUrl,
      },
    });

    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      
      this.petsService.editPet(pet.id, data.petData, pet.ownerId!).subscribe(() => {
        this.fetchPets();
      });
    }
  }

  async onDelete(pet: Pet, slidingItem: IonItemSliding) {
    await slidingItem.close();

    const alert = await this.alertCtrl.create({
      header: 'Brisanje ljubimca',
      message: `Da li si sigurna da želiš da obrišeš "${pet.name}"? Ako je ${pet.name} naveden u nekom tvom oglasu, taj oglas neće biti automatski izmenjen.`,
      buttons: [
        { text: 'Otkaži', role: 'cancel' },
        {
          text: 'Obriši',
          role: 'destructive',
          
          handler: () => {
            this.petsService.deletePet(pet.id).subscribe(() => {
              this.fetchPets();
            });
          },
        },
      ],
    });

    await alert.present();
  }
}