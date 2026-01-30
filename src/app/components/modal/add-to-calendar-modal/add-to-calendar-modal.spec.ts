import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddToCalendarModal } from './add-to-calendar-modal';

describe('AddToCalendarModal', () => {
  let component: AddToCalendarModal;
  let fixture: ComponentFixture<AddToCalendarModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddToCalendarModal]
    }).compileComponents();

    fixture = TestBed.createComponent(AddToCalendarModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
