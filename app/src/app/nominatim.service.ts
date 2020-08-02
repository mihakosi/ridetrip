import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class NominatimService {
  constructor(private http: HttpClient) {}

  private apiUrl = "https://nominatim.openstreetmap.org";

  public getSearch(search: string): Promise<any[]> {
    const url: string = `${this.apiUrl}/search?q=${search}&format=json&addressdetails=1&accept-language=sl`;

    return this.http
      .get(url)
      .toPromise()
      .then((result) => result as any[])
      .catch(this.handleError);
  }

  public getAddress(location: any): Promise<any> {
    const url: string = `${this.apiUrl}/reverse?lat=${location.latitude}&lon=${location.longitude}&format=json&accept-language=sl`;

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
