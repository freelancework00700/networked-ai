import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanSubscribers } from './plan-subscribers';

describe('PlanSubscribers', () => {
  let component: PlanSubscribers;
  let fixture: ComponentFixture<PlanSubscribers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanSubscribers]
    }).compileComponents();

    fixture = TestBed.createComponent(PlanSubscribers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
