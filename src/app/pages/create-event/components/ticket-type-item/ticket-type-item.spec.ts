import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TicketTypeItem } from './ticket-type-item';

describe('TicketTypeItem', () => {
  let component: TicketTypeItem;
  let fixture: ComponentFixture<TicketTypeItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketTypeItem]
    }).compileComponents();

    fixture = TestBed.createComponent(TicketTypeItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
