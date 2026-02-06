import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConsoleToggleService {

  constructor() {

  }

  disableConsoleInProduction(): void {
    console.warn(`🚨 Console output is disabled!`);
    console.log = function (): void { };
    console.debug = function (): void { };
    console.warn = function (): void { };
    console.info = function (): void { };
  }
}
