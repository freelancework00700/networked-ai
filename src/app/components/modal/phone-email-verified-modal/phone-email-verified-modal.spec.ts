import { IonicModule } from '@ionic/angular';
import { PhoneEmailVerifiedModal } from './phone-email-verified-modal';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

describe('PhoneEmailVerifiedModal', () => {
  let component: PhoneEmailVerifiedModal;
  let fixture: ComponentFixture<PhoneEmailVerifiedModal>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PhoneEmailVerifiedModal ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PhoneEmailVerifiedModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
