import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionEventCard } from './subscription-event-card';

describe('SubscriptionEventCard', () => {
  let component: SubscriptionEventCard;
  let fixture: ComponentFixture<SubscriptionEventCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionEventCard]
    }).compileComponents();

    fixture = TestBed.createComponent(SubscriptionEventCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
