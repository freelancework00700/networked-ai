import { UserSettingToggle } from './user-setting-toggle';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('UserSettingToggle', () => {
  let component: UserSettingToggle;
  let fixture: ComponentFixture<UserSettingToggle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserSettingToggle]
    }).compileComponents();

    fixture = TestBed.createComponent(UserSettingToggle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
