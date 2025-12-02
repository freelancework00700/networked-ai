import { EmailInput } from './email-input';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('EmailInput', () => {
  let component: EmailInput;
  let fixture: ComponentFixture<EmailInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailInput]
    }).compileComponents();

    fixture = TestBed.createComponent(EmailInput);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
