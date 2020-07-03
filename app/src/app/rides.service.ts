import { Inject, Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";

import { BROWSER_STORAGE, SESSION_STORAGE } from "./storage";

import { environment } from "../environments/environment";

@Injectable({
  providedIn: "root",
})
export class RidesService {
  constructor(
    @Inject(BROWSER_STORAGE) private storage: Storage,
    @Inject(SESSION_STORAGE) private session: Storage,
    private http: HttpClient
  ) {}

  private apiUrl = environment.apiUrl;

  public getRides(search: any): Promise<any[]> {
    const url: string = `${this.apiUrl}/rides?startLatitude=${search.startLatitude}&startLongitude=${search.startLongitude}&endLatitude=${search.endLatitude}&endLongitude=${search.endLongitude}&date=${search.date}&passengers=${search.passengers}&baggage=${search.baggage}`;
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

  public getRide(id: number, search: any): Promise<any> {
    const url: string = `${this.apiUrl}/rides/${id}?startLatitude=${search.startLatitude}&startLongitude=${search.startLongitude}&endLatitude=${search.endLatitude}&endLongitude=${search.endLongitude}&passengers=${search.passengers}&baggage=${search.baggage}`;
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

  public getSearch(): any {
    return JSON.parse(
      this.session.getItem("search")
        ? this.session.getItem("search")
        : `{"start": "", "startLatitude": 0.0, "startLongitude": 0.0, "end": "", "endLatitude": 0.0, "endLongitude": 0.0, "date": "", "passengers": 0, "baggage": 0}`
    );
  }

  public saveSearch(search: any): void {
    this.session.setItem("search", JSON.stringify(search));
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.error.message || "Podatkov ni mogoče pridobiti.");
  }
}
