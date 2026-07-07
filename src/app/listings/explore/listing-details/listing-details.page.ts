import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AlertController,
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonSpinner,
  IonTitle,
  IonToolbar,
  LoadingController,
  ModalController,
  NavController,
} from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { addIcons } from 'ionicons';
import { pencil, trash, paw, checkmarkCircle, closeCircle, mailOutline } from 'ionicons/icons';
import { Listing } from '../../listing.model';
import { Application } from '../../application.model';
import { ListingsService } from '../../listings';
import { ApplicationsService } from '../../applications';
import { PetsService } from '../../../pets/pets';
import { Pet } from '../../../pets/pet.model';
import { AuthService } from '../../../auth/auth';
import { UsersService } from '../../../users/users';
import { UserProfile } from '../../../users/user-profile.model';
import { ListingModalComponent } from '../../listing-modal/listing-modal.component';
import { ApplicationModalComponent } from '../../application-modal/application-modal.component';
import { PetElementComponent } from '../../../pets/pet-element/pet-element.component';

interface ApplicationView extends Application {
  sitterProfile?: UserProfile | null;
}

@Component({
  selector: 'app-listing-details',
  templateUrl: './listing-details.page.html',
  styleUrls: ['./listing-details.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonFabButton,
    IonIcon,
    IonSpinner,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    PetElementComponent,
  ],
})
export class ListingDetailsPage implements OnInit, OnDestroy {
  listingSub: Subscription = new Subscription();
  myPetsSub: Subscription = new Subscription();

  listing?: Listing;
  isLoading = false;

  myPets: Pet[] = [];

  // Pogled "čuvara" (nisam vlasnik)
  myApplication?: Application | null;

  // Pogled "vlasnika" (jesam vlasnik) — primljene prijave
  applications: ApplicationView[] = [];

  route: ActivatedRoute = inject(ActivatedRoute);
  listingsService: ListingsService = inject(ListingsService);
  applicationsService: ApplicationsService = inject(ApplicationsService);
  petsService: PetsService = inject(PetsService);
  usersService: UsersService = inject(UsersService);
  authService: AuthService = inject(AuthService);
  navCtrl: NavController = inject(NavController);
  modalCtrl: ModalController = inject(ModalController);
  loadingCtrl: LoadingController = inject(LoadingController);
  alertCtrl: AlertController = inject(AlertController);

  constructor() {
    addIcons({ trash, pencil, paw, checkmarkCircle, closeCircle, mailOutline });
  }

  get isOwner(): boolean {
    return !!this.listing && this.listing.ownerId === this.authService.getUserId();
  }

  ngOnInit() {
    this.petsService.getMyPets().subscribe();
    this.myPetsSub = this.petsService.myPets.subscribe((pets) => (this.myPets = pets));

    this.route.paramMap.subscribe((paramMap) => {
      const id = paramMap.get('listingId');
      if (!id) return;
      this.loadListing(id);
    });
  }

  ngOnDestroy() {
    this.listingSub?.unsubscribe();
    this.myPetsSub?.unsubscribe();
  }

  loadListing(id: string) {
    this.isLoading = true;

    this.listingSub = this.listingsService.getListing(id).subscribe({
      next: (listing) => {
        this.listing = listing;
        this.isLoading = false;

        if (this.isOwner) {
          this.loadApplications(id);
        } else {
          this.loadMyApplicationStatus(id);
        }
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  loadApplications(listingId: string) {
    this.applicationsService.getApplicationsForListing(listingId).subscribe((apps) => {
      this.applications = apps as ApplicationView[];
      this.applications.forEach((app) => {
        this.usersService.getUser(app.sitterId).subscribe((profile) => {
          app.sitterProfile = profile;
        });
      });
    });
  }

  loadMyApplicationStatus(listingId: string) {
    const myId = this.authService.getUserId();
    this.applicationsService.getApplicationsForListing(listingId).subscribe((apps) => {
      this.myApplication = apps.find((a) => a.sitterId === myId) || null;
    });
  }

  async onEditListing() {
    if (!this.listing) return;

    const modal = await this.modalCtrl.create({
      component: ListingModalComponent,
      componentProps: {
        title: 'Izmeni oglas',
        myPets: this.myPets,
        selectedPetIds: Object.keys(this.listing.petIds || {}),
        dateFrom: this.listing.dateFrom,
        dateTo: this.listing.dateTo,
        price: this.listing.price,
        note: this.listing.note,
      },
    });

    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm' && this.listing) {
      this.listingsService
        .editListing(this.listing.id, data.listingData, this.listing.ownerId!, this.listing.status)
        .subscribe(() => this.loadListing(this.listing!.id));
    }
  }

  async onDeleteListing() {
    if (!this.listing) return;

    const alert = await this.alertCtrl.create({
      header: 'Brisanje oglasa',
      message: 'Da li si sigurna da želiš da obrišeš ovaj oglas?',
      buttons: [
        { text: 'Otkaži', role: 'cancel' },
        {
          text: 'Obriši',
          role: 'destructive',
          handler: async () => {
            const loading = await this.loadingCtrl.create({ message: 'Brisanje...' });
            await loading.present();

            this.listingsService.deleteListing(this.listing!.id).subscribe(async () => {
              await loading.dismiss();
              this.navCtrl.navigateBack('/listings/tabs/my-listings');
            });
          },
        },
      ],
    });

    await alert.present();
  }

  async onApply() {
    if (!this.listing) return;

    const modal = await this.modalCtrl.create({ component: ApplicationModalComponent });
    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm' && this.listing) {
      this.applicationsService.apply(this.listing, data.message).subscribe(async () => {
        const alert = await this.alertCtrl.create({
          header: 'Prijava poslata',
          message: 'Vlasnik će pregledati tvoju prijavu. Status možeš pratiti na tabu "Moje prijave".',
          buttons: ['OK'],
        });
        await alert.present();
        this.loadMyApplicationStatus(this.listing!.id);
      });
    }
  }

  onAccept(app: ApplicationView) {
    this.applicationsService.accept(app.id).subscribe(() => {
      app.status = 'Prihvaćeno';
      this.listingsService.closeListing(this.listing!.id).subscribe(() => {
        this.listing!.status = 'Zatvoren';
      });
    });
  }

  onReject(app: ApplicationView) {
    this.applicationsService.reject(app.id).subscribe(() => {
      app.status = 'Odbijeno';
    });
  }

  statusClass(status: Application['status']): string {
    if (status === 'Prihvaćeno') return 'status-chip status-chip--confirmed';
    if (status === 'Odbijeno') return 'status-chip status-chip--cancelled';
    return 'status-chip status-chip--pending';
  }
}
