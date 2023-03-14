import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { ErrorService } from "../error.service";
import { AuthenticationService } from "../authentication.service";

@Component({
  selector: "app-layout",
  templateUrl: "./layout.component.html",
  styleUrls: ["./layout.component.css"],
})
export class LayoutComponent implements OnInit {
  constructor(private router: Router, private errorService: ErrorService, private authenticationService: AuthenticationService) {
    this.errorService.onGetError.subscribe((error) => {
      this.error.message = error.message;
      this.error.type = error.type;

      setTimeout(() => {
        this.error.message = "";
        this.error.type = "";
      }, 3000);
    });
  }

  public error = {
    message: "",
    type: "",
  };

  public user = {
    firstName: "",
    lastName: "",
  };

  isSignedIn(): boolean {
    return this.authenticationService.isSignedIn();
  }

  getUser(): any {
    return this.authenticationService.returnUser();
  }

  signOut(): void {
    this.authenticationService.signOut();
    this.router.navigateByUrl("/");
  }

  toggleNavigation(e): void {
    let element = e.currentTarget;

    if (
      e.target.className.includes("navbar-toggler") ||
      e.target.className.includes("navbar-overlay") ||
      e.target.tagName.toLowerCase() == "a"
    ) {
      if (element.hasAttribute("data-target")) {
        let target = element.getAttribute("data-target");
        let targetElement = document.querySelector(target);

        if (targetElement.className.includes("open")) {
          targetElement.className = "navbar-overlay navbar-collapse";
        } else {
          targetElement.className = "navbar-overlay navbar-collapse open";
        }
      }
    }
  }

  ngOnInit(): void {
    this.getUser();
  }
}
