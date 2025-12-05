import { IonicModule } from '@ionic/angular';
import { ForgotPassword } from './forgot-password';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

describe('Onboarding', () => {
  let component: ForgotPassword;
  let fixture: ComponentFixture<ForgotPassword>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ForgotPassword],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPassword);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
