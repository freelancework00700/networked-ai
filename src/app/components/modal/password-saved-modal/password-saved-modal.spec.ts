import { IonicModule } from '@ionic/angular';
import { PasswordSavedModal } from './password-saved-modal';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

describe('PasswordSavedModal', () => {
  let component: PasswordSavedModal;
  let fixture: ComponentFixture<PasswordSavedModal>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PasswordSavedModal],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordSavedModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
