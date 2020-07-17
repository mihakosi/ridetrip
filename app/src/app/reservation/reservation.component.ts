import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { switchMap } from "rxjs/operators";
import L from "leaflet";
import "leaflet-routing-machine";

import { ErrorService } from "../error.service";
import { ReservationsService } from "../reservations.service";

@Component({
  selector: "app-reservation",
  templateUrl: "./reservation.component.html",
  styleUrls: ["./reservation.component.css"],
})
export class ReservationComponent implements OnInit {
  constructor(private errorService: ErrorService, private reservationsService: ReservationsService, private path: ActivatedRoute) {}

  public reservation: any;

  public error = {
    type: "",
    message: "",
  };

  public cancellable: boolean;

  map: any;

  public sharingLocation: boolean = false;

  watchPosition;

  marker: any;

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

    // Routing: turned off to minimize number of requests
    // L.Routing.control({
    //   waypoints: waypoints,
    //   lineOptions: {
    //     addWaypoints: false,
    //   },
    //   createMarker: function () {
    //     return null;
    //   },
    // }).addTo(map);
  }

  shareLocation(): void {
    this.sharingLocation = true;

    // Icon created by Twitter
    var userPin = L.icon({
      iconUrl: "/assets/images/traveller.svg",
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
            if (this.marker) {
              this.map.removeLayer(this.marker);
            }

            this.marker = L.marker([reservation.latitude, reservation.longitude], { icon: userPin });
            this.marker.addTo(this.map);
          })
          .catch((error) => {
            this.errorService.onGetError.emit({ message: error, type: "danger" });
          });
      },
      (error) => {
        this.errorService.onGetError.emit({ message: "Lokacije ni mogoče pridobiti.", type: "danger" });
      },
      {
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 5000,
      }
    );
  }

  stopShareLocation(): void {
    this.sharingLocation = false;

    navigator.geolocation.clearWatch(this.watchPosition);
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
        },
        (error) => {
          this.error.type = "data";
          this.error.message = error;
        }
      );
  }
}
