import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { switchMap } from "rxjs/operators";
import L from "leaflet";
import "leaflet-routing-machine";

import { ErrorService } from "../error.service";
import { RidesService } from "../rides.service";
import { ReservationsService } from "../reservations.service";

@Component({
  selector: "app-ride",
  templateUrl: "./ride.component.html",
  styleUrls: ["./ride.component.css"],
})
export class RideComponent implements OnInit {
  constructor(
    private router: Router,
    private errorService: ErrorService,
    private ridesService: RidesService,
    private reservationsService: ReservationsService,
    private path: ActivatedRoute
  ) {}

  public ride: any;

  public search: any;

  public error = {
    type: "",
    message: "",
  };

  initializeMap(): void {
    var bluePin = L.icon({
      iconUrl: "/assets/images/pin_blue.svg",
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30],
    });

    var redPin = L.icon({
      iconUrl: "/assets/images/pin_red.svg",
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30],
    });

    var greenPin = L.icon({
      iconUrl: "/assets/images/pin_green.svg",
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30],
    });

    var map = L.map("map", { zoomControl: false }).setView([46.188, 15.079], 7);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    let waypoints = [];

    L.marker([this.ride.routes[0].startLatitude, this.ride.routes[0].startLongitude], { icon: redPin }).addTo(map);
    waypoints.push(L.latLng(this.ride.routes[0].startLatitude, this.ride.routes[0].startLongitude));

    for (var i = 1; i < this.ride.routes.length; i++) {
      L.marker([this.ride.routes[i].startLatitude, this.ride.routes[i].startLongitude], { icon: bluePin }).addTo(map);
      waypoints.push(L.latLng(this.ride.routes[i].startLatitude, this.ride.routes[i].startLongitude));
    }

    L.marker([this.ride.routes[this.ride.routes.length - 1].endLatitude, this.ride.routes[this.ride.routes.length - 1].endLongitude], {
      icon: greenPin,
    }).addTo(map);
    waypoints.push(
      L.latLng(this.ride.routes[this.ride.routes.length - 1].endLatitude, this.ride.routes[this.ride.routes.length - 1].endLongitude)
    );

    // Routing
    L.Routing.control({
      waypoints: waypoints,
      lineOptions: {
        addWaypoints: false,
      },
      createMarker: function () {
        return null;
      },
    }).addTo(map);
  }

  createReservation(): void {
    this.error.type = "loading";
    this.error.message = "";

    let routes = [];
    this.ride.routes.forEach((route) => {
      routes.push(route.id);
    });

    let reservation = {
      passengers: this.search.passengers,
      baggage: this.search.baggage,
      routes: routes,
    };

    this.reservationsService
      .createReservation(reservation)
      .then((reservation) => {
        this.errorService.onGetError.emit({ message: "Rezervacija uspešno izvedena.", type: "success" });
        this.router.navigateByUrl("/reservations");
      })
      .catch((error) => {
        this.error.type = "danger";
        this.error.message = error;
      });
  }

  ngOnInit(): void {
    this.search = this.ridesService.getSearch();

    this.path.paramMap
      .pipe(
        switchMap((params: ParamMap) => {
          let id = params.get("id");
          return this.ridesService.getRide(parseInt(id), this.search);
        })
      )
      .subscribe(
        (ride: any) => {
          this.ride = ride;
          this.initializeMap();
        },
        (error) => {
          this.error.type = "data";
          this.error.message = error;
        }
      );
  }
}
