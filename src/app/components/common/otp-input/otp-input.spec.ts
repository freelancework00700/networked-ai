import { OtpInput } from './otp-input';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('OtpInput', () => {
  let component: OtpInput;
  let fixture: ComponentFixture<OtpInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtpInput]
    }).compileComponents();

    fixture = TestBed.createComponent(OtpInput);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
