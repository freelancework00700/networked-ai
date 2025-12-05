import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SubscriptionInput } from './subscription-input';
describe('SubscriptionInput', () => {
  let component: SubscriptionInput;
  let fixture: ComponentFixture<SubscriptionInput>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SubscriptionInput],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SubscriptionInput);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
