import { Inject, Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";

import { BROWSER_STORAGE } from "./storage";

import { environment } from "../environments/environment";

@Injectable({
  providedIn: "root",
})
export class RecurringService {
  constructor(@Inject(BROWSER_STORAGE) private storage: Storage, private http: HttpClient) {}

  private apiUrl = environment.apiUrl;

  public getRecurringRides(): Promise<any[]> {
    const url: string = `${this.apiUrl}/recurring/rides`;
    const httpHeaders = {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.storage.getItem("token")}`,
      }),
    };

    return this.http
      .get(url, httpHeaders)
      .toPromise()
      .then((result) => result as any[])
      .catch(this.handleError);
  }

  public getRecurringRide(id: number): Promise<any> {
    const url: string = `${this.apiUrl}/recurring/rides/${id}`;
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

  public createRecurringRide(ride: any): Promise<any> {
    const url: string = `${this.apiUrl}/recurring/rides`;
    const httpHeaders = {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.storage.getItem("token")}`,
      }),
    };

    return this.http
      .post(url, ride, httpHeaders)
      .toPromise()
      .then((result) => result as any)
      .catch(this.handleError);
  }

  public updateRecurringRide(ride: any): Promise<any> {
    const url: string = `${this.apiUrl}/recurring/rides/${ride.id}`;
    const httpHeaders = {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.storage.getItem("token")}`,
      }),
    };

    return this.http
      .put(url, ride, httpHeaders)
      .toPromise()
      .then((result) => result as any)
      .catch(this.handleError);
  }

  public deleteRecurringRide(id: number): Promise<any> {
    const url: string = `${this.apiUrl}/recurring/rides/${id}`;
    const httpHeaders = {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.storage.getItem("token")}`,
      }),
    };

    return this.http
      .delete(url, httpHeaders)
      .toPromise()
      .then((result) => result as any)
      .catch(this.handleError);
  }

  public getRecurringOffers(): Promise<any[]> {
    const url: string = `${this.apiUrl}/recurring/offers`;
    const httpHeaders = {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.storage.getItem("token")}`,
      }),
    };

    return this.http
      .get(url, httpHeaders)
      .toPromise()
      .then((result) => result as any[])
      .catch(this.handleError);
  }

  public getRecurringOffer(id: number): Promise<any> {
    const url: string = `${this.apiUrl}/recurring/offers/${id}`;
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

  public createRecurringOffer(offer: any): Promise<any> {
    const url: string = `${this.apiUrl}/recurring/offers`;
    const httpHeaders = {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.storage.getItem("token")}`,
      }),
    };

    return this.http
      .post(url, offer, httpHeaders)
      .toPromise()
      .then((result) => result as any)
      .catch(this.handleError);
  }

  public updateRecurringOffer(offer: any): Promise<any> {
    const url: string = `${this.apiUrl}/recurring/offers/${offer.id}`;
    const httpHeaders = {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.storage.getItem("token")}`,
      }),
    };

    return this.http
      .put(url, offer, httpHeaders)
      .toPromise()
      .then((result) => result as any)
      .catch(this.handleError);
  }

  public deleteRecurringOffer(id: number): Promise<any> {
    const url: string = `${this.apiUrl}/recurring/offers/${id}`;
    const httpHeaders = {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.storage.getItem("token")}`,
      }),
    };

    return this.http
      .delete(url, httpHeaders)
      .toPromise()
      .then((result) => result as any)
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.error.message || "Podatkov ni mogoče pridobiti.");
  }
}
