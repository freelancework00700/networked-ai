import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanEvents } from './plan-events';

describe('PlanEvents', () => {
  let component: PlanEvents;
  let fixture: ComponentFixture<PlanEvents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanEvents]
    }).compileComponents();

    fixture = TestBed.createComponent(PlanEvents);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
