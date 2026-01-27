import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanPreview } from './plan-preview';

describe('PlanPreview', () => {
  let component: PlanPreview;
  let fixture: ComponentFixture<PlanPreview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanPreview]
    }).compileComponents();

    fixture = TestBed.createComponent(PlanPreview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
