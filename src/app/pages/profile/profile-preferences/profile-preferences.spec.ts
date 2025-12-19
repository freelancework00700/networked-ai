import { ProfilePreferences } from './profile-preferences';
import { TestBed, ComponentFixture } from '@angular/core/testing';

describe('ProfilePreferences', () => {
  let component: ProfilePreferences;
  let fixture: ComponentFixture<ProfilePreferences>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfilePreferences]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilePreferences);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
