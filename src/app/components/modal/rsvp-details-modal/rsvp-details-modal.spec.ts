import { RsvpDetailsModal } from './rsvp-details-modal';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('RsvpDetailsModal', () => {
  let component: RsvpDetailsModal;
  let fixture: ComponentFixture<RsvpDetailsModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RsvpDetailsModal]
    }).compileComponents();

    fixture = TestBed.createComponent(RsvpDetailsModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
