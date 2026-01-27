import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatEventCard } from './chat-event-card';

describe('ChatEventCard', () => {
  let component: ChatEventCard;
  let fixture: ComponentFixture<ChatEventCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatEventCard]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatEventCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
