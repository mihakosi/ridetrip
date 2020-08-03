import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { switchMap } from "rxjs/operators";
import L from "leaflet";
import "leaflet-routing-machine";

import { ErrorService } from "../error.service";
import { OffersService } from "../offers.service";
import { RatingsService } from "../ratings.service";
import { ReservationsService } from "../reservations.service";

@Component({
  selector: "app-offer",
  templateUrl: "./offer.component.html",
  styleUrls: ["./offer.component.css"],
})
export class OfferComponent implements OnInit {
  constructor(
    private errorService: ErrorService,
    private offersService: OffersService,
    private ratingsService: RatingsService,
    private reservationsService: ReservationsService,
    private path: ActivatedRoute
  ) {}

  public offer: any;

  public passengers: any[];

  public error = {
    type: "",
    message: "",
  };

  map: any;

  public sharingLocation: boolean = false;

  watchPosition;

  locationInterval;

  driverMarker: any;

  passengerMarkers: any = {};

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

    L.marker([this.offer.routes[0].startLatitude, this.offer.routes[0].startLongitude], { icon: redPin }).addTo(this.map);
    waypoints.push(L.latLng(this.offer.routes[0].startLatitude, this.offer.routes[0].startLongitude));

    for (var i = 1; i < this.offer.routes.length; i++) {
      L.marker([this.offer.routes[i].startLatitude, this.offer.routes[i].startLongitude], { icon: bluePin }).addTo(this.map);
      waypoints.push(L.latLng(this.offer.routes[i].startLatitude, this.offer.routes[i].startLongitude));
    }

    L.marker([this.offer.routes[this.offer.routes.length - 1].endLatitude, this.offer.routes[this.offer.routes.length - 1].endLongitude], {
      icon: greenPin,
    }).addTo(this.map);
    waypoints.push(
      L.latLng(this.offer.routes[this.offer.routes.length - 1].endLatitude, this.offer.routes[this.offer.routes.length - 1].endLongitude)
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

  allowOfferCancellation(): boolean {
    return (new Date(this.offer.routes[0].departure).getTime() - new Date().getTime()) / (60 * 60 * 1000) >= 8;
  }

  allowReservationCancellation(departure: Date): boolean {
    return (new Date(departure).getTime() - new Date().getTime()) / (60 * 60 * 1000) >= 8;
  }

  allowLocationSharing(): boolean {
    return this.offer.routes.some((route) => {
      return Math.abs(new Date(route.departure).getTime() - new Date().getTime()) / (60 * 60 * 1000) < 1;
    });
  }

  shareLocation(): void {
    this.sharingLocation = true;

    // Person icon created by Twitter
    // Added grey circle with white border as background
    var passengerPin = L.icon({
      iconUrl: "/assets/images/passenger.svg",
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

        this.offersService
          .shareLocation(this.offer, location)
          .then((offer) => {
            if (this.driverMarker) {
              this.map.removeLayer(this.driverMarker);
            }

            if (offer.latitude && offer.longitude) {
              this.driverMarker = L.marker([offer.latitude, offer.longitude], { icon: locationPin });
              this.driverMarker.addTo(this.map);
            }
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

    this.locationInterval = setInterval(() => {
      this.offersService
        .getLocation(this.offer)
        .then((location) => {
          location.forEach((coords) => {
            if (this.passengerMarkers[coords.id]) {
              this.map.removeLayer(this.passengerMarkers[coords.id]);
            }

            if (coords.latitude && coords.longitude) {
              let marker = L.marker([coords.latitude, coords.longitude], { icon: passengerPin });
              marker.addTo(this.map);

              this.passengerMarkers[coords.id] = marker;
            }
          });
        })
        .catch((error) => {
          this.errorService.onGetError.emit({ message: error, type: "danger" });
        });
    }, 5000);
  }

  stopShareLocation(): void {
    this.sharingLocation = false;

    if (this.watchPosition) {
      navigator.geolocation.clearWatch(this.watchPosition);
    }
    if (this.locationInterval) {
      clearInterval(this.locationInterval);
    }
  }

  createRating(reservation: number, rating: number): void {
    this.ratingsService
      .createRating({
        role: 0,
        rating: rating,
        reservation: reservation,
      })
      .then((rating) => {
        this.offersService
          .getPassengers(this.offer)
          .then((passengers) => {
            this.passengers = passengers;
          })
          .catch((error) => {
            this.errorService.onGetError.emit({ message: error, type: "danger" });
          });

        this.errorService.onGetError.emit({ message: "Ocena uspešno oddana.", type: "success" });
      })
      .catch((error) => {
        this.errorService.onGetError.emit({ message: error, type: "danger" });
      });
  }

  cancelReservation(reservationActive: any): void {
    this.error.type = "loading";
    this.error.message = "";

    reservationActive.cancellationReason = "Rezervacijo je preklical/a ponudnik/ca prevoza.";

    this.reservationsService
      .cancelReservation(reservationActive)
      .then((reservation) => {
        this.error.type = "";
        this.error.message = "";

        this.errorService.onGetError.emit({ message: "Rezervacija je preklicana.", type: "success" });

        reservationActive.active = reservation.active;
        reservationActive.cancellationReason = reservation.cancellationReason;

        this.offer.passengersSpace += reservationActive.passengers;
        this.offer.baggageSpace += reservationActive.baggage;
      })
      .catch((error) => {
        this.errorService.onGetError.emit({ message: error, type: "danger" });
      });
  }

  cancelOffer(): void {
    this.error.type = "loading";
    this.error.message = "";

    this.offersService
      .cancelOffer(this.offer)
      .then((offer) => {
        this.error.type = "success";
        this.error.message = "Prevoz je preklican.";

        this.offer.active = offer.active;
        this.offer.cancellationReason = offer.cancellationReason;

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
          return this.offersService.getOffer(parseInt(id));
        })
      )
      .subscribe(
        (offer: any) => {
          this.offer = offer;
          this.initializeMap();

          let today = new Date();

          if ((today.getTime() - new Date(offer.routes[offer.routes.length - 1].departure).getTime()) / (60 * 60 * 1000) >= 24) {
            this.offersService
              .getPassengers(offer)
              .then((passengers) => {
                this.passengers = passengers;
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
