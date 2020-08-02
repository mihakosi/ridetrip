import { Component, OnInit, OnDestroy } from "@angular/core";
import L from "leaflet";
import "leaflet-routing-machine";
import { Router } from "@angular/router";

import { ErrorService } from "../error.service";
import { OsrmService } from "../osrm.service";
import { RidesService } from "../rides.service";
import { NominatimService } from "../nominatim.service";
import { ReservationsService } from "../reservations.service";
import { DestinationsService } from "../destinations.service";

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
    private nominatimService: NominatimService,
    private reservationsService: ReservationsService,
    private destinationsService: DestinationsService
  ) {}

  destinations: any[] = [];

  location: any;

  map: any;

  watchPosition: any;

  userMarker: any;

  initializeMap(): void {
    this.map = L.map("map", { zoomControl: false }).setView([46.188, 15.079], 7);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);
  }

  shareLocation(): void {
    var bluePin = L.icon({
      iconUrl: "/assets/images/pin_blue.svg",
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30],
    });

    // Icon created by Twitter
    var driverPin = L.icon({
      iconUrl: "/assets/images/passenger.svg",
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });

    this.watchPosition = navigator.geolocation.watchPosition(
      (position) => {
        this.location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        // Get available destinations for the upcoming week
        this.destinationsService
          .getDestinations(this.location)
          .then((destinations) => {
            // Add user marker
            if (this.userMarker) {
              this.map.removeLayer(this.userMarker);
            }

            this.userMarker = L.marker([this.location.latitude, this.location.longitude], { icon: driverPin });
            this.userMarker.addTo(this.map);

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

        // Get active reservation
        this.reservationsService
          .getLatestReservation()
          .then((reservation) => {
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
                  // Show route if the ride is currently being performed
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
              })
              .catch((error) => {
                this.errorService.onGetError.emit({ message: "Časa potovanja ni mogoče pridobiti.", type: "danger" });
              });
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
    if (this.watchPosition) {
      navigator.geolocation.clearWatch(this.watchPosition);
    }
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
