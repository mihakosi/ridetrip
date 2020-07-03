import { InjectionToken } from "@angular/core";

export const BROWSER_STORAGE = new InjectionToken<Storage>("Browser Storage", {
  providedIn: "root",
  factory: () => localStorage,
});

export const SESSION_STORAGE = new InjectionToken<Storage>("Browser Storage", {
  providedIn: "root",
  factory: () => sessionStorage,
});
