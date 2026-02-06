import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'nerd-button',
  standalone: false,
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class Button implements OnInit, OnDestroy {

  constructor(
    // private handleErrorService: HandleErrorService
  ) {
  }

  @Input() label: string = 'Button';
  @Input() loading: boolean = false;
  @Input() disableButton: boolean = false;
  @Input() style: 'primary' | 'secondary' | 'gradient' | 'cancel' | 'alternate' | 'white' = 'primary';
  @Input() size: 'lg' | 'md' | 'sm' = 'md';
  @Input() icon: string = '';
  @Output() buttonClick: EventEmitter<void> = new EventEmitter<void>();

  // subs = new SubscriptionsManager();


  onClick(): void {
    this.buttonClick.emit();
  }

  ngOnInit() {
    // this.subs.add = this.handleErrorService.isLoading.subscribe((res: any) => {
    //   this.loading = res;
    // })
  }

  ngOnDestroy() {
    // this.subs.dispose();
  }

}
