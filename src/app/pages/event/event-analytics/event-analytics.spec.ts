import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventAnalytics } from './event-analytics';

describe('EventAnalytics', () => {
  let component: EventAnalytics;
  let fixture: ComponentFixture<EventAnalytics>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventAnalytics]
    }).compileComponents();

    fixture = TestBed.createComponent(EventAnalytics);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
