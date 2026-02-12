import {Injectable, NgZone} from '@angular/core';
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class RoutingService {

  constructor(
    private router: Router,
    private ngZone: NgZone,
  ) { }

  navigateByUrl(url: string) {
    this.ngZone.run(() => {
      this.router.navigateByUrl(url)
        .then((success: boolean) => {
          if (success) {
            console.log('Navigation was successful');
          } else {
            console.log('Navigation has failed');
          }
        })
        .catch(error => {
          console.log('Navigation error: ', error.message);
        })
    })
  }

  navigate(url: string) {
    this.ngZone.run(() => {
      this.router.navigate([url])
        .then((success: boolean) => {
          if (success) {
            console.log('Navigation was successful');
          } else {
            console.log('Navigation has failed');
          }
        })
        .catch(error => {
          console.log('Navigation error: ', error.message);
        })
    })
  }

}