import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { switchMap } from "rxjs/operators";
import L from "leaflet";
import "leaflet-routing-machine";

import { OffersService } from "../offers.service";

@Component({
  selector: "app-offer",
  templateUrl: "./offer.component.html",
  styleUrls: ["./offer.component.css"],
})
export class OfferComponent implements OnInit {
  constructor(private offersService: OffersService, private path: ActivatedRoute) {}

  public offer: any;

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

    L.marker([this.offer.routes[0].startLatitude, this.offer.routes[0].startLongitude], { icon: redPin }).addTo(map);
    waypoints.push(L.latLng(this.offer.routes[0].startLatitude, this.offer.routes[0].startLongitude));

    for (var i = 1; i < this.offer.routes.length; i++) {
      L.marker([this.offer.routes[i].startLatitude, this.offer.routes[i].startLongitude], { icon: bluePin }).addTo(map);
      waypoints.push(L.latLng(this.offer.routes[i].startLatitude, this.offer.routes[i].startLongitude));
    }

    L.marker([this.offer.routes[this.offer.routes.length - 1].endLatitude, this.offer.routes[this.offer.routes.length - 1].endLongitude], {
      icon: greenPin,
    }).addTo(map);
    waypoints.push(
      L.latLng(this.offer.routes[this.offer.routes.length - 1].endLatitude, this.offer.routes[this.offer.routes.length - 1].endLongitude)
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
        },
        (error) => {
          this.error.type = "data";
          this.error.message = error;
        }
      );
  }
}
