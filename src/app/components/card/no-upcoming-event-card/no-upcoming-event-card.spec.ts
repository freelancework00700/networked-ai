import { NoUpcomingEventCard } from './no-upcoming-event-card';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('NoUpcomingEventCard', () => {
  let component: NoUpcomingEventCard;
  let fixture: ComponentFixture<NoUpcomingEventCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoUpcomingEventCard]
    }).compileComponents();

    fixture = TestBed.createComponent(NoUpcomingEventCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
