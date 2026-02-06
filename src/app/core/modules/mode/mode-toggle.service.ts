import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { Mode } from './mode-toggle.model';
import { ModeStorage, MODE_STORAGE_SERVICE } from './mode-storage.service';

@Injectable({ providedIn: 'root' })
export class ModeToggleService {
  private currentMode: Mode = Mode.LIGHT;
  private mode$ = new BehaviorSubject<Mode>(this.currentMode);

  readonly modeChanged$ = this.mode$.asObservable();

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(MODE_STORAGE_SERVICE) private modeStorage: ModeStorage
  ) {
    this.init();
  }

  private init() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const stored = this.modeStorage.get();

    const mode = stored || (prefersDark ? Mode.DARK : Mode.LIGHT);
    this.apply(mode);
  }

  changeMode(mode: Mode) {
    this.apply(mode);
  }

  getMode(): Mode {
    return this.modeStorage.get();
  }

  private apply(mode: Mode) {
    this.document.body.classList.remove(Mode.LIGHT, Mode.DARK);
    this.document.body.classList.add(mode);
    this.currentMode = mode;
    this.modeStorage.save(mode);
    this.mode$.next(mode);
  }
}
