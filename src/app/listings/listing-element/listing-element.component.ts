import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonAvatar, IonIcon, IonItem, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { paw } from 'ionicons/icons';
import { Listing } from '../listing.model';

@Component({
  selector: 'app-listing-element',
  templateUrl: './listing-element.component.html',
  styleUrls: ['./listing-element.component.scss'],
  standalone: true,
  imports: [CommonModule, IonItem, IonAvatar, IonLabel, IonIcon],
})
export class ListingElementComponent {
  @Input() listing!: Listing;

  constructor() {
    addIcons({ paw });
  }

  get petNamesLabel(): string {
    if (!this.listing.pets || this.listing.pets.length === 0) return 'Ljubimci';
    return this.listing.pets.map((p) => p.name).join(', ');
  }

  get firstPetImage(): string {
    return this.listing.pets?.[0]?.imageUrl || 'https://placehold.co/100x100/F5E6D8/2b2118?text=%F0%9F%90%BE';
  }
}
