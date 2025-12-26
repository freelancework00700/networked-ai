import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileSetupUserSuggestion } from './profile-setup-user-suggestion';

describe('ProfileSetupUserSuggestion', () => {
  let component: ProfileSetupUserSuggestion;
  let fixture: ComponentFixture<ProfileSetupUserSuggestion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileSetupUserSuggestion]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileSetupUserSuggestion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
