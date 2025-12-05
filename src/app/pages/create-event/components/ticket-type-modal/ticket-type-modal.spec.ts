import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TicketTypeModal } from './ticket-type-modal';
describe('TicketTypeModal', () => {
  let component: TicketTypeModal;
  let fixture: ComponentFixture<TicketTypeModal>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TicketTypeModal],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TicketTypeModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
