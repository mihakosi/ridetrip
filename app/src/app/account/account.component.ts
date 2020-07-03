import { Component, OnInit } from "@angular/core";

import { AuthenticationService } from "../authentication.service";

@Component({
  selector: "app-account",
  templateUrl: "./account.component.html",
  styleUrls: ["./account.component.css"],
})
export class AccountComponent implements OnInit {
  constructor(private authenticationService: AuthenticationService) {}

  public error = {
    type: "",
    message: "",
  };

  public user: any;

  updateUser(): void {
    this.error.type = "loading";
    this.error.message = "";

    this.authenticationService
      .updateUser(this.user)
      .then((result) => {
        this.error.type = "success";
        this.error.message = "Uporabniški račun uspešno posodobljen.";
      })
      .catch((error) => {
        this.error.type = "danger";
        this.error.message = error;
      });
  }

  ngOnInit(): void {
    this.authenticationService
      .getUser()
      .then((user) => {
        this.user = user;
      })
      .catch((error) => {
        this.error.type = "data";
        this.error.message = error;
      });
  }
}
