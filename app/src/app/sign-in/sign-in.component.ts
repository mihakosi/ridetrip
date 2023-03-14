import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { AuthenticationService } from "../authentication.service";

@Component({
  selector: "app-sign-in",
  templateUrl: "./sign-in.component.html",
  styleUrls: ["./sign-in.component.css"],
})
export class SignInComponent implements OnInit {
  constructor(private router: Router, private authenticationService: AuthenticationService) {}

  public user = {
    email: "",
    password: "",
  };

  public error = {
    type: "",
    message: "",
  };

  public signIn(): void {
    this.error.type = "loading";
    this.error.message = "";

    this.authenticationService
      .signIn(this.user)
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
