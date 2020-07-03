import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { ErrorService } from "../error.service";
import { VehiclesService } from "../vehicles.service";

@Component({
  selector: "app-vehicles-new",
  templateUrl: "./vehicles-new.component.html",
  styleUrls: ["./vehicles-new.component.css"],
})
export class VehiclesNewComponent implements OnInit {
  constructor(private router: Router, private errorService: ErrorService, private vehiclesService: VehiclesService) {}

  public vehicle = {
    model: "",
    licencePlate: "",
    passengers: 0,
    baggage: 0,
  };

  public error = {
    type: "",
    message: "",
  };

  createVehicle(): void {
    this.error.type = "loading";
    this.error.message = "";

    this.vehiclesService
      .createVehicle(this.vehicle)
      .then((vehicle) => {
        this.errorService.onGetError.emit({ message: "Vozilo uspešno dodano.", type: "success" });
        this.router.navigateByUrl("/vehicles");
      })
      .catch((error) => {
        this.error.type = "danger";
        this.error.message = error;
      });
  }

  ngOnInit(): void {}
}
