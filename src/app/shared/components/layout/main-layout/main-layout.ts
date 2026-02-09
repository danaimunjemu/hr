import { Component, OnInit } from '@angular/core';
import { CookiesService } from '../../../../core/storage/cookies.service';

@Component({
  selector: 'app-main-layout',
  standalone: false,
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout implements OnInit {

  constructor(
    private cookiesService: CookiesService,
  ) {}

  portal?: any;

  ngOnInit(): void {
    this.portal = this.cookiesService.getCookie('portal');
  }


}
