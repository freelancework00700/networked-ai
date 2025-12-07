import { EventCategoryModal } from './event-category-modal';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('EventCategoryModal', () => {
  let component: EventCategoryModal;
  let fixture: ComponentFixture<EventCategoryModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventCategoryModal]
    }).compileComponents();

    fixture = TestBed.createComponent(EventCategoryModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
