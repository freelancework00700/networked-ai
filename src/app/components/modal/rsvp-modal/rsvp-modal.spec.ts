import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RsvpModal } from './rsvp-modal';

describe('RsvpModal', () => {
  let component: RsvpModal;
  let fixture: ComponentFixture<RsvpModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RsvpModal]
    }).compileComponents();

    fixture = TestBed.createComponent(RsvpModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
