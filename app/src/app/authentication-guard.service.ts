import { Injectable } from "@angular/core";
import { Router, CanActivate } from "@angular/router";

import { AuthenticationService } from "./authentication.service";

@Injectable({
  providedIn: "root",
})
export class AuthenticationGuardService implements CanActivate {
  constructor(public router: Router, public authenticationService: AuthenticationService) {}

  canActivate(): boolean {
    if (!this.authenticationService.isSignedIn()) {
      this.router.navigateByUrl("/signin");
      return false;
    }
    return true;
  }
}
