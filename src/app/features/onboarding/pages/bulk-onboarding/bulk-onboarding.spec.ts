import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkOnboarding } from './bulk-onboarding';

describe('BulkOnboarding', () => {
  let component: BulkOnboarding;
  let fixture: ComponentFixture<BulkOnboarding>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BulkOnboarding]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BulkOnboarding);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
