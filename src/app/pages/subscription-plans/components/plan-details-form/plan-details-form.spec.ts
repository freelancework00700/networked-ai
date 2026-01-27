import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanDetailsForm } from './plan-details-form';

describe('PlanDetailsForm', () => {
  let component: PlanDetailsForm;
  let fixture: ComponentFixture<PlanDetailsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanDetailsForm]
    }).compileComponents();

    fixture = TestBed.createComponent(PlanDetailsForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
