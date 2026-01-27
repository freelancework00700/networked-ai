import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TicketTypeCard } from './ticket-type-card';

describe('TicketTypeCard', () => {
  let component: TicketTypeCard;
  let fixture: ComponentFixture<TicketTypeCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketTypeCard]
    }).compileComponents();

    fixture = TestBed.createComponent(TicketTypeCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
