import { Inject, Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";

import { BROWSER_STORAGE } from "./storage";

import { environment } from "../environments/environment";

@Injectable({
  providedIn: "root",
})
export class ReservationsService {
  constructor(@Inject(BROWSER_STORAGE) private storage: Storage, private http: HttpClient) {}

  private apiUrl = environment.apiUrl;

  public getReservations(past: boolean): Promise<any[]> {
    const url: string = `${this.apiUrl}/reservations?past=${past}`;
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

  public getReservation(id: number): Promise<any> {
    const url: string = `${this.apiUrl}/reservations/${id}`;
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

  public createReservation(reservation: any): Promise<any> {
    const url: string = `${this.apiUrl}/reservations`;
    const httpHeaders = {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.storage.getItem("token")}`,
      }),
    };

    return this.http
      .post(url, reservation, httpHeaders)
      .toPromise()
      .then((result) => result as any)
      .catch(this.handleError);
  }

  public cancelReservation(reservation: any): Promise<any> {
    const url: string = `${this.apiUrl}/reservations/${reservation.id}/cancel`;
    const httpHeaders = {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.storage.getItem("token")}`,
      }),
    };

    return this.http
      .put(url, reservation, httpHeaders)
      .toPromise()
      .then((result) => result as any)
      .catch(this.handleError);
  }

  public getLatestReservation(): Promise<any> {
    const url: string = `${this.apiUrl}/reservations/latest`;
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

  public getLocation(reservation: any): Promise<any> {
    const url: string = `${this.apiUrl}/reservations/${reservation.id}/location`;
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

  public shareLocation(reservation: any, location: any): Promise<any> {
    const url: string = `${this.apiUrl}/reservations/${reservation.id}/location`;
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

  public getDriver(reservation: any): Promise<any> {
    const url: string = `${this.apiUrl}/reservations/${reservation.id}/driver`;
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
