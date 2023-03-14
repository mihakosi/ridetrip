import { Inject, Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import * as jwt_decode from "jwt-decode";

import { AuthenticationResult } from "./authentication-result";
import { BROWSER_STORAGE } from "./storage";

import { environment } from "../environments/environment";

@Injectable({
  providedIn: "root",
})
export class AuthenticationService {
  constructor(@Inject(BROWSER_STORAGE) private storage: Storage, private http: HttpClient) {}

  private apiUrl = environment.apiUrl;

  public signIn(user: any): Promise<AuthenticationResult> {
    const url: string = `${this.apiUrl}/auth/signin`;
    return this.http
      .post(url, user)
      .toPromise()
      .then((result) => {
        this.saveJwt(result["jwt"]);
        return result as AuthenticationResult;
      })
      .catch(this.handleError);
  }

  public signUp(user: any): Promise<AuthenticationResult> {
    const url: string = `${this.apiUrl}/auth/signup`;
    return this.http
      .post(url, user)
      .toPromise()
      .then((result) => {
        this.saveJwt(result["jwt"]);
        return result as AuthenticationResult;
      })
      .catch(this.handleError);
  }

  public getUser(): Promise<any> {
    const url: string = `${this.apiUrl}/auth/user`;
    const httpHeaders = {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.storage.getItem("token")}`,
      }),
    };

    return this.http
      .get(url, httpHeaders)
      .toPromise()
      .then((result) => result as any)
      .catch(this.handleError);
  }

  public updateUser(user: any): Promise<AuthenticationResult> {
    const url: string = `${this.apiUrl}/auth/user`;
    const httpHeaders = {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.storage.getItem("token")}`,
      }),
    };

    return this.http
      .put(url, user, httpHeaders)
      .toPromise()
      .then((result) => {
        this.saveJwt(result["jwt"]);
        return result as AuthenticationResult;
      })
      .catch(this.handleError);
  }

  public updateUserImage(image: any): Promise<AuthenticationResult> {
    const url: string = `${this.apiUrl}/auth/user/image`;
    const httpHeaders = {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.storage.getItem("token")}`,
      }),
    };

    return this.http
      .put(url, image, httpHeaders)
      .toPromise()
      .then((result) => {
        this.saveJwt(result["jwt"]);
        return result as AuthenticationResult;
      })
      .catch(this.handleError);
  }

  public signOut(): void {
    this.storage.removeItem("token");
  }

  public isSignedIn(): boolean {
    const token: string = this.returnJwt();
    if (token) {
      const payload = jwt_decode(token);
      return payload.expires > Date.now();
    } else {
      return false;
    }
  }

  public returnUser(): any {
    if (this.isSignedIn()) {
      const token: string = this.returnJwt();
      const { firstName, lastName, email, image } = jwt_decode(token);
      return { firstName, lastName, email, image } as any;
    }
  }

  public returnJwt(): string {
    return this.storage.getItem("token");
  }

  public saveJwt(jwt: string): void {
    this.storage.setItem("token", jwt);
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.error.message || "Podatkov ni mogoče pridobiti.");
  }
}
