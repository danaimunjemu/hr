import { Component, OnInit } from '@angular/core';
import { WorkContract } from '../../../models/work-contract.model';
import { WorkContractService } from '../../../services/work-contract.service';

@Component({
  selector: 'app-work-contract-list',
  standalone: false,
  templateUrl: './work-contract-list.html',
  styles: [`
    :host {
      display: block;
    }
    .action-btn {
      margin-right: 8px;
    }
  `]
})
export class WorkContractListComponent implements OnInit {
  loading = true;
  contracts: WorkContract[] = [];

  constructor(private workContractService: WorkContractService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.workContractService.getAll().subscribe({
      next: (data) => {
        this.contracts = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load work contracts', err);
        this.loading = false;
      }
    });
  }
}
