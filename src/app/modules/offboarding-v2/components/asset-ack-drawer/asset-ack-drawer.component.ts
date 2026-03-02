import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import {
  AssetAcknowledgePayload,
  OffboardingAsset
} from '../../models/offboarding-asset.model';

interface AssetAckForm {
  employeeConfirmed: FormControl<boolean | null>;
  disputeReason: FormControl<string | null>;
  evidenceFilePath: FormControl<string | null>;
}

@Component({
  selector: 'app-asset-ack-drawer',
  standalone: false,
  templateUrl: './asset-ack-drawer.component.html',
  styleUrl: './asset-ack-drawer.component.scss'
})
export class AssetAckDrawerComponent implements OnChanges {
  @Input() visible = false;
  @Input() saving = false;
  @Input() asset: OffboardingAsset | null = null;

  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<AssetAcknowledgePayload>();

  readonly form: FormGroup<AssetAckForm>;

  constructor(
    fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.form = fb.group<AssetAckForm>({
      employeeConfirmed: fb.control<boolean | null>(null, [Validators.required]),
      disputeReason: fb.control<string | null>(null),
      evidenceFilePath: fb.control<string | null>(null)
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] || changes['asset'] || changes['saving']) {
      this.cdr.detectChanges();
    }
  }

  beforeUpload = (file: NzUploadFile): boolean => {
    this.form.patchValue({ evidenceFilePath: file.name });
    this.cdr.detectChanges();
    return false;
  };

  close(): void {
    this.closed.emit();
    this.cdr.detectChanges();
  }

  submit(): void {
    const confirmed = this.form.controls.employeeConfirmed.value;
    if (confirmed === false) {
      this.form.controls.disputeReason.addValidators([Validators.required, Validators.maxLength(400)]);
    } else {
      this.form.controls.disputeReason.clearValidators();
    }
    this.form.controls.disputeReason.updateValueAndValidity();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.submitted.emit({
      employeeConfirmed: Boolean(value.employeeConfirmed),
      disputeReason: value.disputeReason || undefined,
      evidenceFilePath: value.evidenceFilePath || undefined
    });
    this.cdr.detectChanges();
  }
}
