import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import {
  AssetAcknowledgePayload,
  AssetReturnPayload,
  OffboardingAsset
} from '../../models/offboarding-asset.model';

@Component({
  selector: 'app-assets-board',
  standalone: false,
  templateUrl: './assets-board.component.html',
  styleUrl: './assets-board.component.scss'
})
export class AssetsBoardComponent implements OnChanges {
  @Input() assets: OffboardingAsset[] = [];
  @Input() savingAssetId: string | null = null;

  @Output() returnAsset = new EventEmitter<{ assetId: string; payload: AssetReturnPayload }>();
  @Output() acknowledgeAsset = new EventEmitter<{
    assetId: string;
    payload: AssetAcknowledgePayload;
  }>();

  selectedAsset: OffboardingAsset | null = null;
  returnDrawerVisible = false;
  ackDrawerVisible = false;

  constructor(private readonly cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['assets'] || changes['savingAssetId']) {
      this.cdr.detectChanges();
    }
  }

  openReturnDrawer(asset: OffboardingAsset): void {
    this.selectedAsset = asset;
    this.returnDrawerVisible = true;
    this.cdr.detectChanges();
  }

  openAckDrawer(asset: OffboardingAsset): void {
    this.selectedAsset = asset;
    this.ackDrawerVisible = true;
    this.cdr.detectChanges();
  }

  closeDrawers(): void {
    this.returnDrawerVisible = false;
    this.ackDrawerVisible = false;
    this.selectedAsset = null;
    this.cdr.detectChanges();
  }

  onReturn(payload: AssetReturnPayload): void {
    if (!this.selectedAsset) {
      return;
    }
    this.returnAsset.emit({ assetId: this.selectedAsset.assetNoteId, payload });
    this.cdr.detectChanges();
  }

  onAck(payload: AssetAcknowledgePayload): void {
    if (!this.selectedAsset) {
      return;
    }
    this.acknowledgeAsset.emit({ assetId: this.selectedAsset.assetNoteId, payload });
    this.cdr.detectChanges();
  }
}
