import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventUserList } from './event-user-list';

describe('EventUserList', () => {
  let component: EventUserList;
  let fixture: ComponentFixture<EventUserList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventUserList]
    }).compileComponents();

    fixture = TestBed.createComponent(EventUserList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
