import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { ErrorService } from "../error.service";
import { OffersService } from "../offers.service";
import { VehiclesService } from "../vehicles.service";
import { NominatimService } from "../nominatim.service";

@Component({
  selector: "app-offers-new",
  templateUrl: "./offers-new.component.html",
  styleUrls: ["./offers-new.component.css"],
})
export class OffersNewComponent implements OnInit {
  constructor(
    private router: Router,
    private errorService: ErrorService,
    private offersService: OffersService,
    private vehiclesService: VehiclesService,
    private nominatimService: NominatimService
  ) {}

  public vehicles: any[];

  public date: Date = new Date();

  public days: string[] = [];

  public months: string[] = [];

  public years: string[] = [];

  public hours: string[] = [];

  public minutes: string[] = [];

  public startSearch = [
    {
      loading: false,
      message: "",
    },
  ];

  public stopSearch = {
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

  public offer = {
    vehicle: 0,
    passengers: 0,
    baggage: 0,
    description: "",
    stops: [
      {
        start: "",
        startSimple: "",
        startLatitude: 0.0,
        startLongitude: 0.0,
        date: null,
        day: null,
        month: null,
        year: null,
        hours: null,
        minutes: null,
        price: 0.0,
      },
    ],
    end: "",
    endSimple: "",
    endLatitude: 0.0,
    endLongitude: 0.0,
  };

  public isMobile: boolean = false;

  addStop(): void {
    this.offer.stops.push({
      start: "",
      startSimple: "",
      startLatitude: 0.0,
      startLongitude: 0.0,
      date: null,
      day: null,
      month: null,
      year: null,
      hours: null,
      minutes: null,
      price: 0.0,
    });

    this.startSearch.push({
      loading: false,
      message: "",
    });
  }

  removeStop(): void {
    this.offer.stops.splice(-1, 1);
    this.startSearch.splice(-1, 1);
  }

  selectVehicle(vehicle: any): void {
    this.offer.vehicle = vehicle.id;

    this.offer.passengers = vehicle.passengers;
    this.offer.baggage = vehicle.baggage;
  }

  getSearch(event, i): void {
    let type = event.target.getAttribute("data-type");

    if (type === "start") {
      this.startSearch[i].loading = true;
      this.startSearch[i].message = "";
    } else {
      this.endSearch.loading = true;
      this.endSearch.message = "";
    }

    this.nominatimService
      .getSearch(event.target.value)
      .then((results) => {
        this.setLocation(results, type, i);
      })
      .catch((error) => {
        if (type === "start") {
          this.startSearch[i].loading = false;
          this.startSearch[i].message = "Napaka pri iskanju lokacije.";
        } else {
          this.endSearch.loading = false;
          this.endSearch.message = "Napaka pri iskanju lokacije.";
        }
      });
  }

  setLocation(results, type, i): void {
    if (type === "start") {
      if (results.length > 0) {
        this.startSearch[i].loading = false;

        this.offer.stops[i].start = results[0].display_name;
        this.offer.stops[i].startSimple =
          results[0].address.city || results[0].address.town || results[0].address.village || results[0].address.municipality;
        this.offer.stops[i].startLatitude = results[0].lat;
        this.offer.stops[i].startLongitude = results[0].lon;
      } else {
        this.startSearch[i].loading = false;
        this.startSearch[i].message = "Lokacije ni mogoče najti.";

        this.offer.stops[i].start = "";
        this.offer.stops[i].startSimple = "";
        this.offer.stops[i].startLatitude = null;
        this.offer.stops[i].startLongitude = null;
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

  createOffer(): void {
    this.error.type = "loading";
    this.error.message = "";

    let routes = [];

    for (var i = 0; i < this.offer.stops.length; i++) {
      if (!this.isMobile) {
        this.offer.stops[i].date = new Date(
          this.offer.stops[i].year,
          this.offer.stops[i].month - 1,
          this.offer.stops[i].day,
          this.offer.stops[i].hours,
          this.offer.stops[i].minutes
        );
      }

      if (i == this.offer.stops.length - 1) {
        let route = {
          start: this.offer.stops[i].start,
          startSimple: this.offer.stops[i].startSimple,
          startLatitude: this.offer.stops[i].startLatitude,
          startLongitude: this.offer.stops[i].startLongitude,
          end: this.offer.end,
          endSimple: this.offer.endSimple,
          endLatitude: this.offer.endLatitude,
          endLongitude: this.offer.endLongitude,
          departure: this.offer.stops[i].date,
          price: this.offer.stops[i].price,
        };

        routes.push(route);
      } else {
        let route = {
          start: this.offer.stops[i].start,
          startSimple: this.offer.stops[i].startSimple,
          startLatitude: this.offer.stops[i].startLatitude,
          startLongitude: this.offer.stops[i].startLongitude,
          end: this.offer.stops[i + 1].start,
          endSimple: this.offer.stops[i + 1].startSimple,
          endLatitude: this.offer.stops[i + 1].startLatitude,
          endLongitude: this.offer.stops[i + 1].startLongitude,
          departure: this.offer.stops[i].date,
          price: this.offer.stops[i].price,
        };

        routes.push(route);
      }
    }

    this.offer["routes"] = routes;

    this.offersService
      .createOffer(this.offer)
      .then((offer) => {
        this.errorService.onGetError.emit({ message: "Prevoz uspešno dodan.", type: "success" });
        this.router.navigateByUrl("/offers");
      })
      .catch((error) => {
        this.error.type = "danger";
        this.error.message = error;
      });
  }

  ngOnInit(): void {
    // Detect mobile devices
    var userAgent = navigator.userAgent || navigator.vendor;
    if (/windows phone/i.test(userAgent) || /android/i.test(userAgent) || (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream)) {
      this.isMobile = true;
    }

    // Generate days
    for (var i = 1; i <= 31; i++) {
      this.days.push(i.toString());
    }

    // Generate months
    for (var i = 1; i <= 12; i++) {
      this.months.push(i.toString());
    }

    // Generate years
    for (var i = this.date.getFullYear(); i <= 3000; i++) {
      this.years.push(i.toString());
    }

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
      })
      .catch((error) => {
        this.error.type = "data";
        this.error.message = error;
      });
  }
}
