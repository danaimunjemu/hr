import { TestBed } from '@angular/core/testing';

import { Offboarding } from './offboarding';

describe('Offboarding', () => {
  let service: Offboarding;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Offboarding);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
