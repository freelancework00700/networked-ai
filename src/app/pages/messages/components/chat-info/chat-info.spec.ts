import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatInfo } from './chat-info';

describe('ChatInfo', () => {
  let component: ChatInfo;
  let fixture: ComponentFixture<ChatInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatInfo]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatInfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
