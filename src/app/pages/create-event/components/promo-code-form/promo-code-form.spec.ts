import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PromoCodeForm } from './promo-code-form';
describe('PromoCodeForm', () => {
  let component: PromoCodeForm;
  let fixture: ComponentFixture<PromoCodeForm>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PromoCodeForm],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PromoCodeForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
