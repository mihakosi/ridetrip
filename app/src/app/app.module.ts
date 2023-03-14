import { BrowserModule } from "@angular/platform-browser";
import { NgModule, LOCALE_ID } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import "@angular/common/locales/global/sl";

import { MapComponent } from "./map/map.component";
import { LayoutComponent } from "./layout/layout.component";
import { SignInComponent } from "./sign-in/sign-in.component";
import { SignUpComponent } from "./sign-up/sign-up.component";
import { SettingsComponent } from "./settings/settings.component";
import { AccountComponent } from "./account/account.component";
import { VehiclesComponent } from "./vehicles/vehicles.component";
import { VehiclesNewComponent } from "./vehicles-new/vehicles-new.component";
import { VehicleComponent } from "./vehicle/vehicle.component";
import { SearchComponent } from "./search/search.component";
import { RidesComponent } from "./rides/rides.component";
import { RideComponent } from "./ride/ride.component";
import { OffersComponent } from "./offers/offers.component";
import { OffersNewComponent } from "./offers-new/offers-new.component";
import { ReservationsComponent } from "./reservations/reservations.component";
import { ReservationComponent } from "./reservation/reservation.component";
import { OfferComponent } from "./offer/offer.component";

import { AuthenticationGuardService as AuthenticationGuard } from "./authentication-guard.service";
import { ReservationsHistoryComponent } from "./reservations-history/reservations-history.component";
import { OffersHistoryComponent } from "./offers-history/offers-history.component";
import { RecurringManageOffersComponent } from "./recurring-manage-offers/recurring-manage-offers.component";
import { RecurringManageRidesComponent } from "./recurring-manage-rides/recurring-manage-rides.component";
import { RecurringManageRidesNewComponent } from "./recurring-manage-rides-new/recurring-manage-rides-new.component";
import { RecurringManageOffersNewComponent } from "./recurring-manage-offers-new/recurring-manage-offers-new.component";
import { RecurringManageRideComponent } from "./recurring-manage-ride/recurring-manage-ride.component";
import { RecurringManageOfferComponent } from "./recurring-manage-offer/recurring-manage-offer.component";
import { RecurringRidesComponent } from "./recurring-rides/recurring-rides.component";
import { RecurringOffersComponent } from "./recurring-offers/recurring-offers.component";

@NgModule({
  declarations: [
    MapComponent,
    LayoutComponent,
    SignInComponent,
    SignUpComponent,
    SettingsComponent,
    AccountComponent,
    VehiclesComponent,
    VehiclesNewComponent,
    VehicleComponent,
    SearchComponent,
    RidesComponent,
    RideComponent,
    OffersComponent,
    OffersNewComponent,
    ReservationsComponent,
    ReservationComponent,
    OfferComponent,
    ReservationsHistoryComponent,
    OffersHistoryComponent,
    RecurringManageOffersComponent,
    RecurringManageRidesComponent,
    RecurringManageRidesNewComponent,
    RecurringManageOffersNewComponent,
    RecurringManageRideComponent,
    RecurringManageOfferComponent,
    RecurringRidesComponent,
    RecurringOffersComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot([
      {
        path: "",
        component: MapComponent,
      },
      {
        path: "search",
        component: SearchComponent,
        canActivate: [AuthenticationGuard],
      },
      {
        path: "rides",
        component: RidesComponent,
        canActivate: [AuthenticationGuard],
      },
      {
        path: "rides/:id",
        component: RideComponent,
        canActivate: [AuthenticationGuard],
      },
      {
        path: "reservations",
        component: ReservationsComponent,
        canActivate: [AuthenticationGuard],
      },
      {
        path: "reservations/:id",
        component: ReservationComponent,
        canActivate: [AuthenticationGuard],
      },
      {
        path: "offers",
        component: OffersComponent,
        canActivate: [AuthenticationGuard],
      },
      {
        path: "offers/new",
        component: OffersNewComponent,
        canActivate: [AuthenticationGuard],
      },
      {
        path: "offers/:id",
        component: OfferComponent,
        canActivate: [AuthenticationGuard],
      },
      {
        path: "recurring/rides",
        component: RecurringRidesComponent,
        canActivate: [AuthenticationGuard],
      },
      {
        path: "recurring/offers",
        component: RecurringOffersComponent,
        canActivate: [AuthenticationGuard],
      },
      {
        path: "settings",
        component: SettingsComponent,
        canActivate: [AuthenticationGuard],
      },
      {
        path: "recurring/manage/rides",
        component: RecurringManageRidesComponent,
        canActivate: [AuthenticationGuard],
      },
      {
        path: "recurring/manage/rides/new",
        component: RecurringManageRidesNewComponent,
        canActivate: [AuthenticationGuard],
      },
      {
        path: "recurring/manage/rides/:id",
        component: RecurringManageRideComponent,
        canActivate: [AuthenticationGuard],
      },
      {
        path: "recurring/manage/offers",
        component: RecurringManageOffersComponent,
        canActivate: [AuthenticationGuard],
      },
      {
        path: "recurring/manage/offers/new",
        component: RecurringManageOffersNewComponent,
        canActivate: [AuthenticationGuard],
      },
      {
        path: "recurring/manage/offers/:id",
        component: RecurringManageOfferComponent,
        canActivate: [AuthenticationGuard],
      },
      {
        path: "vehicles",
        component: VehiclesComponent,
        canActivate: [AuthenticationGuard],
      },
      {
        path: "vehicles/new",
        component: VehiclesNewComponent,
        canActivate: [AuthenticationGuard],
      },
      {
        path: "vehicles/:id",
        component: VehicleComponent,
        canActivate: [AuthenticationGuard],
      },
      {
        path: "history/reservations",
        component: ReservationsHistoryComponent,
        canActivate: [AuthenticationGuard],
      },
      {
        path: "history/offers",
        component: OffersHistoryComponent,
        canActivate: [AuthenticationGuard],
      },
      {
        path: "account",
        component: AccountComponent,
        canActivate: [AuthenticationGuard],
      },
      {
        path: "signin",
        component: SignInComponent,
      },
      {
        path: "signup",
        component: SignUpComponent,
      },
      {
        path: "**",
        redirectTo: "",
      },
    ]),
  ],
  providers: [
    {
      provide: LOCALE_ID,
      useValue: "sl",
    },
  ],
  bootstrap: [LayoutComponent],
})
export class AppModule {}
