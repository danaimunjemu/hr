import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllEmployees } from './all-employees';

describe('AllEmployees', () => {
  let component: AllEmployees;
  let fixture: ComponentFixture<AllEmployees>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AllEmployees]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllEmployees);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
