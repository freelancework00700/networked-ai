import { ProfileSetup } from './profile-setup';
import { TestBed, ComponentFixture } from '@angular/core/testing';

describe('ProfileSetup', () => {
  let component: ProfileSetup;
  let fixture: ComponentFixture<ProfileSetup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileSetup]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileSetup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
