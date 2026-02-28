import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {
  ExitInterviewResponse,
  ExitInterviewSubmitPayload
} from '../../models/exit-interview.model';

interface ExitInterviewForm {
  provideFeedback: FormControl<boolean>;
  reasonForLeaving: FormControl<string | null>;
  managerRating: FormControl<1 | 2 | 3 | null>;
  workEnvironmentRating: FormControl<1 | 2 | 3 | null>;
  careerGrowthRating: FormControl<1 | 2 | 3 | null>;
  recommendCompanyRating: FormControl<1 | 2 | 3 | null>;
  companyDidWell: FormControl<string | null>;
  improvementAreas: FormControl<string | null>;
  considerReturning: FormControl<boolean | null>;
}

@Component({
  selector: 'app-exit-interview-form',
  standalone: false,
  templateUrl: './exit-interview-form.component.html',
  styleUrl: './exit-interview-form.component.scss'
})
export class ExitInterviewFormComponent implements OnChanges {
  @Input() submitted = false;
  @Input() model: ExitInterviewResponse | null = null;
  @Input() saving = false;

  @Output() save = new EventEmitter<ExitInterviewSubmitPayload>();

  readonly form: FormGroup<ExitInterviewForm>;

  readonly ratings: Array<1 | 2 | 3> = [1, 2, 3];

  constructor(
    fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.form = fb.group<ExitInterviewForm>({
      provideFeedback: fb.nonNullable.control(true),
      reasonForLeaving: fb.control<string | null>(null),
      managerRating: fb.control<1 | 2 | 3 | null>(null),
      workEnvironmentRating: fb.control<1 | 2 | 3 | null>(null),
      careerGrowthRating: fb.control<1 | 2 | 3 | null>(null),
      recommendCompanyRating: fb.control<1 | 2 | 3 | null>(null),
      companyDidWell: fb.control<string | null>(null),
      improvementAreas: fb.control<string | null>(null),
      considerReturning: fb.control<boolean | null>(null)
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['saving'] || changes['submitted']) {
      this.cdr.detectChanges();
    }

    if (this.submitted) {
      this.form.disable({ emitEvent: false });
    } else {
      this.form.enable({ emitEvent: false });
    }

    if (!this.model) {
      return;
    }

    this.form.patchValue({
      provideFeedback: !this.model.skipped,
      reasonForLeaving: this.model.reasonForLeaving || null,
      managerRating: this.model.managerRating ?? null,
      workEnvironmentRating: this.model.workEnvironmentRating ?? null,
      careerGrowthRating: this.model.careerGrowthRating ?? null,
      recommendCompanyRating: this.model.recommendCompanyRating ?? null,
      companyDidWell: this.model.companyDidWell || null,
      improvementAreas: this.model.improvementAreas || null,
      considerReturning: this.model.considerReturning ?? null
    });
    this.cdr.detectChanges();
  }

  submit(): void {
    if (this.submitted) {
      return;
    }

    const value = this.form.getRawValue();
    if (!value.provideFeedback) {
      this.save.emit({ skipped: true });
      this.cdr.detectChanges();
      return;
    }

    this.form.controls.reasonForLeaving.addValidators([Validators.required]);
    this.form.controls.managerRating.addValidators([Validators.required]);
    this.form.controls.workEnvironmentRating.addValidators([Validators.required]);
    this.form.controls.careerGrowthRating.addValidators([Validators.required]);
    this.form.controls.recommendCompanyRating.addValidators([Validators.required]);
    this.form.controls.reasonForLeaving.updateValueAndValidity();
    this.form.controls.managerRating.updateValueAndValidity();
    this.form.controls.workEnvironmentRating.updateValueAndValidity();
    this.form.controls.careerGrowthRating.updateValueAndValidity();
    this.form.controls.recommendCompanyRating.updateValueAndValidity();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.save.emit({
      skipped: false,
      reasonForLeaving: value.reasonForLeaving || undefined,
      managerRating: value.managerRating || undefined,
      workEnvironmentRating: value.workEnvironmentRating || undefined,
      careerGrowthRating: value.careerGrowthRating || undefined,
      recommendCompanyRating: value.recommendCompanyRating || undefined,
      companyDidWell: value.companyDidWell || undefined,
      improvementAreas: value.improvementAreas || undefined,
      considerReturning: value.considerReturning ?? undefined
    });
    this.cdr.detectChanges();
  }

  submittedOn(): string | null {
    return this.model?.submittedDate || this.model?.submittedAt || null;
  }
}
