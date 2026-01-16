import { IonicModule } from '@ionic/angular';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { UserSubscriptionPlans } from './user-subscription-plans';

describe('UserSubscriptionPlans', () => {
  let component: UserSubscriptionPlans;
  let fixture: ComponentFixture<UserSubscriptionPlans>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [UserSubscriptionPlans],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(UserSubscriptionPlans);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
