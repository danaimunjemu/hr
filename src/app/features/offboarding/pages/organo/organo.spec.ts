import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Organo } from './organo';

describe('Organo', () => {
  let component: Organo;
  let fixture: ComponentFixture<Organo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Organo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Organo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
