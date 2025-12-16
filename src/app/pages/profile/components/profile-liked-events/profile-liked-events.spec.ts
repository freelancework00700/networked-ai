import { ProfileLikedEvents } from './profile-liked-events';
import { TestBed, ComponentFixture } from '@angular/core/testing';

describe('ProfileLikedEvents', () => {
  let component: ProfileLikedEvents;
  let fixture: ComponentFixture<ProfileLikedEvents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileLikedEvents]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileLikedEvents);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
