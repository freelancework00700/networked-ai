import { ProfileLink } from './profile-link';
import { TestBed, ComponentFixture } from '@angular/core/testing';

describe('ProfileLink', () => {
  let component: ProfileLink;
  let fixture: ComponentFixture<ProfileLink>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileLink]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileLink);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
