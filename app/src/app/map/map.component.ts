import { Component, OnInit, OnDestroy } from "@angular/core";
import L from "leaflet";
import "leaflet-routing-machine";
import { Router } from "@angular/router";

import { ErrorService } from "../error.service";
import { OsrmService } from "../osrm.service";
import { RidesService } from "../rides.service";
import { OffersService } from "../offers.service";
import { NominatimService } from "../nominatim.service";
import { ReservationsService } from "../reservations.service";
import { DestinationsService } from "../destinations.service";
import { AuthenticationService } from "../authentication.service";

@Component({
  selector: "app-map",
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.css"],
})
export class MapComponent implements OnInit {
  constructor(
    private router: Router,
    private errorService: ErrorService,
    private osrmService: OsrmService,
    private ridesService: RidesService,
    private offersService: OffersService,
    private nominatimService: NominatimService,
    private reservationsService: ReservationsService,
    private destinationsService: DestinationsService,
    private authenticationService: AuthenticationService
  ) {}

  destinations: any[] = [];

  ride: any;

  location: any;

  map: any;

  watchPosition: any;

  userMarker: any;

  route: any;

  initializeMap(): void {
    this.map = L.map("map", { zoomControl: false }).setView([46.188, 15.079], 7);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);
  }

  shareLocation(): void {
    if (this.authenticationService.isSignedIn()) {
      var locationPin = L.icon({
        iconUrl: "/assets/images/location.svg",
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20],
      });

      this.watchPosition = navigator.geolocation.watchPosition(
        (position) => {
          this.location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          if (this.userMarker) {
            // Update user marker
            this.userMarker.setLatLng(new L.LatLng(position.coords.latitude, position.coords.longitude));
          } else {
            // Set user marker
            this.userMarker = L.marker([this.location.latitude, this.location.longitude], { icon: locationPin });
            this.userMarker.addTo(this.map);
          }

          this.getLatestReservation();
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
  }

  stopShareLocation(): void {
    if (this.watchPosition) {
      navigator.geolocation.clearWatch(this.watchPosition);
    }
  }

  getLatestReservation(): void {
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

    this.reservationsService
      .getLatestReservation()
      .then((reservation) => {
        if (reservation) {
          let locations = [];
          let waypoints = [];
          for (var i = 0; i < reservation.routes.length; i++) {
            if (i == 0) {
              locations.push({
                latitude: reservation.routes[i].startLatitude,
                longitude: reservation.routes[i].startLongitude,
              });

              waypoints.push(L.latLng(reservation.routes[i].startLatitude, reservation.routes[i].startLongitude));
            }

            locations.push({
              latitude: reservation.routes[i].endLatitude,
              longitude: reservation.routes[i].endLongitude,
            });

            waypoints.push(L.latLng(reservation.routes[i].endLatitude, reservation.routes[i].endLongitude));
          }

          this.osrmService
            .getRoute(locations)
            .then((route) => {
              // Calculate duration of the ride and estimated arrival time
              let duration = 0;
              route.routes.forEach((element) => {
                duration += element.duration;
              });

              let estimatedArrival = new Date(new Date(reservation.routes[0].departure).getTime() + duration * 1000);

              if (
                new Date(reservation.routes[0].departure).getTime() < new Date().getTime() &&
                new Date().getTime() < estimatedArrival.getTime()
              ) {
                this.destinations.forEach((marker) => {
                  this.map.removeLayer(marker);
                });

                for (var i = 0; i < locations.length; i++) {
                  let pin;
                  if (i == 0) {
                    pin = greenPin;
                  } else if (i == locations.length - 1) {
                    pin = redPin;
                  } else {
                    pin = bluePin;
                  }

                  this.destinations.push(L.marker([locations[i].latitude, locations[i].longitude], { icon: pin }).addTo(this.map));
                }

                if (!this.route) {
                  // Show route if the ride is currently being performed
                  this.route = L.Routing.control({
                    waypoints: waypoints,
                    lineOptions: {
                      addWaypoints: false,
                    },
                    createMarker: function () {
                      return null;
                    },
                  }).addTo(this.map);
                }

                // Get estimated time and distance to end location
                this.osrmService
                  .getRoute([
                    {
                      latitude: this.location.latitude,
                      longitude: this.location.longitude,
                    },
                    {
                      latitude: locations[locations.length - 1].latitude,
                      longitude: locations[locations.length - 1].longitude,
                    },
                  ])
                  .then((route) => {
                    // Retrieve remaining duration and distance
                    let duration = 0;
                    let distance = 0;
                    route.routes.forEach((element) => {
                      duration += element.duration;
                      distance += element.distance;
                    });

                    this.ride = {
                      estimatedArrival: new Date(new Date().getTime() + duration * 1000),
                      distance: distance,
                    };
                  })
                  .catch((error) => {
                    this.errorService.onGetError.emit({ message: "Časa potovanja ni mogoče pridobiti.", type: "danger" });
                  });
              } else {
                this.getLatestOffer();
              }
            })
            .catch((error) => {
              this.errorService.onGetError.emit({ message: "Časa potovanja ni mogoče pridobiti.", type: "danger" });
            });
        } else {
          this.getLatestOffer();
        }
      })
      .catch((error) => {
        this.errorService.onGetError.emit({ message: error, type: "danger" });
      });
  }

  getLatestOffer(): void {
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

    this.offersService
      .getLatestOffer()
      .then((offer) => {
        if (offer) {
          let locations = [];
          let waypoints = [];
          for (var i = 0; i < offer.routes.length; i++) {
            if (i == 0) {
              locations.push({
                latitude: offer.routes[i].startLatitude,
                longitude: offer.routes[i].startLongitude,
              });

              waypoints.push(L.latLng(offer.routes[i].startLatitude, offer.routes[i].startLongitude));
            }

            locations.push({
              latitude: offer.routes[i].endLatitude,
              longitude: offer.routes[i].endLongitude,
            });

            waypoints.push(L.latLng(offer.routes[i].endLatitude, offer.routes[i].endLongitude));
          }

          this.osrmService
            .getRoute(locations)
            .then((route) => {
              // Calculate duration of the ride and estimated arrival time
              let duration = 0;
              route.routes.forEach((element) => {
                duration += element.duration;
              });

              let estimatedArrival = new Date(new Date(offer.routes[0].departure).getTime() + duration * 1000);

              if (
                new Date(offer.routes[0].departure).getTime() < new Date().getTime() &&
                new Date().getTime() < estimatedArrival.getTime()
              ) {
                this.destinations.forEach((marker) => {
                  this.map.removeLayer(marker);
                });

                for (var i = 0; i < locations.length; i++) {
                  let pin;
                  if (i == 0) {
                    pin = greenPin;
                  } else if (i == locations.length - 1) {
                    pin = redPin;
                  } else {
                    pin = bluePin;
                  }

                  this.destinations.push(L.marker([locations[i].latitude, locations[i].longitude], { icon: pin }).addTo(this.map));
                }

                // Show route if the ride is currently being performed
                if (!this.route) {
                  this.route = L.Routing.control({
                    waypoints: waypoints,
                    lineOptions: {
                      addWaypoints: false,
                    },
                    createMarker: function () {
                      return null;
                    },
                  }).addTo(this.map);
                }

                // Get estimated time and distance to end location
                this.osrmService
                  .getRoute([
                    {
                      latitude: this.location.latitude,
                      longitude: this.location.longitude,
                    },
                    {
                      latitude: locations[locations.length - 1].latitude,
                      longitude: locations[locations.length - 1].longitude,
                    },
                  ])
                  .then((route) => {
                    // Retrieve remaining duration and distance
                    let duration = 0;
                    let distance = 0;
                    route.routes.forEach((element) => {
                      duration += element.duration;
                      distance += element.distance;
                    });

                    this.ride = {
                      estimatedArrival: new Date(new Date().getTime() + duration * 1000),
                      distance: distance,
                    };
                  })
                  .catch((error) => {
                    this.errorService.onGetError.emit({ message: "Časa potovanja ni mogoče pridobiti.", type: "danger" });
                  });
              } else {
                this.getDestinations();
              }
            })
            .catch((error) => {
              this.errorService.onGetError.emit({ message: "Časa potovanja ni mogoče pridobiti.", type: "danger" });
            });
        } else {
          this.getDestinations();
        }
      })
      .catch((error) => {
        this.errorService.onGetError.emit({ message: error, type: "danger" });
      });
  }

  getDestinations(): void {
    var bluePin = L.icon({
      iconUrl: "/assets/images/pin_blue.svg",
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30],
    });

    // Remove route if shown
    if (this.route) {
      this.map.removeControl(this.route);
      this.route = null;
    }

    // Get available destinations for the upcoming week
    this.destinationsService
      .getDestinations(this.location)
      .then((destinations) => {
        // Add destination markers
        this.destinations.forEach((marker) => {
          this.map.removeLayer(marker);
        });

        destinations.forEach((destination) => {
          let marker = L.marker([destination.endLatitude, destination.endLongitude], { icon: bluePin });
          marker.addTo(this.map).on(
            "click",
            this.getAddress.bind(this, {
              end: destination.end,
              endLatitude: destination.endLatitude,
              endLongitude: destination.endLongitude,
            })
          );

          this.destinations.push(marker);
        });
      })
      .catch((error) => {
        this.errorService.onGetError.emit({ message: error, type: "danger" });
      });
  }

  getAddress(end: any): void {
    this.stopShareLocation();

    this.nominatimService
      .getAddress(this.location)
      .then((address) => {
        let search = {
          start: address.display_name,
          startLatitude: this.location.latitude,
          startLongitude: this.location.longitude,
          end: end.end,
          endLatitude: end.endLatitude,
          endLongitude: end.endLongitude,
          date: null,
          day: null,
          month: null,
          year: null,
          hours: null,
          minutes: null,
          passengers: null,
          baggage: null,
        };

        this.ridesService.saveSearch(search);
        this.router.navigateByUrl("/search");
      })
      .catch((error) => {
        this.errorService.onGetError.emit({ message: "Naslova za tvojo lokacijo ni možno pridobiti.", type: "danger" });
      });
  }

  ngOnInit(): void {
    this.initializeMap();
    this.shareLocation();
  }

  ngOnDestroy(): void {
    this.stopShareLocation();
  }
}
