import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PromoCodeFormModal } from './promo-code-form-modal';
describe('PromoCodeFormModal', () => {
  let component: PromoCodeFormModal;
  let fixture: ComponentFixture<PromoCodeFormModal>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PromoCodeFormModal],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PromoCodeFormModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
