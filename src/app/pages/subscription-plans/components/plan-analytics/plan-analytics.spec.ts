import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanAnalytics } from './plan-analytics';

describe('PlanAnalytics', () => {
  let component: PlanAnalytics;
  let fixture: ComponentFixture<PlanAnalytics>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanAnalytics]
    }).compileComponents();

    fixture = TestBed.createComponent(PlanAnalytics);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
