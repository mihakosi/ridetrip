import { Inject, Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";

import { BROWSER_STORAGE } from "./storage";

import { environment } from "../environments/environment";

@Injectable({
  providedIn: "root",
})
export class OffersService {
  constructor(@Inject(BROWSER_STORAGE) private storage: Storage, private http: HttpClient) {}

  private apiUrl = environment.apiUrl;

  public getOffers(past: boolean): Promise<any[]> {
    const url: string = `${this.apiUrl}/offers?past=${past}`;
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

  public getOffer(id: number): Promise<any> {
    const url: string = `${this.apiUrl}/offers/${id}`;
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

  public createOffer(offer: any): Promise<any> {
    const url: string = `${this.apiUrl}/offers`;
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

  public cancelOffer(offer: any): Promise<any> {
    const url: string = `${this.apiUrl}/offers/${offer.id}/cancel`;
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

  public getLatestOffer(): Promise<any> {
    const url: string = `${this.apiUrl}/offers/latest`;
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

  public getLocation(offer: any): Promise<any> {
    const url: string = `${this.apiUrl}/offers/${offer.id}/location`;
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

  public shareLocation(offer: any, location: any): Promise<any> {
    const url: string = `${this.apiUrl}/offers/${offer.id}/location`;
    const httpHeaders = {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.storage.getItem("token")}`,
      }),
    };

    return this.http
      .put(url, location, httpHeaders)
      .toPromise()
      .then((result) => result as any)
      .catch(this.handleError);
  }

  public getPassengers(offer: any): Promise<any> {
    const url: string = `${this.apiUrl}/offers/${offer.id}/passengers`;
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

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.error.message || "Podatkov ni mogoče pridobiti.");
  }
}
