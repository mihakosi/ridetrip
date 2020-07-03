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

  searchRides(): void {
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
    this.search = this.ridesService.getSearch();
  }
}
