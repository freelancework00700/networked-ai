import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RsvpApproval } from './rsvp-approval';

describe('RsvpApproval', () => {
  let component: RsvpApproval;
  let fixture: ComponentFixture<RsvpApproval>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RsvpApproval]
    }).compileComponents();

    fixture = TestBed.createComponent(RsvpApproval);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
