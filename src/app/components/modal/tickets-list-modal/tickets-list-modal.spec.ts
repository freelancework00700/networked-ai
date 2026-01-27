import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TicketsListModal } from './tickets-list-modal';
describe('TicketsListModal', () => {
  let component: TicketsListModal;
  let fixture: ComponentFixture<TicketsListModal>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TicketsListModal],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TicketsListModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
