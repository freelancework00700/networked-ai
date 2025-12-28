import { ProfileHeaderToolbar } from './profile-header-toolbar';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('ProfileHeaderToolbar', () => {
  let component: ProfileHeaderToolbar;
  let fixture: ComponentFixture<ProfileHeaderToolbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileHeaderToolbar]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileHeaderToolbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
