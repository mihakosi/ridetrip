import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class OsrmService {
  constructor(private http: HttpClient) {}

  private apiUrl = "https://teaching.lavbic.net/api/OSRM/route/v1/driving";

  public getRoute(locations: any[]): Promise<any> {
    let coordinates = "";
    for (var i = 0; i < locations.length; i++) {
      coordinates += i != 0 ? ";" : "";
      coordinates += locations[i].longitude + "," + locations[i].latitude;
    }

    const url: string = `${this.apiUrl}/${coordinates}?overview=simplified&alternatives=false&steps=false`;

    return this.http
      .get(url)
      .toPromise()
      .then((result) => result as any)
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.error.message || "Podatkov ni mogoče pridobiti.");
  }
}
