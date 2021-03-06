import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { switchMap } from "rxjs/operators";

import { ErrorService } from "../error.service";
import { RecurringService } from "../recurring.service";
import { VehiclesService } from "../vehicles.service";
import { NominatimService } from "../nominatim.service";

@Component({
  selector: "app-manage-recurring-offer",
  templateUrl: "./recurring-manage-offer.component.html",
  styleUrls: ["./recurring-manage-offer.component.css"],
})
export class RecurringManageOfferComponent implements OnInit {
  constructor(
    private router: Router,
    private errorService: ErrorService,
    private recurringService: RecurringService,
    private vehiclesService: VehiclesService,
    private nominatimService: NominatimService,
    private path: ActivatedRoute
  ) {}

  public vehicles: any[];

  public date: Date = new Date();

  public hours: string[] = [];

  public minutes: string[] = [];

  public startSearch = {
    loading: false,
    message: "",
  };

  public endSearch = {
    loading: false,
    message: "",
  };

  public error = {
    type: "",
    message: "",
  };

  public offer: any;

  selectVehicle(vehicle: any): void {
    this.offer.vehicle = vehicle.id;

    this.offer.passengers = vehicle.passengers;
    this.offer.baggage = vehicle.baggage;
  }

  getSearch(event): void {
    let type = event.target.getAttribute("data-type");

    if (type === "start") {
      this.startSearch.loading = true;
      this.startSearch.message = "";
    } else {
      this.endSearch.loading = true;
      this.endSearch.message = "";
    }

    this.nominatimService
      .getSearch(event.target.value)
      .then((results) => {
        this.setLocation(results, type);
      })
      .catch((error) => {
        if (type === "start") {
          this.startSearch.loading = false;
          this.startSearch.message = "Napaka pri iskanju lokacije.";
        } else {
          this.endSearch.loading = false;
          this.endSearch.message = "Napaka pri iskanju lokacije.";
        }
      });
  }

  setLocation(results, type): void {
    if (type === "start") {
      if (results.length > 0) {
        this.startSearch.loading = false;

        this.offer.start = results[0].display_name;
        this.offer.startSimple =
          results[0].address.city || results[0].address.town || results[0].address.village || results[0].address.municipality;
        this.offer.startLatitude = results[0].lat;
        this.offer.startLongitude = results[0].lon;
      } else {
        this.startSearch.loading = false;
        this.startSearch.message = "Lokacije ni mogoče najti.";

        this.offer.start = "";
        this.offer.startSimple = "";
        this.offer.startLatitude = null;
        this.offer.startLongitude = null;
      }
    } else {
      if (results.length > 0) {
        this.endSearch.loading = false;

        this.offer.end = results[0].display_name;
        this.offer.endSimple =
          results[0].address.city || results[0].address.town || results[0].address.village || results[0].address.municipality;
        this.offer.endLatitude = results[0].lat;
        this.offer.endLongitude = results[0].lon;
      } else {
        this.endSearch.loading = false;
        this.endSearch.message = "Lokacije ni mogoče najti.";

        this.offer.end = "";
        this.offer.endSimple = "";
        this.offer.endLatitude = null;
        this.offer.endLongitude = null;
      }
    }
  }

  updateRecurringOffer(): void {
    this.error.type = "loading";
    this.error.message = "";

    let offer = {
      id: this.offer.id,
      vehicle: this.offer.vehicle,
      passengers: this.offer.passengers,
      baggage: this.offer.baggage,
      start: this.offer.start,
      startSimple: this.offer.startSimple,
      startLatitude: this.offer.startLatitude,
      startLongitude: this.offer.startLongitude,
      end: this.offer.end,
      endSimple: this.offer.endSimple,
      endLatitude: this.offer.endLatitude,
      endLongitude: this.offer.endLongitude,
      mondays: this.offer.mondays,
      tuesdays: this.offer.tuesdays,
      wednesdays: this.offer.wednesdays,
      thursdays: this.offer.thursdays,
      fridays: this.offer.fridays,
      saturdays: this.offer.saturdays,
      sundays: this.offer.sundays,
      hours: this.offer.hours,
      minutes: this.offer.minutes,
      price: this.offer.price,
      description: this.offer.description,
    };

    this.recurringService
      .updateRecurringOffer(offer)
      .then((offer) => {
        this.errorService.onGetError.emit({ message: "Ponavljajoči prevoz uspešno posodobljen.", type: "success" });
        this.router.navigateByUrl("/recurring/manage/offers");
      })
      .catch((error) => {
        this.error.type = "danger";
        this.error.message = error;
      });
  }

  deleteRecurringOffer(): void {
    this.error.type = "loading";
    this.error.message = "";

    this.recurringService
      .deleteRecurringOffer(this.offer.id)
      .then(() => {
        this.errorService.onGetError.emit({ message: "Ponavljajoči prevoz uspešno izbrisan.", type: "success" });
        this.router.navigateByUrl("/recurring/manage/offers");
      })
      .catch((error) => {
        this.error.type = "danger";
        this.error.message = error;
      });
  }

  ngOnInit(): void {
    // Generate hours
    for (var i = 0; i <= 23; i++) {
      if (i < 10) {
        this.hours.push("0" + i.toString());
      } else {
        this.hours.push(i.toString());
      }
    }

    // Generate minutes
    for (var i = 0; i <= 59; i++) {
      if (i < 10) {
        this.minutes.push("0" + i.toString());
      } else {
        this.minutes.push(i.toString());
      }
    }

    this.vehiclesService
      .getVehicles()
      .then((vehicles) => {
        this.vehicles = vehicles;

        this.path.paramMap
          .pipe(
            switchMap((params: ParamMap) => {
              let id = params.get("id");
              return this.recurringService.getRecurringOffer(parseInt(id));
            })
          )
          .subscribe(
            (offer: any) => {
              offer.hours = offer.departure.split(":")[0];
              offer.minutes = offer.departure.split(":")[1];
              offer.vehicle = offer.vehicleId;

              this.offer = offer;
            },
            (error) => {
              this.error.type = "data";
              this.error.message = error;
            }
          );
      })
      .catch((error) => {
        this.error.type = "data";
        this.error.message = error;
      });
  }
}
