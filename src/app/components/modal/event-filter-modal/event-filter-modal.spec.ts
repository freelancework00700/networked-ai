import { EventFilterModal } from './event-filter-modal';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('EventFilterModal', () => {
  let component: EventFilterModal;
  let fixture: ComponentFixture<EventFilterModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventFilterModal]
    }).compileComponents();

    fixture = TestBed.createComponent(EventFilterModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
