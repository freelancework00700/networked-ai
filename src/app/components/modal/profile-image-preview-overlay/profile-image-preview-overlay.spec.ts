
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileImagePreviewOverlay } from './profile-image-preview-overlay';

describe('ProfileImagePreviewOverlay', () => {
  let component: ProfileImagePreviewOverlay;
  let fixture: ComponentFixture<ProfileImagePreviewOverlay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileImagePreviewOverlay]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileImagePreviewOverlay);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
