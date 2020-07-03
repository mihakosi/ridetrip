import { Component, OnInit } from "@angular/core";

import { ReservationsService } from "../reservations.service";

@Component({
  selector: "app-reservations",
  templateUrl: "./reservations.component.html",
  styleUrls: ["./reservations.component.css"],
})
export class ReservationsComponent implements OnInit {
  constructor(private reservationsService: ReservationsService) {}

  public reservations: any[];

  public error = {
    type: "",
    message: "",
  };

  ngOnInit(): void {
    this.reservationsService
      .getReservations(false)
      .then((reservations) => {
        this.reservations = reservations;
      })
      .catch((error) => {
        this.error.type = "data";
        this.error.message = error;
      });
  }
}
