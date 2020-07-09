import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { switchMap } from "rxjs/operators";

import { ErrorService } from "../error.service";
import { VehiclesService } from "../vehicles.service";

@Component({
  selector: "app-vehicle",
  templateUrl: "./vehicle.component.html",
  styleUrls: ["./vehicle.component.css"],
})
export class VehicleComponent implements OnInit {
  constructor(
    private router: Router,
    private errorService: ErrorService,
    private vehiclesService: VehiclesService,
    private path: ActivatedRoute
  ) {}

  public vehicle: any;

  public error = {
    type: "",
    message: "",
  };

  updateVehicle(): void {
    this.error.type = "loading";
    this.error.message = "";

    this.vehiclesService
      .updateVehicle(this.vehicle)
      .then((vehicle) => {
        this.errorService.onGetError.emit({ message: "Vozilo uspešno posodobljeno.", type: "success" });
        this.router.navigateByUrl("/vehicles");
      })
      .catch((error) => {
        this.error.type = "danger";
        this.error.message = error;
      });
  }

  ngOnInit(): void {
    this.path.paramMap
      .pipe(
        switchMap((params: ParamMap) => {
          let id = params.get("id");
          return this.vehiclesService.getVehicle(parseInt(id));
        })
      )
      .subscribe(
        (vehicle: any) => {
          this.vehicle = vehicle;
        },
        (error) => {
          this.error.type = "data";
          this.error.message = error;
        }
      );
  }
}
