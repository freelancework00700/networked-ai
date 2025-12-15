import { UpcomingEventCard } from './upcoming-event-card';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('UpcomingEventCard', () => {
  let component: UpcomingEventCard;
  let fixture: ComponentFixture<UpcomingEventCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpcomingEventCard]
    }).compileComponents();

    fixture = TestBed.createComponent(UpcomingEventCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
