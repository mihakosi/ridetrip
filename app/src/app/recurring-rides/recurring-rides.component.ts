import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { RidesService } from "../rides.service";
import { RecurringService } from "../recurring.service";

@Component({
  selector: "app-recurring-rides",
  templateUrl: "./recurring-rides.component.html",
  styleUrls: ["./recurring-rides.component.css"],
})
export class RecurringRidesComponent implements OnInit {
  constructor(private router: Router, private ridesService: RidesService, private recurringService: RecurringService) {}

  public days: any[];

  public error = {
    type: "",
    message: "",
  };

  searchRides(date, ride): void {
    let search = {
      start: ride.start,
      startSimple: ride.startSimple,
      startLatitude: ride.startLatitude,
      startLongitude: ride.startLongitude,
      end: ride.end,
      endSimple: ride.endSimple,
      endLatitude: ride.endLatitude,
      endLongitude: ride.endLongitude,
      date: new Date(date.getFullYear(), date.getMonth(), date.getDate(), ride.departure.split(":")[0], ride.departure.split(":")[1]),
      day: date.getDate(),
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      hours: ride.departure.split(":")[0],
      minutes: ride.departure.split(":")[1],
      passengers: ride.passengers,
      baggage: ride.baggage,
    };

    this.ridesService.saveSearch(search);
    this.router.navigateByUrl("/rides");
  }

  ngOnInit(): void {
    this.recurringService
      .getRecurringRides()
      .then((recurring) => {
        this.days = [];

        if (recurring.length > 0) {
          for (var i = 0; i < 7; i++) {
            let date = new Date(new Date().setDate(new Date().getDate() + i));
            let dayOfWeek = date.getDay();

            this.days.push({
              date: date,
              rides: [],
            });

            switch (dayOfWeek) {
              case 0:
                this.days[i].dayOfWeek = "Nedelja";
                break;
              case 1:
                this.days[i].dayOfWeek = "Ponedeljek";
                break;
              case 2:
                this.days[i].dayOfWeek = "Torek";
                break;
              case 3:
                this.days[i].dayOfWeek = "Sreda";
                break;
              case 4:
                this.days[i].dayOfWeek = "Četrtek";
                break;
              case 5:
                this.days[i].dayOfWeek = "Petek";
                break;
              case 6:
                this.days[i].dayOfWeek = "Sobota";
                break;
            }

            recurring.forEach((ride) => {
              if (
                (dayOfWeek == 0 && ride.sundays) ||
                (dayOfWeek == 1 && ride.mondays) ||
                (dayOfWeek == 2 && ride.tuesdays) ||
                (dayOfWeek == 3 && ride.wednesdays) ||
                (dayOfWeek == 4 && ride.thursdays) ||
                (dayOfWeek == 5 && ride.fridays) ||
                (dayOfWeek == 6 && ride.saturdays)
              ) {
                this.days[i].rides.push(ride);
              }
            });
          }
        }
      })
      .catch((error) => {
        this.error.type = "data";
        this.error.message = error;
      });
  }
}
