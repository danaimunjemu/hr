import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {
  AssetReturnPayload,
  OffboardingAsset
} from '../../models/offboarding-asset.model';

interface AssetReturnForm {
  returned: FormControl<boolean>;
  returnDate: FormControl<string>;
  conditionOnReturn: FormControl<string>;
  remarks: FormControl<string | null>;
}

@Component({
  selector: 'app-asset-return-drawer',
  standalone: false,
  templateUrl: './asset-return-drawer.component.html',
  styleUrl: './asset-return-drawer.component.scss'
})
export class AssetReturnDrawerComponent implements OnChanges {
  @Input() visible = false;
  @Input() saving = false;
  @Input() asset: OffboardingAsset | null = null;
  @Input() offboardingId = 0;

  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<AssetReturnPayload>();

  readonly form: FormGroup<AssetReturnForm>;
  readonly returnedConditionOptions = ['Good', 'Fair', 'Damaged'];
  readonly notReturnedConditionOptions = ['Lost', 'Stolen', 'N/A'];

  constructor(
    fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.form = fb.group<AssetReturnForm>({
      returned: fb.nonNullable.control(true, [Validators.required]),
      returnDate: fb.nonNullable.control(new Date().toISOString().slice(0, 10), [Validators.required]),
      conditionOnReturn: fb.nonNullable.control('', [Validators.required]),
      remarks: fb.control<string | null>(null)
    });

    this.form.controls.returned.valueChanges.subscribe(() => {
      this.syncConditionForReturnedState();
      this.cdr.detectChanges();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['asset']) {
      const returned = this.isAssetReturned(this.asset);
      const defaultCondition = returned ? 'Good' : 'N/A';
      const condition = this.isValidConditionForState(
        this.asset?.conditionOnReturn || defaultCondition,
        returned
      )
        ? (this.asset?.conditionOnReturn || defaultCondition)
        : defaultCondition;

      this.form.reset(
        {
          returned,
          returnDate: this.asset?.returnDate || new Date().toISOString().slice(0, 10),
          conditionOnReturn: condition,
          remarks: this.asset?.remarks || null
        },
        { emitEvent: false }
      );
      this.syncConditionForReturnedState();
    }

    if (changes['visible'] || changes['asset'] || changes['saving']) {
      this.cdr.detectChanges();
    }
  }

  get availableConditionOptions(): string[] {
    return this.form.controls.returned.value
      ? this.returnedConditionOptions
      : this.notReturnedConditionOptions;
  }

  close(): void {
    this.closed.emit();
    this.cdr.detectChanges();
  }

  submit(): void {
    this.syncConditionForReturnedState();
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    if (!this.isValidConditionForState(value.conditionOnReturn, value.returned)) {
      this.form.controls.conditionOnReturn.setErrors({ invalidConditionForState: true });
      this.form.controls.conditionOnReturn.markAsTouched();
      return;
    }
    this.submitted.emit({
      returned: value.returned,
      returnDate: value.returnDate,
      conditionOnReturn: value.conditionOnReturn,
      remarks: value.remarks || undefined,
      offboardingId: this.offboardingId
    });
    this.cdr.detectChanges();
  }

  private syncConditionForReturnedState(): void {
    const current = this.form.controls.conditionOnReturn.value;
    if (!this.isValidConditionForState(current, this.form.controls.returned.value)) {
      this.form.controls.conditionOnReturn.setValue(this.availableConditionOptions[0], { emitEvent: false });
    }
    this.form.controls.conditionOnReturn.updateValueAndValidity({ emitEvent: false });
  }

  private isValidConditionForState(condition: string, returned: boolean): boolean {
    const allowed = returned ? this.returnedConditionOptions : this.notReturnedConditionOptions;
    return allowed.includes(condition);
  }

  private isAssetReturned(asset: OffboardingAsset | null): boolean {
    if (!asset) {
      return true;
    }
    const withReturned = asset as OffboardingAsset & { returned?: boolean | null };
    if (typeof withReturned.returned === 'boolean') {
      return withReturned.returned;
    }
    return asset.returnStatus !== 'NOT_RETURNED';
  }
}
