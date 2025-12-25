import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePlan } from './create-plan';

describe('CreatePlan', () => {
  let component: CreatePlan;
  let fixture: ComponentFixture<CreatePlan>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePlan]
    }).compileComponents();

    fixture = TestBed.createComponent(CreatePlan);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
