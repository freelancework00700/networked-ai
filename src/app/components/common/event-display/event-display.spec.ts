import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventDisplay } from './event-display';

describe('EventDisplay', () => {
  let component: EventDisplay;
  let fixture: ComponentFixture<EventDisplay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventDisplay]
    }).compileComponents();

    fixture = TestBed.createComponent(EventDisplay);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
