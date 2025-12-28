import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileOptionsPopover } from './profile-options-popover';

describe('ProfileOptionsPopover', () => {
  let component: ProfileOptionsPopover;
  let fixture: ComponentFixture<ProfileOptionsPopover>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileOptionsPopover]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileOptionsPopover);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
