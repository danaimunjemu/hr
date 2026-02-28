import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {
  AssetReturnPayload,
  AssetReturnStatus,
  OffboardingAsset
} from '../../models/offboarding-asset.model';

interface AssetReturnForm {
  returnStatus: FormControl<AssetReturnStatus>;
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

  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<AssetReturnPayload>();

  readonly form: FormGroup<AssetReturnForm>;

  readonly statuses: AssetReturnStatus[] = ['RETURNED', 'RETURNED_DAMAGED', 'NOT_RETURNED'];

  constructor(
    fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.form = fb.group<AssetReturnForm>({
      returnStatus: fb.nonNullable.control('RETURNED', [Validators.required]),
      returnDate: fb.nonNullable.control(new Date().toISOString().slice(0, 10), [Validators.required]),
      conditionOnReturn: fb.nonNullable.control('', [Validators.required]),
      remarks: fb.control<string | null>(null)
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] || changes['asset'] || changes['saving']) {
      this.cdr.detectChanges();
    }
  }

  close(): void {
    this.closed.emit();
    this.cdr.detectChanges();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.submitted.emit({
      returnStatus: value.returnStatus,
      returnDate: value.returnDate,
      conditionOnReturn: value.conditionOnReturn,
      remarks: value.remarks || undefined
    });
    this.cdr.detectChanges();
  }
}
