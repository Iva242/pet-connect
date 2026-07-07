import { Pet } from '../pets/pet.model';

export type ListingStatus = 'Otvoren' | 'Zatvoren';

export interface Listing {
  id: string;
  ownerId: string | null;
  petIds: { [petId: string]: boolean };
  dateFrom: string;
  dateTo: string;
  price: number;
  note?: string;
  status: ListingStatus;
  pets?: Pet[];
}
