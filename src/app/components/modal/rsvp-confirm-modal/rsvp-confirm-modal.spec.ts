import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RsvpConfirmModal } from './rsvp-confirm-modal';

describe('RsvpConfirmModal', () => {
  let component: RsvpConfirmModal;
  let fixture: ComponentFixture<RsvpConfirmModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RsvpConfirmModal]
    }).compileComponents();

    fixture = TestBed.createComponent(RsvpConfirmModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
