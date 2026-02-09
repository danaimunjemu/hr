import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ShiftDefinitionService } from '../../../services/shift-definition.service';
import { ShiftDefinition } from '../../../models/shift-definition.model';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-shift-definition-view',
  standalone: false,
  templateUrl: './shift-definition-view.html',
  styles: [`
    :host {
      display: block;
      max-width: 800px;
      margin: 0 auto;
    }
  `]
})
export class ShiftDefinitionViewComponent implements OnInit {
  shift: ShiftDefinition | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private shiftDefinitionService: ShiftDefinitionService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.loadShift(id);
      } else {
        this.router.navigate(['../../'], { relativeTo: this.route });
      }
    });
  }

  loadShift(id: number): void {
    this.loading = true;
    this.shiftDefinitionService.getById(id).subscribe({
      next: (data) => {
        this.shift = data;
        this.loading = false;
      },
      error: (err: any) => {
        this.message.error('Failed to load shift details');
        this.router.navigate(['../../'], { relativeTo: this.route });
      }
    });
  }

  onBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
