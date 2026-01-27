import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { UnsubscribeConfirmModal } from './unsubscribe-confirm-modal';
describe('UnsubscribeConfirmModal', () => {
  let component: UnsubscribeConfirmModal;
  let fixture: ComponentFixture<UnsubscribeConfirmModal>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [UnsubscribeConfirmModal],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(UnsubscribeConfirmModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
