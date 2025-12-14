import { UserPersonalInfo } from './user-personal-info';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('UserPersonalInfo', () => {
  let component: UserPersonalInfo;
  let fixture: ComponentFixture<UserPersonalInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserPersonalInfo]
    }).compileComponents();

    fixture = TestBed.createComponent(UserPersonalInfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
