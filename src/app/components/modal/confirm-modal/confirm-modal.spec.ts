import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DateModal } from './confirm-modal';

describe('DateModal', () => {
  let component: DateModal;
  let fixture: ComponentFixture<DateModal>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DateModal],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DateModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
