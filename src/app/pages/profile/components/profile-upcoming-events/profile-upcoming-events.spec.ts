import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ProfileUpcomingEvents } from './profile-upcoming-events';

describe('ProfileUpcomingEvents', () => {
  let component: ProfileUpcomingEvents;
  let fixture: ComponentFixture<ProfileUpcomingEvents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileUpcomingEvents]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileUpcomingEvents);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
