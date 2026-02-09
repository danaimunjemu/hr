import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkContractService } from '../../../services/work-contract.service';
import { WorkContract } from '../../../models/work-contract.model';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-work-contract-view',
  standalone: false,
  templateUrl: './work-contract-view.html',
  styles: [`
    :host {
      display: block;
      max-width: 800px;
      margin: 0 auto;
    }
    .detail-item {
      margin-bottom: 16px;
    }
    .detail-label {
      font-weight: 500;
      color: rgba(0, 0, 0, 0.85);
    }
    .detail-value {
      color: rgba(0, 0, 0, 0.65);
    }
  `]
})
export class WorkContractViewComponent implements OnInit {
  contract: WorkContract | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workContractService: WorkContractService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.loadContract(id);
      } else {
        this.router.navigate(['../'], { relativeTo: this.route });
      }
    });
  }

  loadContract(id: number): void {
    this.loading = true;
    this.workContractService.getById(id).subscribe({
      next: (data) => {
        this.contract = data;
        this.loading = false;
      },
      error: (err: any) => {
        this.message.error('Failed to load contract details');
        this.router.navigate(['../../'], { relativeTo: this.route });
      }
    });
  }

  onBack(): void {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}
