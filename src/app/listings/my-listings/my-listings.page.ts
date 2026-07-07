import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  AlertController,
  IonButtons,
  IonContent,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonList,
  IonMenuButton,
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonToolbar,
  ModalController,
  RefresherCustomEvent,
  ViewWillEnter,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
} from "@ionic/angular/standalone";
import { RouterLink } from "@angular/router";
import { Subscription } from "rxjs";
import { Listing } from "../listing.model";
import { Pet } from "../../pets/pet.model";
import { ListingsService } from "../listings";
import { PetsService } from "../../pets/pets";
import { ListingElementComponent } from "../listing-element/listing-element.component";
import { ListingModalComponent } from "../listing-modal/listing-modal.component";
import { addIcons } from "ionicons";
import { add, megaphoneOutline, create, trash } from "ionicons/icons";

@Component({
  selector: "app-my-listings",
  templateUrl: "./my-listings.page.html",
  styleUrls: ["./my-listings.page.scss"],
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
    IonRefresher,
    IonRefresherContent,
    ListingElementComponent,
    RouterLink,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
  ],
})
export class MyListingsPage implements OnInit, OnDestroy, ViewWillEnter {
  listingsService: ListingsService = inject(ListingsService);
  petsService: PetsService = inject(PetsService);
  modalCtrl: ModalController = inject(ModalController);
  alertCtrl: AlertController = inject(AlertController);

  listings: Listing[] = [];
  myPets: Pet[] = [];
  isLoading = false;

  petsSub: Subscription = new Subscription();

  constructor() {
   
    addIcons({ add, megaphoneOutline, create, trash });
  }

  ngOnInit() {
    this.petsSub = this.petsService.myPets.subscribe(
      (pets) => (this.myPets = pets),
    );
  }

  ngOnDestroy() {
    this.petsSub?.unsubscribe();
  }

  ionViewWillEnter() {
    this.petsService.getMyPets().subscribe();
    this.loadMyListings();
  }

  loadMyListings(event?: RefresherCustomEvent) {
    this.isLoading = true;
    this.listingsService.getMyListings().subscribe({
      next: (listings) => {
        this.listings = listings;
        this.isLoading = false;
        event?.target.complete();
      },
      error: () => {
        this.isLoading = false;
        event?.target.complete();
      },
    });
  }

  async openAddModal() {
    if (this.myPets.length === 0) {
      const alert = await this.alertCtrl.create({
        header: "Nemaš dodatih ljubimaca",
        message:
          'Prvo dodaj bar jednog ljubimca na tabu "Ljubimci", pa se vrati ovde da napraviš oglas.',
        buttons: ["OK"],
      });
      await alert.present();
      return;
    }

    const modal = await this.modalCtrl.create({
      component: ListingModalComponent,
      componentProps: { title: "Novi oglas za čuvanje", myPets: this.myPets },
    });

    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === "confirm") {
      this.listingsService
        .addListing(data.listingData)
        .subscribe(() => this.loadMyListings());
    }
  }


  async openEditModal(listing: Listing, slidingItem: IonItemSliding) {
    
    await slidingItem.close();

    const modal = await this.modalCtrl.create({
      component: ListingModalComponent,
      componentProps: {
        title: "Izmeni oglas",
        myPets: this.myPets,
        selectedPetIds: Object.keys(listing.petIds || {}),
        dateFrom: listing.dateFrom,
        dateTo: listing.dateTo,
        price: listing.price,
        note: listing.note,
      },
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    
    if (role === "confirm") {
      this.isLoading = true;
      this.listingsService
        .editListing(
          listing.id,
          data.listingData,
          listing.ownerId!,
          listing.status,
        )
        .subscribe({
          next: () => {
            this.loadMyListings(); 
          },
          error: () => {
            this.isLoading = false;
          },
        });
    }
  }

  async onDeleteListing(listing: Listing, slidingItem: IonItemSliding) {
    await slidingItem.close();

    const alert = await this.alertCtrl.create({
      header: "Brisanje oglasa",
      message: "Da li si sigurna da želiš da obrišeš ovaj oglas?",
      buttons: [
        { text: "Otkaži", role: "cancel" },
        {
          text: "Obriši",
          role: "destructive",
          handler: () => {
            this.isLoading = true;
            this.listingsService.deleteListing(listing.id).subscribe({
              next: () => {
                this.isLoading = false;
                this.loadMyListings(); 
              },
              error: () => {
                this.isLoading = false;
              },
            });
          },
        },
      ],
    });

    await alert.present();
  }
}
