import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatFeedCard } from './chat-feed-card';

describe('ChatFeedCard', () => {
  let component: ChatFeedCard;
  let fixture: ComponentFixture<ChatFeedCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatFeedCard]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatFeedCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
