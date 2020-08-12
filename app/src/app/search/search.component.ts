import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { RidesService } from "../rides.service";
import { NominatimService } from "../nominatim.service";

@Component({
  selector: "app-search",
  templateUrl: "./search.component.html",
  styleUrls: ["./search.component.css"],
})
export class SearchComponent implements OnInit {
  constructor(private router: Router, private ridesService: RidesService, private nominatimService: NominatimService) {}

  public rides: any[];

  public search: any;

  public date: Date = new Date();

  public days: string[] = [];

  public months: string[] = [];

  public years: string[] = [];

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

  public isMobile: boolean = false;

  searchRides(): void {
    if (!this.isMobile) {
      this.search.date = new Date(this.search.year, this.search.month - 1, this.search.day, this.search.hours, this.search.minutes);
    }

    if (!this.search.startLatitude || !this.search.startLongitude) {
      this.error.type = "danger";
      this.error.message = "Prosimo, izberi začetno lokacijo.";
    } else if (!this.search.endLatitude || !this.search.endLongitude) {
      this.error.type = "danger";
      this.error.message = "Prosimo, izberi končno lokacijo.";
    } else if (!this.search.date) {
      this.error.type = "danger";
      this.error.message = "Prosimo, izberi datum prevoza.";
    } else if (!this.search.passengers) {
      this.error.type = "danger";
      this.error.message = "Prosimo, vnesi število potnikov.";
    } else {
      this.error.type = "";
      this.error.message = "";

      this.ridesService.saveSearch(this.search);
      this.router.navigateByUrl("/rides");
    }
  }

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

        this.search.start = results[0].display_name;
        this.search.startLatitude = results[0].lat;
        this.search.startLongitude = results[0].lon;
      } else {
        this.startSearch.loading = false;
        this.startSearch.message = "Lokacije ni mogoče najti.";

        this.search.start = "";
        this.search.startLatitude = null;
        this.search.startLongitude = null;
      }
    } else {
      if (results.length > 0) {
        this.endSearch.loading = false;

        this.search.end = results[0].display_name;
        this.search.endLatitude = results[0].lat;
        this.search.endLongitude = results[0].lon;
      } else {
        this.endSearch.loading = false;
        this.endSearch.message = "Lokacije ni mogoče najti.";

        this.search.end = "";
        this.search.endLatitude = null;
        this.search.endLongitude = null;
      }
    }
  }

  ngOnInit(): void {
    // Detect mobile devices
    var userAgent = navigator.userAgent || navigator.vendor;
    if (/windows phone/i.test(userAgent) || /android/i.test(userAgent) || (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream)) {
      this.isMobile = true;
    }

    // Generate days
    for (var i = 1; i <= 31; i++) {
      this.days.push(i.toString());
    }

    // Generate months
    for (var i = 1; i <= 12; i++) {
      this.months.push(i.toString());
    }

    // Generate years
    for (var i = this.date.getFullYear(); i <= 3000; i++) {
      this.years.push(i.toString());
    }

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

    this.search = this.ridesService.getSearch();

    if (!this.search.date) {
      this.search.day = null;
      this.search.month = null;
      this.search.year = null;
      this.search.hours = null;
      this.search.minutes = null;
    }
  }
}
