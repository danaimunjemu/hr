import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ErPartyService } from '../../services/er-party.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-party-edit',
  standalone: false,
  template: `
    <div class="page-header">
      <h1 class="text-2xl font-bold mb-4">Edit Party Details</h1>
    </div>

    <nz-card>
      <form nz-form [formGroup]="form" (ngSubmit)="submit()" nzLayout="vertical">
        
        <nz-form-item>
          <nz-form-label>Notes</nz-form-label>
          <nz-form-control>
            <textarea nz-input formControlName="notes" rows="4" placeholder="Update details..."></textarea>
          </nz-form-control>
        </nz-form-item>

        <div class="flex justify-end gap-2">
          <button nz-button type="button" (click)="cancel()">Cancel</button>
          <button nz-button nzType="primary" type="submit" [nzLoading]="loading()">Update Party</button>
        </div>
      </form>
    </nz-card>
  `
})
export class PartyEditComponent implements OnInit {
  form: FormGroup;
  loading: WritableSignal<boolean> = signal(false);
  partyId!: number;

  constructor(
    private fb: FormBuilder,
    private partyService: ErPartyService,
    private router: Router,
    private route: ActivatedRoute,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      notes: [null]
    });
  }

  ngOnInit(): void {
    this.partyId = +this.route.snapshot.params['id'];
    this.loadParty();
  }

  loadParty(): void {
    this.loading.set(true);
    this.partyService.getParty(this.partyId).subscribe({
      next: (data) => {
        this.form.patchValue({
          notes: data.notes
        });
        this.loading.set(false);
      },
      error: () => {
        this.message.error('Failed to load party');
        this.loading.set(false);
      }
    });
  }

  submit(): void {
    if (this.form.valid) {
      this.loading.set(true);
      const val = this.form.value;
      const payload = {
        id: this.partyId,
        notes: val.notes
      };

      this.partyService.updateParty(payload).subscribe({
        next: () => {
          this.message.success('Party updated successfully');
          this.router.navigate(['../../'], { relativeTo: this.route });
        },
        error: () => {
          this.message.error('Failed to update party');
          this.loading.set(false);
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}
