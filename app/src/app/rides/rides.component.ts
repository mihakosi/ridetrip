import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import L from "leaflet";
import "leaflet-routing-machine";

import { RidesService } from "../rides.service";

@Component({
  selector: "app-rides",
  templateUrl: "./rides.component.html",
  styleUrls: ["./rides.component.css"],
})
export class RidesComponent implements OnInit {
  constructor(private ridesService: RidesService, private path: ActivatedRoute) {}

  public rides: any[];

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

    L.marker([this.search.startLatitude, this.search.startLongitude], { icon: redPin }).addTo(map);
    L.marker([this.search.endLatitude, this.search.endLongitude], { icon: greenPin }).addTo(map);

    // Routing
    L.Routing.control({
      waypoints: [
        L.latLng(this.search.startLatitude, this.search.startLongitude),
        L.latLng(this.search.endLatitude, this.search.endLongitude),
      ],
      lineOptions: {
        addWaypoints: false,
      },
      createMarker: function () {
        return null;
      },
    }).addTo(map);
  }

  getRides(): void {
    this.ridesService
      .getRides(this.search)
      .then((rides) => {
        this.rides = rides;
        this.initializeMap();
      })
      .catch((error) => {
        this.error.type = "data";
        this.error.message = error;
      });
  }

  ngOnInit(): void {
    this.search = this.ridesService.getSearch();
    if (!this.search.startLatitude || !this.search.startLongitude) {
      this.error.type = "data";
      this.error.message = "Prosimo, izberi začetno lokacijo.";
    } else if (!this.search.endLatitude || !this.search.endLongitude) {
      this.error.type = "data";
      this.error.message = "Prosimo, izberi končno lokacijo.";
    } else if (!this.search.date) {
      this.error.type = "data";
      this.error.message = "Prosimo, izberi datum prevoza.";
    } else if (!this.search.passengers) {
      this.error.type = "data";
      this.error.message = "Prosimo, vnesi število potnikov.";
    } else {
      this.getRides();
    }
  }
}
