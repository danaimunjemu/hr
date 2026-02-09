import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeGroupService } from '../../../services/employee-group.service';
import { EmployeeGroup } from '../../../models/employee-group.model';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-employee-group-view',
  standalone: false,
  templateUrl: './employee-group-view.html',
  styles: [`
    :host {
      display: block;
      max-width: 800px;
      margin: 0 auto;
    }
  `]
})
export class EmployeeGroupViewComponent implements OnInit {
  group: EmployeeGroup | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeGroupService: EmployeeGroupService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.loadGroup(id);
      } else {
        this.router.navigate(['../../'], { relativeTo: this.route });
      }
    });
  }

  loadGroup(id: number): void {
    this.loading = true;
    this.employeeGroupService.getById(id).subscribe({
      next: (data) => {
        this.group = data;
        this.loading = false;
      },
      error: (err: any) => {
        this.message.error('Failed to load employee group details');
        this.router.navigate(['../../'], { relativeTo: this.route });
      }
    });
  }

  onBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
