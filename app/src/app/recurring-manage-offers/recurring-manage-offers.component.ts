import { Component, OnInit } from "@angular/core";

import { RecurringService } from "../recurring.service";

@Component({
  selector: "app-manage-recurring-offers",
  templateUrl: "./recurring-manage-offers.component.html",
  styleUrls: ["./recurring-manage-offers.component.css"],
})
export class RecurringManageOffersComponent implements OnInit {
  constructor(private recurringService: RecurringService) {}

  public offers: any[];

  public error = {
    type: "",
    message: "",
  };

  ngOnInit(): void {
    this.recurringService
      .getRecurringOffers()
      .then((offers) => {
        this.offers = offers;
      })
      .catch((error) => {
        this.error.type = "data";
        this.error.message = error;
      });
  }
}
