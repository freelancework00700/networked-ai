import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileImageConfirmModal } from './profile-image-confirm-modal';

describe('ProfileImageConfirmModal', () => {
  let component: ProfileImageConfirmModal;
  let fixture: ComponentFixture<ProfileImageConfirmModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileImageConfirmModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileImageConfirmModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
