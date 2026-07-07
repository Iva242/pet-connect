export type ApplicationStatus = 'Na čekanju' | 'Prihvaćeno' | 'Odbijeno';

export interface Application {
  id: string;
  listingId: string;
  listingOwnerId: string;
  listingDateFrom: string;
  listingDateTo: string;
  listingPrice: number;
  sitterId: string;
  message?: string;
  status: ApplicationStatus;
}
