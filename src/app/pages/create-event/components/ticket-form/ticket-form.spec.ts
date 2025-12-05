import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TicketForm } from './ticket-form';

describe('TicketForm', () => {
  let component: TicketForm;
  let fixture: ComponentFixture<TicketForm>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TicketForm],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TicketForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
