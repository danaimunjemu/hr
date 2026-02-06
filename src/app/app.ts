import { Component, signal, OnInit } from '@angular/core';
import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss'
})
export class App implements OnInit{
  protected readonly title = signal('hr-frontend');

  ngOnInit(): void {
    initFlowbite();
  }

}
