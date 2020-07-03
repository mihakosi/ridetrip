import { Injectable, EventEmitter } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class ErrorService {
  constructor() {}

  onGetError: EventEmitter<any> = new EventEmitter<any>();
}
