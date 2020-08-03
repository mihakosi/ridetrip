import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { switchMap } from "rxjs/operators";
import L from "leaflet";
import "leaflet-routing-machine";

import { ErrorService } from "../error.service";
import { RatingsService } from "../ratings.service";
import { ReservationsService } from "../reservations.service";

@Component({
  selector: "app-reservation",
  templateUrl: "./reservation.component.html",
  styleUrls: ["./reservation.component.css"],
})
export class ReservationComponent implements OnInit {
  constructor(
    private errorService: ErrorService,
    private ratingsService: RatingsService,
    private reservationsService: ReservationsService,
    private path: ActivatedRoute
  ) {}

  public reservation: any;

  public driver: any;

  public error = {
    type: "",
    message: "",
  };

  public cancellable: boolean;

  map: any;

  public sharingLocation: boolean = false;

  watchPosition;

  locationInterval;

  driverMarker: any;

  passengerMarker: any;

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

    this.map = L.map("map", { zoomControl: false }).setView([46.188, 15.079], 7);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    let waypoints = [];

    L.marker([this.reservation.routes[0].startLatitude, this.reservation.routes[0].startLongitude], { icon: redPin }).addTo(this.map);
    waypoints.push(L.latLng(this.reservation.routes[0].startLatitude, this.reservation.routes[0].startLongitude));

    for (var i = 1; i < this.reservation.routes.length; i++) {
      L.marker([this.reservation.routes[i].startLatitude, this.reservation.routes[i].startLongitude], { icon: bluePin }).addTo(this.map);
      waypoints.push(L.latLng(this.reservation.routes[i].startLatitude, this.reservation.routes[i].startLongitude));
    }

    L.marker(
      [
        this.reservation.routes[this.reservation.routes.length - 1].endLatitude,
        this.reservation.routes[this.reservation.routes.length - 1].endLongitude,
      ],
      {
        icon: greenPin,
      }
    ).addTo(this.map);
    waypoints.push(
      L.latLng(
        this.reservation.routes[this.reservation.routes.length - 1].endLatitude,
        this.reservation.routes[this.reservation.routes.length - 1].endLongitude
      )
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
    }).addTo(this.map);
  }

  allowReservationCancellation(): boolean {
    return (new Date(this.reservation.routes[0].departure).getTime() - new Date().getTime()) / (60 * 60 * 1000) >= 8;
  }

  allowLocationSharing(): boolean {
    return this.reservation.routes.some((route) => {
      return Math.abs(new Date(route.departure).getTime() - new Date().getTime()) / (60 * 60 * 1000) < 1;
    });
  }

  shareLocation(): void {
    this.sharingLocation = true;

    // Car icon created by Twitter
    // Added grey circle with white border as background
    var driverPin = L.icon({
      iconUrl: "/assets/images/car.svg",
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });

    var locationPin = L.icon({
      iconUrl: "/assets/images/location.svg",
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });

    this.watchPosition = navigator.geolocation.watchPosition(
      (position) => {
        let location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        this.reservationsService
          .shareLocation(this.reservation, location)
          .then((reservation) => {
            if (this.passengerMarker) {
              this.map.removeLayer(this.passengerMarker);
            }

            if (reservation.latitude && reservation.longitude) {
              this.passengerMarker = L.marker([reservation.latitude, reservation.longitude], { icon: locationPin });
              this.passengerMarker.addTo(this.map);
            }
          })
          .catch((error) => {
            this.errorService.onGetError.emit({ message: error, type: "danger" });
          });
      },
      (error) => {
        this.errorService.onGetError.emit({ message: error, type: "danger" });
      },
      {
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 5000,
      }
    );

    this.locationInterval = setInterval(() => {
      this.reservationsService.getLocation(this.reservation).then((location) => {
        if (this.driverMarker) {
          this.map.removeLayer(this.driverMarker);
        }

        if (location.latitude && location.longitude) {
          this.driverMarker = L.marker([location.latitude, location.longitude], { icon: driverPin });
          this.driverMarker.addTo(this.map);
        }
      });
    }, 5000);
  }

  stopShareLocation(): void {
    this.sharingLocation = false;

    navigator.geolocation.clearWatch(this.watchPosition);
    clearInterval(this.locationInterval);
  }

  createRating(reservation: number, rating: number): void {
    this.ratingsService
      .createRating({
        role: 1,
        rating: rating,
        reservation: reservation,
      })
      .then((rating) => {
        this.driver = null;
        this.errorService.onGetError.emit({ message: "Ocena uspešno oddana.", type: "success" });
      })
      .catch((error) => {
        this.errorService.onGetError.emit({ message: error, type: "danger" });
      });
  }

  cancelReservation(): void {
    this.error.type = "loading";
    this.error.message = "";

    this.reservationsService
      .cancelReservation(this.reservation)
      .then((reservation) => {
        this.error.type = "success";
        this.error.message = "Rezervacija je preklicana.";

        this.reservation.active = reservation.active;
        this.reservation.cancellationReason = reservation.cancellationReason;

        document.getElementById("dismissCancellation").click();
      })
      .catch((error) => {
        this.error.type = "danger";
        this.error.message = error;
      });
  }

  ngOnInit(): void {
    this.path.paramMap
      .pipe(
        switchMap((params: ParamMap) => {
          let id = params.get("id");
          return this.reservationsService.getReservation(parseInt(id));
        })
      )
      .subscribe(
        (reservation: any) => {
          this.reservation = reservation;
          this.initializeMap();

          let today = new Date();
          this.cancellable = (new Date(reservation.routes[0].departure).getTime() - today.getTime()) / (60 * 60 * 1000) >= 8;

          if (
            (today.getTime() - new Date(reservation.routes[reservation.routes.length - 1].departure).getTime()) / (60 * 60 * 1000) >=
            24
          ) {
            this.reservationsService
              .getDriver(reservation)
              .then((driver) => {
                this.driver = driver;
              })
              .catch((error) => {
                this.errorService.onGetError.emit({ message: error, type: "danger" });
              });
          }
        },
        (error) => {
          this.error.type = "data";
          this.error.message = error;
        }
      );
  }

  ngOnDestroy(): void {
    this.stopShareLocation();
  }
}
