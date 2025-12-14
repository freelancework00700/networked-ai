import { UserAdditionalInfo } from './user-additional-info';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('UserAdditionalInfo', () => {
  let component: UserAdditionalInfo;
  let fixture: ComponentFixture<UserAdditionalInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserAdditionalInfo]
    }).compileComponents();

    fixture = TestBed.createComponent(UserAdditionalInfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
