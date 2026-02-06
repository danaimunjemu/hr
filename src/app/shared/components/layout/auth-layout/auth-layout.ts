import { Component } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: false,
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.scss',
})
export class AuthLayout {


  constructor(private router: Router) {}

  protected readonly date = new Date();

  navigate(path: string) {

  }

  navigateExt(path: string) {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      // Open external URLs directly
      window.open(path, '_blank');
    } else {
      // Handle internal Angular routes
      const url = this.router.serializeUrl(this.router.createUrlTree([path]));
      window.open(url, '_blank');
    }
  }

}

