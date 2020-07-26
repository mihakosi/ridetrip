import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { AuthenticationService } from "../authentication.service";

@Component({
  selector: "app-sign-up",
  templateUrl: "./sign-up.component.html",
  styleUrls: ["./sign-up.component.css"],
})
export class SignUpComponent implements OnInit {
  constructor(private router: Router, private authenticationService: AuthenticationService) {}

  public user = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    image: "",
  };

  public error = {
    type: "",
    message: "",
  };

  public signUp(): void {
    this.error.type = "loading";
    this.error.message = "";

    this.authenticationService
      .signUp(this.user)
      .then(() => {
        this.error.type = "";
        this.error.message = "";

        this.router.navigateByUrl("/");
      })
      .catch((error) => {
        this.error.type = "danger";
        this.error.message = error;
      });
  }

  ngOnInit(): void {}
}
