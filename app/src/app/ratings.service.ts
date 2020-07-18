import { Inject, Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";

import { BROWSER_STORAGE } from "./storage";

import { environment } from "../environments/environment";

@Injectable({
  providedIn: "root",
})
export class RatingsService {
  constructor(@Inject(BROWSER_STORAGE) private storage: Storage, private http: HttpClient) {}

  private apiUrl = environment.apiUrl;

  public createRating(rating: any): Promise<any[]> {
    const url: string = `${this.apiUrl}/ratings`;
    const httpHeaders = {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.storage.getItem("token")}`,
      }),
    };

    return this.http
      .post(url, rating, httpHeaders)
      .toPromise()
      .then((result) => result as any[])
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.error.message || "Podatkov ni mogoče pridobiti.");
  }
}
