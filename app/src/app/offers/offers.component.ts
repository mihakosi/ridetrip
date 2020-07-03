import { Component, OnInit } from "@angular/core";

import { OffersService } from "../offers.service";

@Component({
  selector: "app-offers",
  templateUrl: "./offers.component.html",
  styleUrls: ["./offers.component.css"],
})
export class OffersComponent implements OnInit {
  constructor(private offersService: OffersService) {}

  public offers: any[];

  public error = {
    type: "",
    message: "",
  };

  ngOnInit(): void {
    this.offersService
      .getOffers(false)
      .then((offers) => {
        this.offers = offers;
      })
      .catch((error) => {
        this.error.type = "data";
        this.error.message = error;
      });
  }
}
