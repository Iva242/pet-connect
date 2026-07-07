export type PetVrsta = 'Pas' | 'Mačka';

export const PET_VRSTE: PetVrsta[] = ['Pas', 'Mačka'];

export interface Pet {
  id: string;
  ownerId: string | null;
  name: string;
  vrsta: PetVrsta;
  rasa?: string;
  starost?: number;
  opis?: string;
  imageUrl: string;
}
