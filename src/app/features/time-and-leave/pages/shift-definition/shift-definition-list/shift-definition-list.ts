import { Component, OnInit } from '@angular/core';
import { ShiftDefinition } from '../../../models/shift-definition.model';
import { ShiftDefinitionService } from '../../../services/shift-definition.service';

@Component({
  selector: 'app-shift-definition-list',
  standalone: false,
  templateUrl: './shift-definition-list.html',
  styles: [`
    :host {
      display: block;
    }
    .action-btn {
      margin-right: 8px;
    }
  `]
})
export class ShiftDefinitionListComponent implements OnInit {
  loading = true;
  shifts: ShiftDefinition[] = [];

  constructor(private shiftDefinitionService: ShiftDefinitionService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.shiftDefinitionService.getAll().subscribe({
      next: (data) => {
        this.shifts = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load shift definitions', err);
        this.loading = false;
      }
    });
  }
}
