import { HostEventPromoCard } from './host-event-promo-card';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('HostEventPromoCard', () => {
  let component: HostEventPromoCard;
  let fixture: ComponentFixture<HostEventPromoCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostEventPromoCard]
    }).compileComponents();

    fixture = TestBed.createComponent(HostEventPromoCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
