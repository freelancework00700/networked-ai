import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketsModal } from './tickets-modal';

describe('TicketsModal', () => {
  let component: TicketsModal;
  let fixture: ComponentFixture<TicketsModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketsModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketsModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
