import { DateTimeModal } from './date-time-modal';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('DateTimeModal', () => {
  let component: DateTimeModal;
  let fixture: ComponentFixture<DateTimeModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateTimeModal]
    }).compileComponents();

    fixture = TestBed.createComponent(DateTimeModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
