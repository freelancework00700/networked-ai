import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventQr } from './event-qr';

describe('EventQr', () => {
  let component: EventQr;
  let fixture: ComponentFixture<EventQr>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventQr]
    }).compileComponents();

    fixture = TestBed.createComponent(EventQr);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
