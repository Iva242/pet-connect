import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonAvatar, IonItem, IonLabel } from '@ionic/angular/standalone';
import { Pet } from '../pet.model';

@Component({
  selector: 'app-pet-element',
  templateUrl: './pet-element.component.html',
  styleUrls: ['./pet-element.component.scss'],
  standalone: true,
  imports: [CommonModule, IonItem, IonAvatar, IonLabel],
})
export class PetElementComponent {
  @Input() pet: Pet = {
    id: '0',
    ownerId: '',
    name: 'Ljubimac',
    vrsta: 'Pas',
    imageUrl: '',
  };


  formatujStarost(starost: number | undefined | null): string {
    if (starost === undefined || starost === null || starost <= 0) {
      return 'Nepoznato';
    }


    if (starost < 1) {
      const meseci = Math.round(starost * 12);
      return `${meseci} mes.`;
    }

    const godine = Math.floor(starost);
    const preostaliMeseci = Math.round((starost - godine) * 12);


    if (preostaliMeseci === 0) {
      return `${godine} god.`;
    }


    return `${godine} god. ${preostaliMeseci} mes.`;
  }
}