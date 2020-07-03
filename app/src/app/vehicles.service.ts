import { Inject, Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";

import { BROWSER_STORAGE } from "./storage";

import { environment } from "../environments/environment";

@Injectable({
  providedIn: "root",
})
export class VehiclesService {
  constructor(@Inject(BROWSER_STORAGE) private storage: Storage, private http: HttpClient) {}

  private apiUrl = environment.apiUrl;

  public getVehicles(): Promise<any[]> {
    const url: string = `${this.apiUrl}/vehicles`;
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

  public getVehicle(id: number): Promise<any> {
    const url: string = `${this.apiUrl}/vehicles/${id}`;
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

  public createVehicle(vehicle: any): Promise<any> {
    const url: string = `${this.apiUrl}/vehicles`;
    const httpHeaders = {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.storage.getItem("token")}`,
      }),
    };

    return this.http
      .post(url, vehicle, httpHeaders)
      .toPromise()
      .then((result) => result as any)
      .catch(this.handleError);
  }

  public updateVehicle(vehicle: any): Promise<any> {
    const url: string = `${this.apiUrl}/vehicles/${vehicle.id}`;
    const httpHeaders = {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.storage.getItem("token")}`,
      }),
    };

    return this.http
      .put(url, vehicle, httpHeaders)
      .toPromise()
      .then((result) => result as any)
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.error.message || "Podatkov ni mogoče pridobiti.");
  }
}
