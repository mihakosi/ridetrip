import { Component, OnInit } from "@angular/core";

import { ErrorService } from "../error.service";
import { OffersService } from "../offers.service";
import { RecurringService } from "../recurring.service";

@Component({
  selector: "app-recurring-offers",
  templateUrl: "./recurring-offers.component.html",
  styleUrls: ["./recurring-offers.component.css"],
})
export class RecurringOffersComponent implements OnInit {
  constructor(private errorService: ErrorService, private offersService: OffersService, private recurringService: RecurringService) {}

  public days: any[];

  public error = {
    type: "",
    message: "",
  };

  createOffer(date, offer): void {
    this.error.type = "loading";
    this.error.message = "";

    let routes = [
      {
        start: offer.start,
        startSimple: offer.startSimple,
        startLatitude: offer.startLatitude,
        startLongitude: offer.startLongitude,
        end: offer.end,
        endSimple: offer.endSimple,
        endLatitude: offer.endLatitude,
        endLongitude: offer.endLongitude,
        departure: new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          offer.departure.split(":")[0],
          offer.departure.split(":")[1]
        ),
        price: offer.price,
      },
    ];

    this.offersService
      .createOffer({
        passengers: offer.passengers,
        baggage: offer.baggage,
        vehicle: offer.vehicleId,
        recurring: offer.id,
        description: offer.description || "",
        routes: routes,
      })
      .then((offer) => {
        this.errorService.onGetError.emit({ message: "Prevoz uspešno dodan.", type: "success" });
        this.getRecurring();
      })
      .catch((error) => {
        this.errorService.onGetError.emit({ message: error, type: "danger" });
      });
  }

  getRecurring(): void {
    this.offersService
      .getOffers(false)
      .then((offers) => {
        this.recurringService
          .getRecurringOffers()
          .then((recurrings) => {
            this.days = [];

            if (recurrings.length > 0) {
              for (var i = 0; i < 7; i++) {
                let date = new Date(new Date().setDate(new Date().getDate() + i));
                let dayOfWeek = date.getDay();

                this.days.push({
                  date: date,
                  offers: [],
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

                recurrings.forEach((recurring) => {
                  let exists = offers.some((offer) => {
                    return (
                      recurring.id == offer.recurringId &&
                      new Date(new Date(offer.routes[0].departure).setHours(0, 0, 0, 0)).getTime() ==
                        new Date(date.setHours(0, 0, 0, 0)).getTime()
                    );
                  });

                  if (
                    !exists &&
                    ((dayOfWeek == 0 && recurring.sundays) ||
                      (dayOfWeek == 1 && recurring.mondays) ||
                      (dayOfWeek == 2 && recurring.tuesdays) ||
                      (dayOfWeek == 3 && recurring.wednesdays) ||
                      (dayOfWeek == 4 && recurring.thursdays) ||
                      (dayOfWeek == 5 && recurring.fridays) ||
                      (dayOfWeek == 6 && recurring.saturdays))
                  ) {
                    this.days[i].offers.push(recurring);
                  }
                });
              }
            }

            let notEmpty = this.days.some((day) => {
              return day.offers.length != 0;
            });

            if (!notEmpty) {
              this.error.type = "empty";
              this.error.message = "Na voljo ni ponavljajočih prevozov.";
            }
          })
          .catch((error) => {
            this.error.type = "data";
            this.error.message = error;
          });
      })
      .catch((error) => {
        this.error.type = "data";
        this.error.message = error;
      });
  }

  ngOnInit(): void {
    this.getRecurring();
  }
}
