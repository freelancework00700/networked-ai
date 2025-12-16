import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ProfileAttendedEvents } from './profile-attended-events';

describe('ProfileAttendedEvents', () => {
  let component: ProfileAttendedEvents;
  let fixture: ComponentFixture<ProfileAttendedEvents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileAttendedEvents]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileAttendedEvents);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
