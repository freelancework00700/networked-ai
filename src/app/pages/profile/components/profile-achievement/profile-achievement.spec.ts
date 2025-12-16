import { ProfileAchievement } from './profile-achievement';
import { TestBed, ComponentFixture } from '@angular/core/testing';

describe('ProfileAchievement', () => {
  let component: ProfileAchievement;
  let fixture: ComponentFixture<ProfileAchievement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileAchievement]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileAchievement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
