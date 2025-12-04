import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { IncognitoModeInput } from './incognito-mode-input';

describe('IncognitoModeInputComponent', () => {
  let component: IncognitoModeInput;
  let fixture: ComponentFixture<IncognitoModeInput>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [IncognitoModeInput],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(IncognitoModeInput);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
