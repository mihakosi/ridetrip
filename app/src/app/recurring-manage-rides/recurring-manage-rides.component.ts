import { Component, OnInit } from "@angular/core";

import { RecurringService } from "../recurring.service";

@Component({
  selector: "app-manage-recurring-rides",
  templateUrl: "./recurring-manage-rides.component.html",
  styleUrls: ["./recurring-manage-rides.component.css"],
})
export class RecurringManageRidesComponent implements OnInit {
  constructor(private recurringService: RecurringService) {}

  public rides: any[];

  public error = {
    type: "",
    message: "",
  };

  ngOnInit(): void {
    this.recurringService
      .getRecurringRides()
      .then((rides) => {
        this.rides = rides;
      })
      .catch((error) => {
        this.error.type = "data";
        this.error.message = error;
      });
  }
}
