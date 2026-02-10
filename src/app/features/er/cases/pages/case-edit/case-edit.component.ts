import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ErCaseService } from '../../services/er-case.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-case-edit',
  standalone: false,
  templateUrl: './case-edit.component.html'
})
export class CaseEditComponent implements OnInit {
  form: FormGroup;
  loading = false;
  caseId!: number;
  caseNumber = '';

  constructor(
    private fb: FormBuilder,
    private caseService: ErCaseService,
    private router: Router,
    private route: ActivatedRoute,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      priority: [null, [Validators.required]],
      status: [null, [Validators.required]],
      summary: [null, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.caseId = +this.route.snapshot.params['id'];
    this.loadCase();
  }

  loadCase(): void {
    this.loading = true;
    this.caseService.getCase(this.caseId).subscribe({
      next: (data) => {
        this.caseNumber = data.caseNumber || '';
        this.form.patchValue({
          priority: data.priority,
          status: data.status,
          summary: data.summary
        });
        this.loading = false;
      },
      error: () => {
        this.message.error('Failed to load case');
        this.loading = false;
      }
    });
  }

  submit(): void {
    if (this.form.valid) {
      this.loading = true;
      const val = this.form.value;
      const payload: any = {
        id: this.caseId,
        caseNumber: this.caseNumber,
        priority: val.priority,
        status: val.status,
        summary: val.summary
      };

      this.caseService.updateCase(payload).subscribe({
        next: () => {
          this.message.success('Case updated successfully');
          this.router.navigate(['../../'], { relativeTo: this.route });
        },
        error: () => {
          this.message.error('Failed to update case');
          this.loading = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}
