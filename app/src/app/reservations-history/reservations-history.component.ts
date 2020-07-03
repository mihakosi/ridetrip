import { Component, OnInit } from "@angular/core";

import { ReservationsService } from "../reservations.service";

@Component({
  selector: "app-reservations-history",
  templateUrl: "./reservations-history.component.html",
  styleUrls: ["./reservations-history.component.css"],
})
export class ReservationsHistoryComponent implements OnInit {
  constructor(private reservationsService: ReservationsService) {}

  public reservations: any[];

  public error = {
    type: "",
    message: "",
  };

  ngOnInit(): void {
    this.reservationsService
      .getReservations(true)
      .then((reservations) => {
        this.reservations = reservations;
      })
      .catch((error) => {
        this.error.type = "data";
        this.error.message = error;
      });
  }
}
