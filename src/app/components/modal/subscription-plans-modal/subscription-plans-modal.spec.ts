import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionPlansModal } from './subscription-plans-modal';

describe('SubscriptionPlansModal', () => {
  let component: SubscriptionPlansModal;
  let fixture: ComponentFixture<SubscriptionPlansModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionPlansModal]
    }).compileComponents();

    fixture = TestBed.createComponent(SubscriptionPlansModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
