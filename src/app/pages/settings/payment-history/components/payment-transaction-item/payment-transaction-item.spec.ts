import { IonicModule } from '@ionic/angular';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PaymentTransactionItem } from './payment-transaction-item';

describe('PaymentTransactionItem', () => {
  let component: PaymentTransactionItem;
  let fixture: ComponentFixture<PaymentTransactionItem>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PaymentTransactionItem],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentTransactionItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
