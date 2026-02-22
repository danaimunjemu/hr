import { TestBed } from '@angular/core/testing';

import { BulkOnboarding } from './bulk-onboarding';

describe('BulkOnboarding', () => {
  let service: BulkOnboarding;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BulkOnboarding);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
