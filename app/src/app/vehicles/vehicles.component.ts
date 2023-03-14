import { Component, OnInit } from "@angular/core";

import { VehiclesService } from "../vehicles.service";

@Component({
  selector: "app-vehicles",
  templateUrl: "./vehicles.component.html",
  styleUrls: ["./vehicles.component.css"],
})
export class VehiclesComponent implements OnInit {
  constructor(private vehiclesService: VehiclesService) {}

  public vehicles: any[];

  public error = {
    type: "",
    message: "",
  };

  ngOnInit(): void {
    this.vehiclesService
      .getVehicles()
      .then((vehicles) => {
        this.vehicles = vehicles;
      })
      .catch((error) => {
        this.error.type = "data";
        this.error.message = error;
      });
  }
}
