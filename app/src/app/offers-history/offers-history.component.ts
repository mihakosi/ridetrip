import { Component, OnInit } from "@angular/core";

import { OffersService } from "../offers.service";

@Component({
  selector: "app-offers-history",
  templateUrl: "./offers-history.component.html",
  styleUrls: ["./offers-history.component.css"],
})
export class OffersHistoryComponent implements OnInit {
  constructor(private offersService: OffersService) {}

  public offers: any[];

  public error = {
    type: "",
    message: "",
  };

  ngOnInit(): void {
    this.offersService
      .getOffers(true)
      .then((offers) => {
        this.offers = offers;
      })
      .catch((error) => {
        this.error.type = "data";
        this.error.message = error;
      });
  }
}
