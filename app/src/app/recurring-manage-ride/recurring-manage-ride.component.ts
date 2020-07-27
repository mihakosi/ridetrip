import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { switchMap } from "rxjs/operators";

import { ErrorService } from "../error.service";
import { RecurringService } from "../recurring.service";
import { NominatimService } from "../nominatim.service";

@Component({
  selector: "app-manage-recurring-ride",
  templateUrl: "./recurring-manage-ride.component.html",
  styleUrls: ["./recurring-manage-ride.component.css"],
})
export class RecurringManageRideComponent implements OnInit {
  constructor(
    private router: Router,
    private errorService: ErrorService,
    private recurringService: RecurringService,
    private nominatimService: NominatimService,
    private path: ActivatedRoute
  ) {}

  public date: Date = new Date();

  public hours: string[] = [];

  public minutes: string[] = [];

  public startSearch = {
    loading: false,
    message: "",
  };

  public endSearch = {
    loading: false,
    message: "",
  };

  public error = {
    type: "",
    message: "",
  };

  public ride: any;

  getSearch(event): void {
    let type = event.target.getAttribute("data-type");

    if (type === "start") {
      this.startSearch.loading = true;
      this.startSearch.message = "";
    } else {
      this.endSearch.loading = true;
      this.endSearch.message = "";
    }

    this.nominatimService
      .getSearch(event.target.value)
      .then((results) => {
        this.setLocation(results, type);
      })
      .catch((error) => {
        if (type === "start") {
          this.startSearch.loading = false;
          this.startSearch.message = "Napaka pri iskanju lokacije.";
        } else {
          this.endSearch.loading = false;
          this.endSearch.message = "Napaka pri iskanju lokacije.";
        }
      });
  }

  setLocation(results, type): void {
    if (type === "start") {
      if (results.length > 0) {
        this.startSearch.loading = false;

        this.ride.start = results[0].display_name;
        this.ride.startSimple =
          results[0].address.city || results[0].address.town || results[0].address.village || results[0].address.municipality;
        this.ride.startLatitude = results[0].lat;
        this.ride.startLongitude = results[0].lon;
      } else {
        this.startSearch.loading = false;
        this.startSearch.message = "Lokacije ni mogoče najti.";

        this.ride.start = "";
        this.ride.startSimple = "";
        this.ride.startLatitude = null;
        this.ride.startLongitude = null;
      }
    } else {
      if (results.length > 0) {
        this.endSearch.loading = false;

        this.ride.end = results[0].display_name;
        this.ride.endSimple =
          results[0].address.city || results[0].address.town || results[0].address.village || results[0].address.municipality;
        this.ride.endLatitude = results[0].lat;
        this.ride.endLongitude = results[0].lon;
      } else {
        this.endSearch.loading = false;
        this.endSearch.message = "Lokacije ni mogoče najti.";

        this.ride.end = "";
        this.ride.endSimple = "";
        this.ride.endLatitude = null;
        this.ride.endLongitude = null;
      }
    }
  }

  updateRecurringRide(): void {
    this.error.type = "loading";
    this.error.message = "";

    let ride = {
      id: this.ride.id,
      passengers: this.ride.passengers,
      baggage: this.ride.baggage,
      start: this.ride.start,
      startSimple: this.ride.startSimple,
      startLatitude: this.ride.startLatitude,
      startLongitude: this.ride.startLongitude,
      end: this.ride.end,
      endSimple: this.ride.endSimple,
      endLatitude: this.ride.endLatitude,
      endLongitude: this.ride.endLongitude,
      mondays: this.ride.mondays,
      tuesdays: this.ride.tuesdays,
      wednesdays: this.ride.wednesdays,
      thursdays: this.ride.thursdays,
      fridays: this.ride.fridays,
      saturdays: this.ride.saturdays,
      sundays: this.ride.sundays,
      hours: this.ride.hours,
      minutes: this.ride.minutes,
    };

    this.recurringService
      .updateRecurringRide(ride)
      .then((ride) => {
        this.errorService.onGetError.emit({ message: "Ponavljajoči prevoz uspešno posodobljen.", type: "success" });
        this.router.navigateByUrl("/recurring/manage/rides");
      })
      .catch((error) => {
        this.error.type = "danger";
        this.error.message = error;
      });
  }

  deleteRecurringRide(): void {
    this.error.type = "loading";
    this.error.message = "";

    this.recurringService
      .deleteRecurringRide(this.ride.id)
      .then(() => {
        this.errorService.onGetError.emit({ message: "Ponavljajoči prevoz uspešno izbrisan.", type: "success" });
        this.router.navigateByUrl("/recurring/manage/rides");
      })
      .catch((error) => {
        this.error.type = "danger";
        this.error.message = error;
      });
  }

  ngOnInit(): void {
    // Generate hours
    for (var i = 0; i <= 23; i++) {
      if (i < 10) {
        this.hours.push("0" + i.toString());
      } else {
        this.hours.push(i.toString());
      }
    }

    // Generate minutes
    for (var i = 0; i <= 59; i++) {
      if (i < 10) {
        this.minutes.push("0" + i.toString());
      } else {
        this.minutes.push(i.toString());
      }
    }

    this.path.paramMap
      .pipe(
        switchMap((params: ParamMap) => {
          let id = params.get("id");
          return this.recurringService.getRecurringRide(parseInt(id));
        })
      )
      .subscribe(
        (ride: any) => {
          ride.hours = ride.departure.split(":")[0];
          ride.minutes = ride.departure.split(":")[1];

          this.ride = ride;
        },
        (error) => {
          this.error.type = "data";
          this.error.message = error;
        }
      );
  }
}
