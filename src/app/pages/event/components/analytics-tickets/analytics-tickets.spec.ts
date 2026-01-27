import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyticsTickets } from './analytics-tickets';

describe('AnalyticsTickets', () => {
  let component: AnalyticsTickets;
  let fixture: ComponentFixture<AnalyticsTickets>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyticsTickets]
    }).compileComponents();

    fixture = TestBed.createComponent(AnalyticsTickets);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
