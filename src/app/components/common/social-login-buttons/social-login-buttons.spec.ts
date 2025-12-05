import { IonicModule } from '@ionic/angular';
import { SocialLoginButtons } from './social-login-buttons';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

describe('SocialLoginButtons', () => {
  let component: SocialLoginButtons;
  let fixture: ComponentFixture<SocialLoginButtons>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SocialLoginButtons ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SocialLoginButtons);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
