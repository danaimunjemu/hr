import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

interface LeaveBalanceForm {
  leaveBalanceDays: FormControl<number>;
  carriedOverThreshold: FormControl<number>;
  dailyRate: FormControl<number>;
}

@Component({
  selector: 'app-final-leave-balance-page',
  standalone: false,
  templateUrl: './final-leave-balance-page.component.html',
  styleUrl: './final-leave-balance-page.component.scss'
})
export class FinalLeaveBalancePageComponent implements OnDestroy {
  readonly form: FormGroup<LeaveBalanceForm>;
  readonly offboardingId: string;

  private readonly destroy$ = new Subject<void>();

  constructor(
    fb: FormBuilder,
    private readonly router: Router,
    route: ActivatedRoute,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.offboardingId = route.snapshot.paramMap.get('offboardingId') || '';
    this.form = fb.group<LeaveBalanceForm>({
      leaveBalanceDays: fb.nonNullable.control(12, [Validators.required, Validators.min(0)]),
      carriedOverThreshold: fb.nonNullable.control(5, [Validators.required, Validators.min(0)]),
      dailyRate: fb.nonNullable.control(85, [Validators.required, Validators.min(0)])
    });

    this.form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get payableAmount(): number {
    const value = this.form.getRawValue();
    const payableDays = Math.max(0, value.leaveBalanceDays - value.carriedOverThreshold);
    return payableDays * value.dailyRate;
  }

  back(): void {
    this.router.navigate(['/app/offboarding-v2/case', this.offboardingId]);
  }
}
