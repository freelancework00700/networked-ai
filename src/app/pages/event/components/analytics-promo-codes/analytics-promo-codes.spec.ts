import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyticsPromoCodes } from './analytics-promo-codes';

describe('AnalyticsPromoCodes', () => {
  let component: AnalyticsPromoCodes;
  let fixture: ComponentFixture<AnalyticsPromoCodes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyticsPromoCodes]
    }).compileComponents();

    fixture = TestBed.createComponent(AnalyticsPromoCodes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
